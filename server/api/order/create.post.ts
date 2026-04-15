export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const runtimeConfig = useRuntimeConfig()
  const abahaToken = runtimeConfig.public.abahaToken || process.env.ABAHA_TOKEN || '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA'
  const abahaCreateUrl = "https://publicapi.abaha.vn/order/create";

  // 1. Map incoming body to products structure
  const productItems = body.items?.map((item: any) => {
    const productCode = item.raw?.productCode || item.raw?.product_code || item.raw?.code || String(item.id)
    if (!productCode || productCode === 'null' || productCode === 'undefined') return null

    return {
      product_code: productCode,
      quantity: Number(item.quantity || 1),
      price: Number(item.price) || 0
    }
  }).filter(Boolean) || []

  // 2. Build the payload according to your request (URL: .../order/create, orders_time: now)
  const payload: any = {
    product_items: productItems,
    discount: { price: Number(body.discount) || 0, name: "Giảm giá" },
    fee: { price: Number(body.fee) || 0, name: "Phí ship" },
    tel: body.tel || body.receiver?.phone || "",
    address_receiver: {
      name: body.receiver?.fullName || body.name || "Khách hàng",
      tel: body.receiver?.phone || body.tel || "",
      address: body.receiver?.address || body.address || ""
    },
    user_note: body.note || "",
    orders_time: Math.floor(Date.now() / 1000), // set Thời gian đặt là now
    status: 1 // Luôn là 1 (Giỏ hàng) khi tạo mới
  }

  // If an ID exists, we still include it in the payload but we call the CREATE endpoint as requested
  if (body.id) {
    payload.id = String(body.id)
    payload.pos_id = body.pos_id || `DH${body.id}`
    payload.pos_type = body.pos_type || 1
    payload.check_product_inventory = false
    payload.check_product_status = false
  }

  console.log('[Abaha Order API] Calling CREATE API...');
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
    console.error('[Abaha Order API] Exception:', error.data || error.message)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || "Internal Server Error"
    })
  }
})
