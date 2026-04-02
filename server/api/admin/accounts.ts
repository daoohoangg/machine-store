import { useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = useSupabase()

  try {
    if (method === 'GET') {
      const query = getQuery(event)
      const page = Math.max(1, parseInt(query.page as string) || 1)
      const pageSize = parseInt(query.pageSize as string) || 20
      const search = ((query.search as string) || '').toLowerCase().trim()

      const abahaToken = process.env.ABAHA_TOKEN || useRuntimeConfig().public.abahaToken
      
      if (!abahaToken) {
        throw createError({ statusCode: 500, statusMessage: 'ABAHA_TOKEN is missing' })
      }

      // Fetch specific page from Abaha CRM
      // The Abaha API typically returns ~100 items per page by default.
      // We'll proxy the requested page.
      const res: any = await $fetch(`https://publicapi.abaha.vn/customer/index?token=${abahaToken}&page=${page}${search ? `&search=${encodeURIComponent(search)}` : ''}`)
      
      const abahaCustomers = Array.isArray(res?.data?.customers) ? res.data.customers : []
      const total = res?.data?.total || abahaCustomers.length
      const totalPages = res?.data?.last_page || Math.ceil(total / 100)

      // Map Abaha customers to our internal format (similar to what was done before)
      const items = abahaCustomers.map((c: any) => ({
        id: `abaha_${c.id}`,
        phone: c.tel || '',
        full_name: c.name || '',
        role: 'user', // Default role since we are no longer using Supabase for permissions here
        status: 'active',
        last_login: null,
        created_at: new Date().toISOString(),
        premium: c.premium || 0,
        premium_point: c.premium_point || 0,
        premium_name: c.premium_name || ''
      }))

      return { 
        items, 
        total, 
        page: res?.data?.current_page || page, 
        pageSize: items.length, 
        totalPages 
      }
    }

    if (method === 'POST' || method === 'PUT') {
      const body = await readBody(event)
      const { phone, full_name, role, status, gender, birth_date, email, address, location_name, invite_phone } = body

      if (!phone) {
        throw createError({ statusCode: 400, statusMessage: 'Số điện thoại là bắt buộc' })
      }

      // Sync/Update account info to Abaha
      const abahaToken = process.env.ABAHA_TOKEN || useRuntimeConfig().public.abahaToken;
      if (abahaToken) {
        const abahaBody: any = { tel: phone }
        if (full_name) abahaBody.name = full_name
        if (address) abahaBody.address = address
        if (location_name) abahaBody.location_name = location_name
        if (birth_date) abahaBody.birth_date = birth_date
        if (email) abahaBody.email = email
        if (gender) abahaBody.gender = gender
        if (invite_phone) abahaBody.invite_phone = invite_phone

        await $fetch(`https://publicapi.abaha.vn/customer/create?token=${abahaToken}`, {
          method: 'POST',
          body: abahaBody
        });
        console.log('[Abaha API] Successfully synced account:', phone);
      }

      return { success: true, message: 'Cập nhật tài khoản Abaha thành công' }
    }

    if (method === 'DELETE') {
      // Typically Abaha doesn't have a public 'delete' customer API via token easily available,
      // but if strictly requested, we would call it here. For now, since Supabase is gone,
      // we'll just return success as a placeholder if Abaha doesn't support it.
      return { success: true, message: 'Thao tác xóa không được hỗ trợ trực tiếp trên Abaha thông qua API này' }
    }
  } catch (err: any) {
    console.error('[Admin Accounts API Error]:', err)
    throw createError({
      statusCode: 500,
      statusMessage: `Lỗi API: ${err.message}`
    })
  }
})
