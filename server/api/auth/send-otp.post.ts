import { sendZNS } from '../../utils/zalo'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  let { phone } = body
  phone = phone?.toString().trim()

  console.log('[OTP Debug] Sending OTP for phone:', phone);

  if (!phone) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Phone number is required'
    })
  }

  // Verify Turnstile
  const { turnstileToken } = body
  if (!turnstileToken) {
    throw createError({ statusCode: 400, statusMessage: 'Vui lòng xác thực CAPTCHA (Turnstile)' })
  }

  const secret = useRuntimeConfig().turnstile?.secretKey || '0x4AAAAAACzTFfV7eyFNyfWShoJleWd_xcY'
  try {
    const verifyRes: any = await $fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({
        secret,
        response: turnstileToken
      }).toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    
    if (!verifyRes.success) {
      console.warn('[Turnstile] Failed verification:', verifyRes)
      throw createError({ statusCode: 400, statusMessage: 'Xác minh bảo mật thất bại. Hãy thử lại.' })
    }
  } catch (err: any) {
    if (err.statusCode) throw err
    console.error('[Turnstile] Error verifying:', err.message)
    throw createError({ statusCode: 500, statusMessage: 'Lỗi kết nối máy chủ xác thực bảo mật.' })
  }

  // Basic Vietnam phone validation (starts with 0, 84, or +84)
  if (!/^(\+?84|0)\d{9,10}$/.test(phone)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Số điện thoại không hợp lệ (Việt Nam)'
    })
  }

  // 1. Generate random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  // 2. Send OTP via Zalo ZNS
  try {
    const response = await sendZNS(phone, otp)
    console.log('[Zalo ZNS] Send response:', response)

    // 3. Store OTP in storage (valid for 5 minutes)
    const storage = useStorage('otp')
    await storage.setItem(phone, {
      otp: otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    })

    return {
      success: true,
      message: 'OTP đã được gửi qua Zalo'
    }
  } catch (err: any) {
    console.error('[Zalo Send Error] Error details:', err.message || err);
    throw createError({
      statusCode: 500,
      statusMessage: `Lỗi Zalo: ${err.message || 'Không rõ lỗi'}. Thử lại sau.`
    })
  }
})
