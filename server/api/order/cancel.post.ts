export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const runtimeConfig = useRuntimeConfig()
  const abahaToken = runtimeConfig.public.abahaToken || process.env.ABAHA_TOKEN || '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA'
  const abahaUpdateUrl = 'https://publicapi.abaha.vn/order/update'

  const orderId = body.id
  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Thiếu ID đơn hàng để hủy'
    })
  }

  // Map lại danh sách sản phẩm theo đúng cấu trúc Abaha yêu cầu
  const productItems = body.product_items?.map((item: any) => ({
    price: Number(item.price) || 0,
    product_code: item.product_code || item.code || String(item.id),
    quantity: Number(item.quantity) || 1
  })) || []

  // Lấy ngày hiện tại theo định dạng YYYY-MM-DD nếu không có orders_time cũ
  const formatDate = (dateInput: any) => {
    if (!dateInput) return new Date().toISOString().split('T')[0]
    try {
      const d = new Date(dateInput)
      return d.toISOString().split('T')[0]
    } catch (e) {
      return String(dateInput).split(' ')[0]
    }
  }

  // Xây dựng payload GIỐNG HỆT mẫu khách hàng cung cấp
  const payload: any = {
    id: Number(orderId),
    product_items: productItems,
    discount: {
      price: Number(body.discount?.price) || 0,
      name: body.discount?.name || "không"
    },
    fee: {
      price: Number(body.fee?.price) || 0,
      name: body.fee?.name || "Phí ship"
    },
    tel: body.address_receiver?.tel || body.tel || "",
    address_receiver: {
      address_default: body.address_receiver?.address_default || null,
      name: body.address_receiver?.name || body.name || "",
      tel: body.address_receiver?.tel || body.tel || "",
      address: body.address_receiver?.address || body.address || ""
    },
    user_note: body.user_note || "",
    orders_time: formatDate(body.orders_time || body.created_at),
    status: 0, // Trạng thái Hủy
    pos_id: "",
    pos_type: "",
    check_product_inventory: false,
    check_product_status: false
  }

  console.log('[Abaha Cancel Order API] Sending EXACT payload for ID:', orderId)
  console.log('[Abaha Cancel Order API] Payload:', JSON.stringify(payload, null, 2))

  try {
    const response: any = await $fetch(abahaUpdateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      query: { token: abahaToken },
      body: payload
    })

    console.log('[Abaha Cancel Order API] Response:', JSON.stringify(response, null, 2))

    if (response.status === 0 || response.error) {
      throw createError({
        statusCode: 400,
        statusMessage: response.message || 'Lỗi khi hủy đơn hàng trên Abaha'
      })
    }

    return {
      success: true,
      data: response.data || { id: orderId },
      message: 'Hủy đơn hàng thành công'
    }
  } catch (error: any) {
    console.error('[Abaha Cancel Order API] Exception:', error.data || error.message)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Internal Server Error'
    })
  }
})
