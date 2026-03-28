export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { phone, otp } = body

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
      statusMessage: 'Session expired or OTP not requested'
    })
  }

  if (Date.now() > storedData.expiresAt) {
    await storage.removeItem(phone)
    throw createError({
      statusCode: 400,
      statusMessage: 'OTP session expired'
    })
  }

  const token = storedData.token

  // Call Abaha Verify API
  try {
    const url = new URL('https://babystore18787.abaha.vn/auth/verify')
    url.searchParams.append('token', token)
    url.searchParams.append('driver', 'zalootpzns')
    url.searchParams.append('name', 'Zalo')
    url.searchParams.append('phone_number', phone)
    url.searchParams.append('region', 'VN')
    url.searchParams.append('otp_driver_category', 'zalootp')
    url.searchParams.append('otp', otp)

    const response: any = await $fetch(url.toString(), {
      method: 'GET'
    });

    console.log('Abaha Verify OTP response:', response);

    // Check if verification was successful
    // Assuming success based on response.status === 200 or response.success
    if (response?.status === 200 || response?.success) {
      // Valid OTP, clear it
      await storage.removeItem(phone)

      // Set auth cookie
      setCookie(event, 'auth_token', 'user_' + phone, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      })

      return {
        success: true,
        message: 'Login successful'
      }
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: response?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn'
      })
    }
  } catch (err: any) {
    console.error('Error verifying OTP via Abaha:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn'
    })
  }
})
