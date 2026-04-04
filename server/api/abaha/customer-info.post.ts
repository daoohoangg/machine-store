export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const tel = body?.tel

  if (!tel) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu số điện thoại' })
  }

  const TOKEN = '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA'

  // Build a proper x-www-form-urlencoded body
  const params = new URLSearchParams()
  params.append('tel', tel)

  const result = await $fetch<any>(
    `https://publicapi.abaha.vn/customer/info?token=${TOKEN}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    }
  )

  return result
})
