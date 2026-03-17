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
      statusMessage: 'OTP expired or not found'
    })
  }

  if (Date.now() > storedData.expiresAt) {
    await storage.removeItem(phone)
    throw createError({
      statusCode: 400,
      statusMessage: 'OTP expired'
    })
  }

  if (storedData.otp !== otp) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid OTP'
    })
  }

  // Valid OTP, clear it
  await storage.removeItem(phone)

  // Here we would normally create a session or JWT token. 
  // We can set a cookie for authenticated state
  setCookie(event, 'auth_token', 'user_' + phone, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  })

  return {
    success: true,
    message: 'Login successful'
  }
})
