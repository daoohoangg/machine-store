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

  // Map incoming body to Abaha schema
  const abahaBody = {
    product_items: body.items?.map((item: any) => {
      const productCode = item.raw?.productCode || item.raw?.product_code || item.raw?.code || String(item.id)
      const quantity = Number(item.quantity || item.qty || 1)
      const price = Number(item.price) || 0

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
    orders_time: new Date(Date.now() + 7 * 3600000).toISOString().replace(/T/, ' ').replace(/\..+/, ''),
    status: body.status || 1
  }

  const performUpdate = async (orderId: number | string) => {
    const params = new URLSearchParams()
    params.append('id', String(orderId))
    params.append('product_items', JSON.stringify(abahaBody.product_items))
    params.append('discount', JSON.stringify({ price: Number(body.discount) || 0, name: "Giảm giá" }))
    params.append('fee', JSON.stringify({ price: Number(body.fee) || 0, name: "Phí ship" }))
    params.append('tel', abahaBody.tel || '')
    params.append('address_receiver', JSON.stringify({
        address_default: null,
        name: abahaBody.address_receiver.name,
        tel: abahaBody.address_receiver.tel,
        address: abahaBody.address_receiver.address
    }))
    params.append('user_note', abahaBody.user_note)
    params.append('orders_time', String(Math.floor(Date.now() / 1000)))
    params.append('status', String(body.status || 5))
    params.append('pos_id', body.pos_id || `DH${orderId}`)
    params.append('pos_type', "kiotviet")
    params.append('check_product_inventory', 'false')
    params.append('check_product_status', 'false')

    return await $fetch(abahaUpdateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      query: { token: abahaToken },
      body: params.toString()
    });
  }

  try {
    let resultData: any = null;

    if (body.id) {
       return await performUpdate(body.id);
    } else {
      // Create flow using x-www-form-urlencoded
      const createParams = new URLSearchParams()
      createParams.append('tel', abahaBody.tel || '')
      createParams.append('product_items', JSON.stringify(abahaBody.product_items))
      createParams.append('address_receiver', JSON.stringify(abahaBody.address_receiver))
      createParams.append('user_note', abahaBody.user_note)
      createParams.append('status', String(abahaBody.status || 1))
      createParams.append('orders_time', String(Math.floor(Date.now() / 1000)))

      const createResponse: any = await $fetch(abahaCreateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        query: { token: abahaToken },
        body: createParams.toString()
      })

      console.log('[Abaha Order API] Create Response:', createResponse);

      if (createResponse.status === 0 || createResponse.error) {
        throw createError({
          statusCode: 400,
          statusMessage: createResponse.message || "Lỗi khi tạo đơn hàng trên Abaha"
        })
      }

      const orderId = createResponse.data?.id;
      resultData = createResponse.data;

      if (orderId && !body.skipUpdate) {
        try {
          await performUpdate(orderId);
        } catch (updateError: any) {
          console.error('[Abaha Order API] Background Update Error:', updateError.message);
        }
      }
    }

    return {
      success: true,
      data: resultData,
      message: body.id ? 'Cập nhật đơn hàng thành công' : 'Tạo đơn hàng thành công'
    }
  } catch (error: any) {
    console.error('[Abaha Order API] Exception:', error.data || error.message);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || "Internal Server Error"
    })
  }
})
