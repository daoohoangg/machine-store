import { useSupabase } from '../../utils/supabase'
import { requireAdmin } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = useSupabase()

  try {
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('membership_tiers')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      return { success: true, data }
    }

    if (method === 'POST') {
      await requireAdmin(event)
      const body = await readBody(event)
      const { tiers } = body

      if (!Array.isArray(tiers)) {
        throw createError({ statusCode: 400, statusMessage: 'Dữ liệu hạng thành viên không hợp lệ' })
      }

      // We'll perform a clear and insert (or upsert if preferred)
      // For simplicity in managing a small config table, clearing and re-inserting is often cleaner
      const { error: deleteError } = await supabase
        .from('membership_tiers')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

      if (deleteError) throw deleteError

      const { data, error: insertError } = await supabase
        .from('membership_tiers')
        .insert(tiers.map((t: any) => ({
          name: t.name,
          percent: parseFloat(t.percent) || 0
        })))
        .select()

      if (insertError) throw insertError

      return { success: true, data }
    }
  } catch (err: any) {
    console.error('[Admin Tiers API Error]:', err)
    
    // If table doesn't exist, provide a helpful error message with SQL
    if (err.code === '42P01') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Bảng membership_tiers chưa tồn tại trong Database. Vui lòng chạy câu lệnh SQL khởi tạo.'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Lỗi API: ${err.message}`
    })
  }
})
