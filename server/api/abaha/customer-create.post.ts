export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const tel = body?.tel || ''

  const TOKEN = '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA'

  // Construct JSON body based on user requirements
  const payload: any = {
    tel: tel,
    name: body.name || '',
    address: body.address || '',
    birth_date: body.birth_date || body.birthday || '',
    email: body.email || '',
    gender: body.gender || '',
    invite_phone: body.invite_phone || ''
  }

  // Remove empty fields to keep payload clean
  Object.keys(payload).forEach(key => {
    if (payload[key] === null || payload[key] === undefined) {
      delete payload[key]
    }
  })

  try {
    const result = await $fetch<any>(
      `https://publicapi.abaha.vn/customer/create?token=${TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      }
    )
    return result
  } catch (err: any) {
    console.error('Abaha customer-create error:', err?.data || err.message)
    return {
      status: 0,
      message: err?.data?.message || 'Lỗi khi gọi API Abaha'
    }
  }
})
