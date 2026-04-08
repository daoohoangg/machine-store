export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const runtimeConfig = useRuntimeConfig()
  const abahaToken = runtimeConfig.public.abahaToken || process.env.ABAHA_TOKEN
  const abahaCreateUrl = "https://publicapi.abaha.vn/order/create";
  const abahaUpdateUrl = "https://publicapi.abaha.vn/order/update";

  if (!abahaToken) {
    throw createError({
      statusCode: 500,
      statusMessage: "ABAHA_TOKEN not configured"
    })
  }

  // 1. Map incoming body to generic structure
  const productItems = body.items?.map((item: any) => {
    const productCode = item.raw?.productCode || item.raw?.product_code || item.raw?.code || String(item.id)
    const quantity = Number(item.quantity || item.qty || 1)
    const price = Number(item.price) || 0

    if (!productCode || productCode === 'null' || productCode === 'undefined') return null

    return {
      product_code: productCode,
      quantity: quantity,
      price: price
    }
  }).filter(Boolean) || []

  const addressReceiver = {
    name: body.receiver?.fullName || body.name || "Khách hàng",
    tel: body.receiver?.phone || body.tel || "",
    address: body.receiver?.address || body.address || ""
  }

  // Helper to build payload according to JSON schema
  const buildPayload = (orderId?: string | number) => {
    const payload: any = {
      product_items: productItems,
      discount: { price: Number(body.discount) || 0, name: "Giảm giá" },
      fee: { price: Number(body.fee) || 0, name: "Phí ship" },
      tel: body.tel || body.receiver?.phone || "",
      address_receiver: addressReceiver,
      user_note: body.note || "", // Keeping as string despite 'integer' label in user doc, as it's common sense
      orders_time: Math.floor(Date.now() / 1000),
      status: Number(body.status || 1)
    }

    if (orderId) {
      payload.id = Number(orderId)
      payload.pos_id = body.pos_id || `DH${orderId}`
      payload.pos_type = "kiotviet"
      payload.check_product_inventory = false
      payload.check_product_status = false
    }

    return payload
  }

  try {
    let response: any = null

    if (body.id) {
      // Update Flow (JSON)
      response = await $fetch(abahaUpdateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        query: { token: abahaToken },
        body: buildPayload(body.id)
      })
    } else {
      // Create Flow (JSON)
      console.log('[Abaha Order API] Creating order with payload:', buildPayload())
      response = await $fetch(abahaCreateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        query: { token: abahaToken },
        body: buildPayload()
      })

      console.log('[Abaha Order API] Create Response:', response)

      if (response.status === 0 || response.error || response.statusCode) {
        throw createError({
          statusCode: 400,
          statusMessage: response.message || response.statusMessage || "Lỗi khi tạo đơn hàng trên Abaha"
        })
      }

      // If we need an immediate status update (e.g. to status 5)
      const newOrderId = response.data?.id
      if (newOrderId && !body.skipUpdate) {
        try {
          await $fetch(abahaUpdateUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            query: { token: abahaToken },
            body: buildPayload(newOrderId)
          })
        } catch (updateError: any) {
          console.error('[Abaha Order API] Final Update Error:', updateError.message)
        }
      }
    }

    return {
      success: true,
      data: response.data || response,
      message: body.id ? 'Cập nhật đơn hàng thành công' : 'Tạo đơn hàng thành công'
    }

  } catch (error: any) {
    console.error('[Abaha Order API] Exception:', error.data || error.message)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || "Internal Server Error"
    })
  }
})
