import { useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { code, totalValue } = body
  const supabase = useSupabase()

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Thiếu mã voucher' })
  }

  try {
    const { data: voucher, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .eq('status', true)
      .single()

    if (error || !voucher) {
      throw createError({ statusCode: 404, statusMessage: 'Mã giảm giá không tồn tại hoặc đã hết hạn' })
    }

    const now = new Date()
    
    // Date check
    if (voucher.start_date && new Date(voucher.start_date) > now) {
      throw createError({ statusCode: 400, statusMessage: 'Mã giảm giá chưa đến thời gian sử dụng' })
    }
    if (voucher.end_date && new Date(voucher.end_date) < now) {
      throw createError({ statusCode: 400, statusMessage: 'Mã giảm giá đã hết hạn' })
    }

    // Usage check
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
      throw createError({ statusCode: 400, statusMessage: 'Mã giảm giá đã hết lượt sử dụng' })
    }

    // Min value check
    if (totalValue < (voucher.min_order_value || 0)) {
      throw createError({ statusCode: 400, statusMessage: `Mã này chỉ áp dụng cho đơn hàng từ ${new Intl.NumberFormat('vi-VN').format(voucher.min_order_value)}đ` })
    }

    return {
      success: true,
      data: {
        id: voucher.id,
        code: voucher.code,
        type: voucher.type, // 'percent' or 'fixed'
        value: voucher.value,
        max_discount: voucher.max_discount
      }
    }

  } catch (err: any) {
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Lỗi hệ thống khi kiểm tra voucher'
    })
  }
})
