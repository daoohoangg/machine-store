import { useSupabase } from '../../utils/supabase'
import { requireAdmin } from '../../utils/adminAuth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const method = getMethod(event)
  const supabase = useSupabase()

  try {
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('vouchers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    }

    if (method === 'POST') {
      const body = await readBody(event)
      
      const { data, error } = await supabase
        .from('vouchers')
        .insert([{
          code: body.code,
          type: body.type,
          value: parseFloat(body.value),
          min_order_value: parseFloat(body.min_order_value) || 0,
          max_discount: body.max_discount ? parseFloat(body.max_discount) : null,
          start_date: body.start_date || null,
          end_date: body.end_date || null,
          usage_limit: body.usage_limit ? parseInt(body.usage_limit) : null,
          status: body.status !== undefined ? body.status : true
        }])
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    }

    if (method === 'PUT') {
      const body = await readBody(event)
      const { id, ...updateData } = body

      if (!id) throw createError({ statusCode: 400, statusMessage: 'Voucher ID is required' })

      const { data, error } = await supabase
        .from('vouchers')
        .update({
          code: updateData.code,
          type: updateData.type,
          value: parseFloat(updateData.value),
          min_order_value: parseFloat(updateData.min_order_value) || 0,
          max_discount: updateData.max_discount ? parseFloat(updateData.max_discount) : null,
          start_date: updateData.start_date || null,
          end_date: updateData.end_date || null,
          usage_limit: updateData.usage_limit ? parseInt(updateData.usage_limit) : null,
          status: updateData.status
        })
        .eq('id', id)
        .select()

      if (error) throw error
      return { success: true, data: data[0] }
    }

    if (method === 'DELETE') {
      const query = getQuery(event)
      const id = query.id

      if (!id) throw createError({ statusCode: 400, statusMessage: 'Voucher ID is required' })

      const { error } = await supabase
        .from('vouchers')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true, message: 'Voucher deleted successfully' }
    }

  } catch (err: any) {
    console.error('[Admin Vouchers API Error]:', err)
    
    // Check for table not found
    if (err.code === '42P01') {
      throw createError({
        statusCode: 500,
        statusMessage: 'Bảng vouchers chưa tồn tại. Vui lòng chạy script SQL tại scripts/init_vouchers.sql'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: `Lỗi API: ${err.message}`
    })
  }
})
