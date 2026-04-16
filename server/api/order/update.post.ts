export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const runtimeConfig = useRuntimeConfig()
  const abahaToken = runtimeConfig.public.abahaToken || process.env.ABAHA_TOKEN || '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA'
  const abahaUpdateUrl = "https://publicapi.abaha.vn/order/update";

  const orderId = body.id;
  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Thiếu ID đơn hàng để cập nhật"
    })
  }

  // Mảng chứa các sản phẩm
  const productItems = body.product_items || body.items?.map((item: any) => {
    const productCode = item.raw?.productCode || item.raw?.product_code || item.raw?.code || String(item.id)
    return {
      price: Number(item.price) || 0,
      product_code: productCode,
      quantity: Number(item.quantity || 1)
    }
  }).filter((i: any) => i.product_code) || []

  // Lấy ngày hiện tại theo định dạng YYYY-MM-DD
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

  // Construct payload according to the EXACT example provided
  const payload: any = {
    id: Number(orderId), // Convert to Number if it looks like one, Abaha usually likes integers
    product_items: productItems,
    discount: {
      price: Number(body.discount) || 0,
      name: body.voucher_code ? "giảm giá sản phẩm" : "không"
    },
    fee: {
      price: Number(body.fee) || 0,
      name: "Phí ship"
    },
    tel: body.receiver?.phone || body.tel || '',
    address_receiver: {
      address_default: null,
      name: body.receiver?.fullName || body.name || '',
      tel: body.receiver?.phone || body.tel || '',
      address: body.receiver?.address || body.address || ''
    },
    user_note: body.note || "",
    orders_time: formatDate(body.orders_time), // YYYY-MM-DD
    status: Number(body.status || 5), // Sử dụng status từ client hoặc mặc định là 5 (Đặt hàng)
    pos_id: "",
    pos_type: "",
    check_product_inventory: false,
    check_product_status: false
  }

  console.log('[Abaha Order Update API] Sending JSON payload for ID:', orderId);
  console.log('[Abaha Order Update API] Payload:', JSON.stringify(payload, null, 2));

  try {
    const response: any = await $fetch(abahaUpdateUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      query: { token: abahaToken },
      body: payload
    });

    console.log('[Abaha Order Update API] Response:', JSON.stringify(response, null, 2));

    if (response.status === 0 || response.error || response.statusCode) {
      throw createError({
        statusCode: 400,
        statusMessage: response.message || response.statusMessage || "Lỗi khi cập nhật đơn hàng trên Abaha"
      })
    }

    return {
      success: true,
      data: response.data || { id: orderId },
      sentPayload: payload,
      message: 'Cập nhật đơn hàng thành công'
    }
  } catch (error: any) {
    console.error('[Abaha Order Update API] Exception:', error.data || error.message);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || "Internal Server Error"
    })
  }
})
