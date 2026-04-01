import { useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = useSupabase()

  // Bắt buộc xác thực Admin (Check bằng Cookie admin_token hoặc Header ở tương lai)
  // Nhưng tạm thời check nội bộ nếu chưa làm JWT
  
  try {
    if (method === 'GET') {
      const { data: accounts, error } = await supabase
        .from('accounts')
        .select('id, phone, full_name, role, status, last_login, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      return accounts || []
    }

    if (method === 'POST' || method === 'PUT') {
      const body = await readBody(event)
      const { phone, full_name, role, status } = body

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
