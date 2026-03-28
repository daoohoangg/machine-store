export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  let { phone } = body
  phone = phone?.toString().trim()

  if (!phone) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Phone number is required'
    })
  }

  // Basic Vietnam phone validation (starts with 0 or 84, followed by 9 digits)
  if (!/^0\d{9}$|^84\d{9}$/.test(phone)) {
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
    const response: any = await $fetch('https://babystore18787.abaha.vn/auth/send_otp', {
      method: 'POST',
      body: {
        phone_number: phone,
        region: 'VN',
        otp_driver_category: 'zalootp'
      }
    });

    console.log('Abaha Send OTP response:', response);

    // Abaha usually returns { data: { token: '...' }, ... } or similar
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
      throw createError({
        statusCode: 400,
        statusMessage: response?.message || 'Failed to send OTP (No token received)'
      })
    }
  } catch (err: any) {
    console.error('Error sending OTP via Abaha:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || 'Failed to send OTP'
    })
  }
})
