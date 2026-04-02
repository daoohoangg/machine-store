import { useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = useSupabase()

  // Bắt buộc xác thực Admin (Check bằng Cookie admin_token hoặc Header ở tương lai)
  // Nhưng tạm thời check nội bộ nếu chưa làm JWT
  
  try {
    if (method === 'GET') {
      const { data: supabaseAccounts, error } = await supabase
        .from('accounts')
        .select('id, phone, full_name, last_login, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      const supaList = supabaseAccounts || []

      // Lấy danh sách từ Abaha
      let abahaCustomers: any[] = []
      try {
        const abahaToken = process.env.ABAHA_TOKEN || useRuntimeConfig().public.abahaToken;
        if (abahaToken) {
           const res: any = await $fetch(`https://publicapi.abaha.vn/customer/index?token=${abahaToken}`)
           
           if (Array.isArray(res?.data?.customers)) {
             abahaCustomers = res.data.customers
           } else if (Array.isArray(res?.data?.customers?.data)) { 
             // in case of pagination
             abahaCustomers = res.data.customers.data
           }
        }
      } catch (err) {
        console.error('[Admin Accounts] Lỗi lấy danh sách Abaha:', err)
      }
      
      // Merge Abaha customers with Supabase rules
      const mergedList = []
      const usedPhones = new Set()
      
      for (const abahaCust of abahaCustomers) {
        const phone = abahaCust.tel || ''
        const name = abahaCust.name || ''
        if (!phone) continue

        usedPhones.add(phone)
        const supaMatch = supaList.find(s => s.phone === phone)
        
        mergedList.push({
          id: supaMatch?.id || `abaha_${abahaCust.id}`,
          phone: phone,
          full_name: supaMatch?.full_name || name, // Prefer Supabase name or Abaha name
          role: 'user', // Default to user since role column is non-existent
          status: 'active',
          last_login: supaMatch?.last_login || null,
          created_at: supaMatch?.created_at || new Date().toISOString()
        })
      }
      
      // Add Supabase accounts that don't exist in Abaha (e.g. system admins, old accounts)
      for (const supa of supaList) {
        if (!usedPhones.has(supa.phone)) {
          mergedList.push(supa)
        }
      }

      // Sắp xếp ưu tiên ngày tạo / vai trò Admin
      mergedList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      return mergedList
    }

    if (method === 'POST' || method === 'PUT') {
      const body = await readBody(event)
      const { phone, full_name, role, status, gender, birth_date, email, address, location_name, invite_phone } = body

      if (!phone) {
        throw createError({ statusCode: 400, statusMessage: 'Số điện thoại là bắt buộc' })
      }

      const updateData: any = { phone }
      if (full_name !== undefined) updateData.full_name = full_name
      if (role !== undefined) updateData.role = role
      if (status !== undefined) updateData.status = status

      const { data, error } = await supabase
        .from('accounts')
        .upsert(updateData, { onConflict: 'phone' })
        .select()
        .single()

      if (error) throw error

      // Sync updated account info to Abaha (all fields)
      try {
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
          console.log('[Abaha API] Successfully synced account update:', phone);
        }
      } catch (abahaErr: any) {
        console.error('[Abaha API Error] Failed to sync account update:', abahaErr?.data || abahaErr.message);
      }

      return { success: true, message: 'Cập nhật tài khoản thành công', data }
    }

    if (method === 'DELETE') {
      const body = await readBody(event)
      const { phone } = body
      
      if (!phone) {
        throw createError({ statusCode: 400, statusMessage: 'Số điện thoại là bắt buộc' })
      }

      // Xoá hoặc Đổi trạng thái (Soft delete) tuỳ vào thiết kế, ở đây mình delete hard:
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('phone', phone)

      if (error) throw error
      return { success: true, message: 'Đã xóa tài khoản' }
    }
  } catch (err: any) {
    console.error('[Admin Accounts API Error]:', err)
    throw createError({
      statusCode: 500,
      statusMessage: `Lỗi Cơ sở dữ liệu: ${err.message}`
    })
  }
})
