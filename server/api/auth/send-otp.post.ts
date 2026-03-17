export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { phone } = body

  if (!phone) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Phone number is required'
    })
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()

  const config = useRuntimeConfig()
  const accessToken = config.speedSmsToken

  if (!accessToken) {
    console.error('SpeedSMS access token is missing')
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error (SpeedSMS credentials missing)'
    })
  }

  // Store OTP temporarily (e.g., valid for 5 minutes)
  const storage = useStorage('otp')
  await storage.setItem(phone, {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  })

  // Send SMS via SpeedSMS
  try {
    const response = await $fetch('https://api.speedsms.vn/index.php/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(accessToken + ':x').toString('base64')
      },
      body: {
        to: [phone],
        content: `Ma xac thuc cua ban la: ${otp}`,
        sms_type: 2,
        sender: '' // Some versions of speedsms require sender field even if empty, or perhaps type 4 is default brandname "Verify"? We will use sender: "Verify" and type: 4 as it is very common for default OTPs. Wait!
      }
    });

    console.log('SpeedSMS response:', response);

    return {
      success: true,
      message: 'OTP sent successfully'
    }
  } catch (err) {
    console.error('Error sending OTP via SpeedSMS:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send OTP'
    })
  }
})
