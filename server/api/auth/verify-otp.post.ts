import { useSupabase } from '../../utils/supabase'

import { sendZNS } from '../../utils/zalo'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  let { phone, otp } = body
  phone = phone?.toString().trim()
  otp = otp?.toString().trim()

  console.log('[OTP Debug] Verifying OTP for phone:', phone, 'otp:', otp);

  if (!phone || !otp) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Phone and OTP are required'
    })
  }

  const storage = useStorage('otp')
  const storedData: any = await storage.getItem(phone)

  if (!storedData) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Phiên làm việc hết hạn hoặc chưa yêu cầu mã OTP'
    })
  }

  if (Date.now() > storedData.expiresAt) {
    await storage.removeItem(phone)
    throw createError({
      statusCode: 400,
      statusMessage: 'Mã OTP đã hết hạn'
    })
  }

  // 3. Verify OTP locally
  if (storedData.otp === otp) {
    // Valid OTP, clear it from storage
    await storage.removeItem(phone)
    
    try {
      const supabase = useSupabase()
      
      // Upsert user in Supabase (Auth via phone)
      const { data: account, error: upsertError } = await supabase
        .from('accounts')
        .upsert({
          phone: phone,
          last_login: new Date().toISOString()
        }, { onConflict: 'phone' })
        .select()
        .single()
      
      if (upsertError) {
        console.error('[Supabase Error] Failed to upsert user after OTP:', upsertError)
      }

      const displayName = account?.full_name || account?.phone || phone;

      // Sync customer info to Abaha
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
          console.log('[Abaha API] Successfully synced customer:', phone);
        }
      } catch (abahaErr: any) {
        console.error('[Abaha API Error] Failed to sync customer on login:', abahaErr?.data || abahaErr.message);
      }

      // Set auth cookie
      const isDev = process.env.NODE_ENV === 'development'
      setCookie(event, 'auth_token', 'user_' + phone, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 15, // 15 days
        path: '/',
        sameSite: 'lax',
        secure: !isDev
      })

      return {
        success: true,
        message: 'Đăng nhập thành công',
        phone,
        name: displayName
      }
    } catch (dbErr) {
      console.error('[Verify OTP] DB Error:', dbErr)
      // Still return success if token is valid, but log error
      return {
        success: true,
        message: 'Đăng nhập thành công (Lỗi đồng bộ DB)',
        phone
      }
    }
  } else {
    throw createError({
      statusCode: 400,
      statusMessage: 'Mã OTP không chính xác. Vui lòng kiểm tra lại.'
    })
  }
})
