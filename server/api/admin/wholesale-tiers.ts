import { useSupabase } from '../../utils/supabase'
import { requireAdmin } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = useSupabase()

  try {
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('wholesale_tiers')
        .select('*')
        .order('min_quantity', { ascending: true })

      if (error) throw error

      return { success: true, data }
    }

    if (method === 'POST') {
      await requireAdmin(event)
      const body = await readBody(event)
      const { tiers } = body

      if (!Array.isArray(tiers)) {
        throw createError({ statusCode: 400, statusMessage: 'Dữ liệu mức sỉ không hợp lệ' })
      }

      // Clear and re-insert (same pattern as membership tiers)
      const { error: deleteError } = await supabase
        .from('wholesale_tiers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (deleteError) throw deleteError

      if (tiers.length === 0) {
        return { success: true, data: [] }
      }

      const { data, error: insertError } = await supabase
        .from('wholesale_tiers')
        .insert(tiers.map((t: any) => ({
          min_quantity: parseInt(t.min_quantity) || 1,
          discount_percent: parseFloat(t.discount_percent) || 0
        })))
        .select()

      if (insertError) throw insertError

      return { success: true, data }
    }
  } catch (err: any) {
    console.error('[Admin Wholesale Tiers API Error]:', err)

    // If table doesn't exist, provide SQL to create it
    if (err.code === '42P01') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Bảng wholesale_tiers chưa tồn tại. Vui lòng chạy SQL: CREATE TABLE wholesale_tiers (id UUID DEFAULT gen_random_uuid() PRIMARY KEY, min_quantity INTEGER NOT NULL, discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW());'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Lỗi API: ${err.message}`
    })
  }
})
