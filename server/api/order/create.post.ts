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
    product_items: body.items?.map((item: any) => ({
      id: item.id,
      name: item.title || item.name,
      qty: item.quantity || item.qty || 1,
      price: item.price
    })) || [],
    discount: body.discount || 0,
    fee: body.fee || 0,
    tel: body.receiver?.phone || body.tel,
    address_receiver: {
      name: body.receiver?.fullName || body.name,
      tel: body.receiver?.phone || body.tel,
      address: body.receiver?.address || body.address
    },
    address_default: 1,
    name: body.receiver?.fullName || body.name,
    address: body.receiver?.address || body.address,
    user_note: body.note || "",
    orders_time: Math.floor(Date.now() / 1000),
    status: 1
  }

  console.log('[Abaha Order API] Creating order with body:', JSON.stringify(abahaBody, null, 2));

  try {
    const response: any = await $fetch(abahaApiUrl, {
      method: 'POST',
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
