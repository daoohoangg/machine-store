import { useSupabase } from '../../utils/supabase'
import { requireAdmin } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = useSupabase()

  try {
    if (method === 'GET') {
      const query = getQuery(event)
      const productId = query.productId ? String(query.productId) : null
      const productIdsStr = query.productIds ? String(query.productIds) : null

      // Case 1: Bulk fetch for multiple product IDs (e.g. cart page)
      if (productIdsStr) {
        const ids = productIdsStr.split(',').map(s => s.trim()).filter(Boolean)
        if (ids.length === 0) {
          return { success: true, data: {} }
        }

        const { data, error } = await supabase
          .from('product_wholesale_tiers')
          .select('*')
          .in('product_id', ids)
          .order('min_quantity', { ascending: true })

        if (error) throw error

        // Group tiers by product_id
        const grouped: Record<string, any[]> = {}
        ids.forEach(id => {
          grouped[id] = []
        })

        if (data) {
          data.forEach((tier: any) => {
            const pid = String(tier.product_id)
            if (!grouped[pid]) {
              grouped[pid] = []
            }
            grouped[pid].push({
              min_quantity: Number(tier.min_quantity),
              discount_percent: Number(tier.discount_percent)
            })
          })
        }

        return { success: true, data: grouped }
      }

      // Case 2: Fetch for a single product ID
      if (productId) {
        const { data, error } = await supabase
          .from('product_wholesale_tiers')
          .select('*')
          .eq('product_id', productId)
          .order('min_quantity', { ascending: true })

        if (error) throw error

        const formatted = (data || []).map((t: any) => ({
          min_quantity: Number(t.min_quantity),
          discount_percent: Number(t.discount_percent)
        }))

        return { success: true, data: formatted }
      }

      throw createError({ statusCode: 400, statusMessage: 'Thiếu thông số productId hoặc productIds' })
    }

    if (method === 'POST') {
      await requireAdmin(event)
      const body = await readBody(event)
      const { productId, tiers } = body

      if (!productId) {
        throw createError({ statusCode: 400, statusMessage: 'Thiếu productId sản phẩm' })
      }

      if (!Array.isArray(tiers)) {
        throw createError({ statusCode: 400, statusMessage: 'Dữ liệu mức sỉ không hợp lệ' })
      }

      // 1. Delete all existing custom tiers for this product
      const { error: deleteError } = await supabase
        .from('product_wholesale_tiers')
        .delete()
        .eq('product_id', String(productId))

      if (deleteError) throw deleteError

      if (tiers.length === 0) {
        return { success: true, data: [] }
      }

      // 2. Insert new tiers
      const recordsToInsert = tiers.map((t: any) => ({
        product_id: String(productId),
        min_quantity: parseInt(t.min_quantity) || 1,
        discount_percent: parseFloat(t.discount_percent) || 0
      }))

      const { data, error: insertError } = await supabase
        .from('product_wholesale_tiers')
        .insert(recordsToInsert)
        .select()

      if (insertError) throw insertError

      const formatted = (data || []).map((t: any) => ({
        min_quantity: Number(t.min_quantity),
        discount_percent: Number(t.discount_percent)
      }))

      return { success: true, data: formatted }
    }

    if (method === 'DELETE') {
      await requireAdmin(event)
      const query = getQuery(event)
      const productId = query.productId ? String(query.productId) : null

      if (!productId) {
        throw createError({ statusCode: 400, statusMessage: 'Thiếu productId sản phẩm' })
      }

      const { error } = await supabase
        .from('product_wholesale_tiers')
        .delete()
        .eq('product_id', productId)

      if (error) throw error

      return { success: true, message: 'Đã xóa cấu hình sỉ riêng thành công' }
    }
  } catch (err: any) {
    console.error('[Admin Product Wholesale Tiers API Error]:', err)

    if (err.code === '42P01') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Bảng product_wholesale_tiers chưa tồn tại. Vui lòng chạy các lệnh SQL trong tệp scripts/init_product_wholesale.sql'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Lỗi API: ${err.message}`
    })
  }
})
