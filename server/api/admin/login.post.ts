import { useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  let { phone } = body
  phone = phone?.toString().trim()

  if (!phone) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Vui lòng nhập số điện thoại'
    })
  }

  try {
    const supabase = useSupabase()
    
    // Check if account exists and has role 'admin'
    const { data: account, error } = await supabase
      .from('accounts')
      .select('phone, full_name, role, status')
      .eq('phone', phone)
      .single()
    
    if (error || !account) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Số điện thoại này chưa được phân quyền Quản trị (Admin) hoặc không tồn tại.'
      })
    }
    
    if (account.status && account.status !== 'active') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Tài khoản của bạn đã bị khoá.'
      })
    }

    if (account.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Truy cập bị từ chối. Số điện thoại chỉ có quyền Khách hàng.'
      })
    }

    // Sync admin info to Abaha as a customer
    try {
      const abahaToken = process.env.ABAHA_TOKEN || useRuntimeConfig().public.abahaToken;
      if (abahaToken) {
        await $fetch(`https://publicapi.abaha.vn/customer/create?token=${abahaToken}`, {
          method: 'POST',
          body: {
            tel: phone,
            name: account?.full_name || undefined
          }
        });
        console.log('[Abaha API] Successfully synced admin customer:', phone);
      }
    } catch (abahaErr: any) {
      console.error('[Abaha API Error] Failed to sync admin customer:', abahaErr?.data || abahaErr.message);
    }

    // Set auth cookie if needed, but returning success is enough for frontend
    const adminToken = Buffer.from(`admin_${phone}_${Date.now()}`).toString('base64')
    setCookie(event, 'admin_token', adminToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 15, // 15 days
      path: '/'
    })

    return {
      success: true,
      message: 'Đăng nhập Quản trị thành công',
      admin: {
        phone: account.phone,
        name: account.full_name || 'Admin',
        role: account.role
      }
    }
  } catch (err: any) {
    console.error('[Admin Login Error]:', err)
    if (err.statusCode) {
      throw err;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Lỗi hệ thống khi đăng nhập admin.'
    })
  }
})
