import { defineEventHandler, readBody, getMethod } from 'h3'
import { useSupabase } from '../utils/supabase'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = useSupabase()

  if (method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('category_visibility')
        .select('category_id, is_visible')

      if (error) {
        console.warn('[CategoryVisibility] GET error:', error.message)
        return {}
      }

      if (!data || data.length === 0) return {}

      // Convert array to object: { categoryId: isVisible }
      const result: Record<number, boolean> = {}
      data.forEach((row: any) => {
        result[row.category_id] = row.is_visible
      })

      return result
    } catch (e: any) {
      console.error('[CategoryVisibility] GET exception:', e.message)
      return {}
    }
  }

  if (method === 'POST') {
    try {
      const body = await readBody(event)

      // Validate: body should be an object with number keys and boolean values
      const upsertData: any[] = []
      for (const key in body) {
        const catId = Number(key)
        if (!isNaN(catId)) {
          upsertData.push({
            category_id: catId,
            is_visible: Boolean(body[key])
          })
        }
      }

      if (upsertData.length === 0) {
        return { success: true, message: 'No valid data to save' }
      }

      // Upsert vào bảng category_visibility
      const { error } = await supabase
        .from('category_visibility')
        .upsert(upsertData, { onConflict: 'category_id' })

      if (error) throw error

      return { success: true, count: upsertData.length }
    } catch (e: any) {
      console.error('[CategoryVisibility] POST error:', e.message)
      return { success: false, error: e.message }
    }
  }

  return { success: false, error: 'Method not allowed' }
})
