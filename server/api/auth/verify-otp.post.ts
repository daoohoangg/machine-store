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

  const token = storedData.token
  const config = useRuntimeConfig()
  const abahaToken = config.public.abahaToken

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
    
    // Add app token if exists (although OTP token is provided as 'token')
    if (abahaToken) {
      // Abaha sometimes uses 'app_token' or similar if 'token' is already used for something else
      // But in their category APIs, 'token' is the app token.
      // In the user's verify URL, 'token' was the OTP token. 
      // We will try adding it as 'abaha_token' if needed, or check if it works without it.
    }

    const response: any = await $fetch(url.toString(), {
      method: 'GET'
    });

    console.log('Abaha Verify OTP response:', response);

    // Check if verification was successful
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
    console.error('Error verifying OTP via Abaha:', err.data || err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || err.message || 'Mã OTP không hợp lệ hoặc đã hết hạn'
    })
  }
})
