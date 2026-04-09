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
        // If table doesn't exist yet, return a helpful error or empty array
        // In a real migration we might check for table existence
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
      const body = await readBody(event) // This is an array of payment method items
      
      // Delete all existing methods first to keep it simple (upsert matching is complex via client)
      const { error: deleteError } = await supabase
        .from('payment_methods')
        .delete()
        .neq('id', -1) // Delete all

      if (deleteError) throw deleteError

      const itemsToInsert = body.map((item: any) => ({
        key: item.key || '',
        title: item.title || '',
        description: item.description || '',
        icon: item.icon || 'fa-credit-card',
        is_active: item.is_active !== undefined ? item.is_active : true,
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
