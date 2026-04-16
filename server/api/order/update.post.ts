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
    const productCode = item.raw?.product_code
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

  // Construct payload according to the EXACT structure requested
  const payload: any = {
    id: Number(orderId),
    product_items: productItems,
    discount: {
      price: Number(body.discountAmount || body.discount?.price || body.discount) || 0,
      name: body.discount?.name || (body.voucher_code || body.discountAmount ? "giảm giá sản phẩm" : "không")
    },
    fee: {
      price: Number(body.fee?.price || body.fee || body.shippingFee) || 0,
      name: body.fee?.name || "Phí ship"
    },
    tel: body.tel || body.receiver?.phone || body.address_receiver?.tel || "",
    address_receiver: {
      address_default: null,
      name: body.address_receiver?.name || body.receiver?.fullName || body.name || "Khách hàng",
      tel: body.address_receiver?.tel || body.receiver?.phone || body.tel || "",
      address: body.address_receiver?.address || body.receiver?.address || body.address || ""
    },
    user_note: body.user_note || body.note || "",
    orders_time: formatDate(body.orders_time), // YYYY-MM-DD
    status: Number(body.status !== undefined ? body.status : 5),
    pos_id: "DH981",
    pos_type: "kiotviet",
    check_product_inventory: false,
    check_product_status: false
  }

  console.log('[Abaha Order Update API] Calling UPDATE API...', abahaUpdateUrl);
  console.log('[Abaha Order Update API] Token used (first 10 chars):', abahaToken.substring(0, 10) + '...');
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
    const errorDetail = error.data || error.response?._data || error.message;
    console.error('[Abaha Order Update API] Exception Detail:', JSON.stringify(errorDetail, null, 2));
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: (errorDetail?.message || errorDetail?.statusMessage || error.message || "Internal Server Error")
    })
  }
})
