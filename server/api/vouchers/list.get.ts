import { useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const supabase = useSupabase()

  try {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('status', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    const now = new Date()

    // Filter by date on the server side to ensure only valid vouchers are returned
    const validVouchers = (data || []).filter(v => {
      const start = v.start_date ? new Date(v.start_date) : null
      const end = v.end_date ? new Date(v.end_date) : null
      
      if (start && start > now) return false
      if (end && end < now) return false
      
      // Also check usage limit
      if (v.usage_limit && v.used_count >= v.usage_limit) return false
      
      return true
    })

    return {
      success: true,
      data: validVouchers.map(v => ({
        id: v.id,
        code: v.code,
        type: v.type,
        value: v.value,
        min_order_value: v.min_order_value,
        max_discount: v.max_discount,
        start_date: v.start_date,
        end_date: v.end_date,
        usage_limit: v.usage_limit,
        used_count: v.used_count,
        title: v.type === 'percent' ? `Giảm ${v.value}%` : `Giảm ${new Intl.NumberFormat('vi-VN').format(v.value)}đ`,
        description: v.min_order_value > 0 ? `Áp dụng cho đơn hàng từ ${new Intl.NumberFormat('vi-VN').format(v.min_order_value)}đ` : 'Áp dụng cho mọi đơn hàng',
        expiryDate: v.end_date ? new Date(v.end_date).toLocaleDateString('vi-VN') : 'Không giới hạn'
      }))
    }
  } catch (err: any) {
    console.error('[Voucher List API Error]:', err)
    return {
      success: false,
      data: [],
      error: err.message
    }
  }
})
