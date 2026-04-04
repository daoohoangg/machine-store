export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const runtimeConfig = useRuntimeConfig()
  const abahaToken = runtimeConfig.public.abahaToken || process.env.ABAHA_TOKEN
  const abahaApiUrl = "https://publicapi.abaha.vn/order/create";

  if (!abahaToken) {
    throw createError({
      statusCode: 500,
      statusMessage: "ABAHA_TOKEN not configured"
    })
  }

  // Map incoming body to Abaha schema provided by user
  const abahaBody = {
    product_items: body.items?.map((item: any) => {
      // Prioritize product_code or code from raw metadata, fallback to numeric id
      const productCode = item.raw?.product_code || item.raw?.code || String(item.id)
      const quantity = Number(item.quantity || item.qty || 1)
      const price = Number(item.price) || 0

      // If we don't have a valid product identification, we skip the item
      if (!productCode || productCode === 'null' || productCode === 'undefined') {
          return null
      }

      return {
        product_code: productCode,
        quantity: quantity,
        price: price
      }
    }).filter(Boolean) || [],
    discount: body.discount || 0,
    fee: body.fee || 0,
    tel: body.receiver?.phone || body.tel,
    address_receiver: {
      name: body.receiver?.fullName || body.name,
      tel: body.receiver?.phone || body.tel,
      address: body.receiver?.address || body.address
    },
    user_note: body.note || "",
    orders_time: Math.floor(Date.now() / 1000),
    status: 1
  }

  console.log('[Abaha Order API] Creating order with body:', JSON.stringify(abahaBody, null, 2));

  try {
    const response: any = await $fetch(abahaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      query: { token: abahaToken },
      body: abahaBody
    })

    console.log('[Abaha Order API] Response:', response);

    if (response.status === 0 || response.error) {
       throw createError({
         statusCode: 400,
         statusMessage: response.message || "Lỗi khi tạo đơn hàng trên Abaha"
       })
    }

    return {
      success: true,
      data: response.data,
      message: 'Tạo đơn hàng thành công'
    }
  } catch (error: any) {
    console.error('[Abaha Order API] Exception:', error.data || error.message);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || "Internal Server Error"
    })
  }
})
