import { useSupabase } from '../../utils/supabase'
import { requireAdmin } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const method = getMethod(event)
  const supabase = useSupabase()

  try {
    if (method === 'GET') {
      const abahaToken = process.env.ABAHA_TOKEN || useRuntimeConfig().public.abahaToken
      
      if (!abahaToken) {
        throw createError({ statusCode: 500, statusMessage: 'ABAHA_TOKEN is missing' })
      }

      const mapCustomer = (c: any) => ({
        id: `abaha_${c.id}`,
        phone: c.tel || '',
        full_name: c.name || '',
        role: 'user',
        status: 'active',
        last_login: null,
        created_at: new Date().toISOString(),
        premium: c.premium || 0,
        premium_point: c.premium_point || 0,
        premium_name: c.premium_name || ''
      })

      const buildUrl = (p: number) =>
        `https://publicapi.abaha.vn/customer/index?token=${abahaToken}&page=${p}`

      // Fetch first 20 pages to get a good "total" and enable local search
      // Using batching to be polite to the API
      const MAX_PAGES = 20
      const BATCH_SIZE = 5
      let allCustomers: any[] = []

      // Fetch Page 1 first to check if we have data
      try {
        const firstPage: any = await $fetch(buildUrl(1))
        const customers = Array.isArray(firstPage?.data?.customers) 
          ? firstPage.data.customers 
          : (Array.isArray(firstPage?.data) ? firstPage.data : [])
        
        if (customers.length === 0) {
          return { items: [], total: 0 }
        }
        allCustomers = [...customers]

        // Fetch remaining pages in batches
        for (let i = 2; i <= MAX_PAGES; i += BATCH_SIZE) {
          const batch = []
          for (let j = i; j < i + BATCH_SIZE && j <= MAX_PAGES; j++) {
            batch.push($fetch(buildUrl(j)).catch(e => {
              console.error(`[Abaha API] Error fetching page ${j}:`, e.message)
              return null
            }))
          }
          const results = await Promise.all(batch)
          for (const res of results) {
            const batchCustomers = Array.isArray((res as any)?.data?.customers)
              ? (res as any).data.customers
              : (Array.isArray((res as any)?.data) ? (res as any).data : [])
            if (batchCustomers.length > 0) {
              allCustomers = [...allCustomers, ...batchCustomers]
            }
          }
          // If the last batch didn't return full pages, we can probably stop
          // but for simplicity and since we only do 20 pages, we'll just finish the loop or check size
        }
      } catch (err: any) {
        console.error('[Abaha API] Initial fetch error:', err.message)
        throw createError({ statusCode: 500, statusMessage: 'Không thể kết nối API Abaha' })
      }

      const items = allCustomers.map(mapCustomer)

      return { 
        items, 
        total: items.length
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
