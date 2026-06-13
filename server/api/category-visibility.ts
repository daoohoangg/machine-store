import { defineEventHandler, readBody, getMethod } from 'h3'
import { useSupabase } from '../utils/supabase'

// Lưu category visibility settings vào bảng manual_groups
// group_key = '__category_visibility__', product_id = 'settings'
const CATEGORY_VISIBILITY_GROUP_KEY = '__category_visibility__'
const CATEGORY_VISIBILITY_PRODUCT_ID = 'settings'

const defaultVisibility = {}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = useSupabase()

  if (method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('manual_groups')
        .select('product_data')
        .eq('group_key', CATEGORY_VISIBILITY_GROUP_KEY)
        .eq('product_id', CATEGORY_VISIBILITY_PRODUCT_ID)
        .maybeSingle()

      if (error) {
        console.warn('[CategoryVisibility] GET error:', error.message)
        return { ...defaultVisibility }
      }

      if (!data) return { ...defaultVisibility }

      return { ...defaultVisibility, ...(data.product_data || {}) }
    } catch (e: any) {
      console.error('[CategoryVisibility] GET exception:', e.message)
      return { ...defaultVisibility }
    }
  }

  if (method === 'POST') {
    try {
      const body = await readBody(event)

      // Validate: body should be an object with number keys and boolean values
      const value: any = {}
      for (const key in body) {
        const catId = Number(key)
        if (!isNaN(catId)) {
          value[catId] = Boolean(body[key])
        }
      }

      // Upsert để tự động cập nhật hoặc thêm mới, không bị lỗi duplicate
      const { error } = await supabase
        .from('manual_groups')
        .upsert({
          group_key: CATEGORY_VISIBILITY_GROUP_KEY,
          product_id: CATEGORY_VISIBILITY_PRODUCT_ID,
          product_data: value
        }, { onConflict: 'group_key,product_id' })

      if (error) throw error

      return { success: true, value }
    } catch (e: any) {
      console.error('[CategoryVisibility] POST error:', e.message)
      return { success: false, error: e.message }
    }
  }

  return { success: false, error: 'Method not allowed' }
})
