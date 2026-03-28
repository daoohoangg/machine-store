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

  const config = useRuntimeConfig()
  const abahaToken = config.public.abahaToken

  if (!abahaToken) {
    console.warn('Abaha token is missing in runtimeConfig.public')
  }

  // Send OTP via Abaha
  try {
    const url = new URL('https://babystore18787.abaha.vn/auth/send_otp')
    if (abahaToken) {
      url.searchParams.append('token', abahaToken)
    }

    const response: any = await $fetch(url.toString(), {
      method: 'POST',
      body: {
        phone_number: phone,
        region: 'VN',
        otp_driver_category: 'zalootp'
      }
    });

    console.log('Abaha Send OTP response:', response);

    // Abaha usually returns { data: { token: '...' }, ... }
    const token = response?.data?.token || response?.token;

    if (token) {
      // Store OTP token temporarily (e.g., valid for 5 minutes)
      const storage = useStorage('otp')
      await storage.setItem(phone, {
        token,
        expiresAt: Date.now() + 5 * 60 * 1000
      })

      return {
        success: true,
        message: 'OTP sent successfully'
      }
    } else {
      console.error('Abaha Error (No token):', response);
      throw createError({
        statusCode: 400,
        statusMessage: response?.message || 'Failed to send OTP (No token received)'
      })
    }
  } catch (err: any) {
    console.error('Error sending OTP via Abaha:', err.data || err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || err.message || 'Failed to send OTP'
    })
  }
})
