import { defineEventHandler, readBody, getMethod } from 'h3'
import { useSupabase } from '../utils/supabase'

// Lưu visibility settings vào bảng manual_groups sẵn có (không cần tạo bảng mới)
// group_key = '__visibility__', product_id = 'settings'
const VISIBILITY_GROUP_KEY = '__visibility__'
const VISIBILITY_PRODUCT_ID = 'settings'

const defaultVisibility = {
  showOutletShop: true,
  showNewProducts: true,
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = useSupabase()

  if (method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('manual_groups')
        .select('product_data')
        .eq('group_key', VISIBILITY_GROUP_KEY)
        .eq('product_id', VISIBILITY_PRODUCT_ID)
        .maybeSingle()

      if (error) {
        console.warn('[SectionVisibility] GET error:', error.message)
        return { ...defaultVisibility }
      }

      if (!data) return { ...defaultVisibility }

      return { ...defaultVisibility, ...(data.product_data || {}) }
    } catch (e: any) {
      console.error('[SectionVisibility] GET exception:', e.message)
      return { ...defaultVisibility }
    }
  }

  if (method === 'POST') {
    try {
      const body = await readBody(event)
      const value = {
        showOutletShop: body.showOutletShop ?? true,
        showNewProducts: body.showNewProducts ?? true,
      }

      // Xóa row cũ nếu có
      await supabase
        .from('manual_groups')
        .delete()
        .eq('group_key', VISIBILITY_GROUP_KEY)
        .eq('product_id', VISIBILITY_PRODUCT_ID)

      // Insert row mới
      const { error } = await supabase
        .from('manual_groups')
        .insert({
          group_key: VISIBILITY_GROUP_KEY,
          product_id: VISIBILITY_PRODUCT_ID,
          product_data: value
        })

      if (error) throw error

      return { success: true, value }
    } catch (e: any) {
      console.error('[SectionVisibility] POST error:', e.message)
      return { success: false, error: e.message }
    }
  }

  return { success: false, error: 'Method not allowed' }
})
