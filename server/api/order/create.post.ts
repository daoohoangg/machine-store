export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const runtimeConfig = useRuntimeConfig()
  const abahaToken = runtimeConfig.public.abahaToken || process.env.ABAHA_TOKEN || '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA'
  const abahaCreateUrl = "https://publicapi.abaha.vn/order/create";
  
  const formatDate = (dateInput: any) => {
    if (!dateInput) return new Date().toISOString().split('T')[0]
    try {
      const d = new Date(dateInput)
      if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0]
      return d.toISOString().split('T')[0]
    } catch (e) {
      return new Date().toISOString().split('T')[0]
    }
  }

  // 1. Map incoming body to products structure
  const productItems = body.product_items || body.items?.map((item: any) => {
    const productCode = item.raw?.productCode || item.raw?.product_code
    if (!productCode || productCode === 'null' || productCode === 'undefined') return null

    return {
      price: Number(item.price) || 0,
      product_code: productCode,
      quantity: Number(item.quantity || 1)
    }
  }).filter(Boolean) || []

  // 2. Build the payload according to your request (URL: .../order/create, orders_time: now)
  const payload: any = {
    product_items: productItems,
    discount: { 
      price: Number(body.discount?.price || body.discount) || 0, 
      name: body.discount?.name || "không" 
    },
    fee: { 
      price: Number(body.fee?.price || body.fee) || 0, 
      name: body.fee?.name || "Phí ship" 
    },
    tel: body.tel || body.address_receiver?.tel || body.receiver?.phone || "",
    address_receiver: {
      address_default: body.address_receiver?.address_default || null,
      name: body.address_receiver?.name || body.receiver?.fullName || body.name || "Khách hàng",
      tel: body.address_receiver?.tel || body.receiver?.phone || body.tel || "",
      address: body.address_receiver?.address || body.receiver?.address || body.address || ""
    },
    user_note: body.user_note || body.note || "",
    orders_time: formatDate(body.orders_time), // YYYY-MM-DD
    status: Number(body.status !== undefined ? body.status : 5)
  }

  console.log('[Abaha Order API] Calling CREATE API...', abahaCreateUrl);
  console.log('[Abaha Order API] Token used (first 10 chars):', abahaToken.substring(0, 10) + '...');
  console.log('[Abaha Order API] Payload:', JSON.stringify(payload, null, 2));

  try {
    const response: any = await $fetch(abahaCreateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      query: { token: abahaToken },
      body: payload
    })

    console.log('[Abaha Order API] Response:', JSON.stringify(response, null, 2));

    if (response.status === 0 || response.error || response.statusCode) {
      throw createError({
        statusCode: 400,
        statusMessage: response.message || response.statusMessage || "Lỗi khi tạo đơn hàng trên Abaha"
      })
    }

    return {
      success: true,
      data: response.data || response,
      sentPayload: payload,
      message: 'Gửi đơn hàng thành công'
    }

  } catch (error: any) {
    const errorDetail = error.data || error.response?._data || error.message;
    console.error('[Abaha Order API] Exception Detail:', JSON.stringify(errorDetail, null, 2));
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: (errorDetail?.message || errorDetail?.statusMessage || error.message || "Internal Server Error")
    })
  }
})
