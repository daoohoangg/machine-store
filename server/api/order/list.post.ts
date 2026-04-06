export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const runtimeConfig = useRuntimeConfig()
  const abahaToken = '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA';
  const abahaApiUrl = "https://publicapi.abaha.vn/order/index";

  if (!abahaToken) {
    throw createError({
      statusCode: 500,
      statusMessage: "ABAHA_TOKEN not configured"
    })
  }

  // Construct search params for x-www-form-urlencoded body
  const params = new URLSearchParams()
  if (body.customer_id) params.append('customer_id', String(body.customer_id))
  if (body.status) params.append('status', String(body.status))
  if (body.limit) params.append('limit', String(body.limit))
  if (body.page) params.append('page', String(body.page))
  if (body.order_by) params.append('order_by', String(body.order_by))
  if (body.order_direction) params.append('order_direction', String(body.order_direction))
  if (body.created_from) params.append('created_from', String(body.created_from))
  if (body.created_to) params.append('created_to', String(body.created_to))
  if (body.store_id) params.append('store_id', String(body.store_id))

  console.log('[Abaha Order List API] Sending Request to:', abahaApiUrl);
  console.log('[Abaha Order List API] Customer ID:', body.customer_id);

  try {
    const response: any = await $fetch(abahaApiUrl, {
      method: 'POST',
      query: { token: abahaToken },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    console.log('[Abaha Order List API] Response:', JSON.stringify(response).substring(0, 500));

    if (response.status === 0 || response.error) {
       throw createError({
         statusCode: 400,
         statusMessage: response.message || "Lỗi khi lấy danh sách đơn hàng từ Abaha"
       })
    }

    return {
      success: true,
      data: response.data,
      total: response.total_items || (response.data?.length || 0),
      message: 'Lấy danh sách đơn hàng thành công'
    }
  } catch (error: any) {
    console.error('[Abaha Order List API] Exception:', error.data || error.message);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || "Internal Server Error"
    })
  }
})
