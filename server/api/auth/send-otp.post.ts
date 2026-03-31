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
