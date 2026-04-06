export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const runtimeConfig = useRuntimeConfig()
  const abahaToken = '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA'
  const abahaUpdateUrl = "https://publicapi.abaha.vn/order/update";

  const orderId = body.id;
  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Thiếu ID đơn hàng để cập nhật"
    })
  }

  // Construct payload using x-www-form-urlencoded as requested
  const params = new URLSearchParams()
  params.append('id', String(orderId))
  
  const productItems = body.items?.map((item: any) => {
    const productCode = item.raw?.productCode || item.raw?.product_code || item.raw?.code || String(item.id)
    return {
      product_code: productCode,
      quantity: Number(item.quantity || 1),
      price: Number(item.price) || 0
    }
  }).filter((i: any) => i.product_code) || []
  
  params.append('product_items', JSON.stringify(productItems))
  
  params.append('discount', JSON.stringify({
    price: Number(body.discount) || 0,
    name: "Giảm giá"
  }))
  
  params.append('fee', JSON.stringify({
    price: Number(body.fee) || 0,
    name: "Phí ship"
  }))
  
  params.append('tel', body.receiver?.phone || body.tel || '')
  
  params.append('address_receiver', JSON.stringify({
    address_default: null,
    name: body.receiver?.fullName || body.name || '',
    tel: body.receiver?.phone || body.tel || '',
    address: body.receiver?.address || body.address || ''
  }))
  
  params.append('user_note', body.note || "")
  // Unix timestamp (seconds)
  params.append('orders_time', String(Math.floor(Date.now() / 1000)))
  params.append('status', String(body.status || 5))
  params.append('pos_id', body.pos_id || `DH${orderId}`)
  params.append('pos_type', "kiotviet")
  params.append('check_product_inventory', 'false')
  params.append('check_product_status', 'false')

  console.log('[Abaha Order Update API] Sending x-www-form-urlencoded payload for ID:', orderId);

  try {
    const response: any = await $fetch(abahaUpdateUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      query: { token: abahaToken },
      body: params.toString()
    });

    if (response.status === 0 || response.error) {
      throw createError({
        statusCode: 400,
        statusMessage: response.message || "Lỗi khi cập nhật đơn hàng trên Abaha"
      })
    }

    return {
      success: true,
      data: response.data || { id: orderId },
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
