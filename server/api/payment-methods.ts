import { defineEventHandler, readBody, getMethod } from 'h3'
import { useSupabase } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = useSupabase()

  if (method === 'GET') {
    try {
      const { data: methods, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('order', { ascending: true })

      if (error) {
        // If the table doesn't exist, this will throw
        // The user MUST create the table in Supabase dashboard
        throw error
      }
      return methods || []
    } catch (e: any) {
      console.error('Supabase PaymentMethods GET error:', e)
      return { error: e.message, status: 'error' }
    }
  }

  if (method === 'POST') {
    try {
      const body = await readBody(event) // array of methods
      
      // Delete all existing and insert new
      const { error: deleteError } = await supabase
        .from('payment_methods')
        .delete()
        .neq('id', -1)

      if (deleteError) throw deleteError

      const itemsToInsert = body.map((item: any) => ({
        key: item.key || '',
        title: item.title || '',
        description: item.description || '',
        icon: item.icon || 'fa-credit-card',
        is_active: !!item.is_active,
        order: item.order || 0
      }))

      const { error: insertError } = await supabase
        .from('payment_methods')
        .insert(itemsToInsert)

      if (insertError) throw insertError
      
      return { success: true }
    } catch (e: any) {
      console.error('Supabase PaymentMethods POST error:', e)
      return { success: false, error: e.message }
    }
  }
})
