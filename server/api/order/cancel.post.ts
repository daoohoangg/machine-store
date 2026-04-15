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

  // Chỉ cho phép hủy khi đơn hàng còn ở trạng thái Giỏ hàng (1) hoặc Đặt hàng (5)
  const cancellableStatuses = [1, 5]
  if (body.current_status !== undefined && !cancellableStatuses.includes(Number(body.current_status))) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Đơn hàng không thể hủy ở trạng thái hiện tại'
    })
  }

  const payload: any = {
    id: Number(orderId),
    status: 0, // Trạng thái Hủy theo Abaha
    orders_time: Math.floor(Date.now() / 1000),
    pos_id: null,
    pos_type: null
  }

  console.log('[Abaha Cancel Order API] Cancelling order ID:', orderId)
  console.log('[Abaha Cancel Order API] Payload:', JSON.stringify(payload, null, 2))

  try {
    const response: any = await $fetch(abahaUpdateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      query: { token: abahaToken },
      body: payload
    })

    console.log('[Abaha Cancel Order API] Response:', JSON.stringify(response, null, 2))

    if (response.status === 0 && response.error) {
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
