import { defineEventHandler, readBody, getMethod } from 'h3'
import { useSupabase } from '../utils/supabase'

// Lưu status (hiện/ẩn) của từng nhóm sản phẩm
// group_key = '__group_status__', product_id = 'settings'
const GROUP_STATUS_KEY = '__group_status__'
const GROUP_STATUS_PRODUCT_ID = 'settings'

const defaultStatus = {
  'outlet-shop': true,
  'new-products': true,
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const supabase = useSupabase()

  if (method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('manual_groups')
        .select('product_data')
        .eq('group_key', GROUP_STATUS_KEY)
        .eq('product_id', GROUP_STATUS_PRODUCT_ID)
        .maybeSingle()

      if (error) {
        console.warn('[GroupStatus] GET error:', error.message)
        return { ...defaultStatus }
      }

      if (!data) return { ...defaultStatus }

      return { ...defaultStatus, ...(data.product_data || {}) }
    } catch (e: any) {
      console.error('[GroupStatus] GET exception:', e.message)
      return { ...defaultStatus }
    }
  }

  if (method === 'POST') {
    try {
      const body = await readBody(event)
      const value: any = {}

      // Validate: chỉ chấp nhận các group keys hợp lệ
      const validGroups = ['outlet-shop', 'new-products']
      for (const key in body) {
        if (validGroups.includes(key)) {
          value[key] = Boolean(body[key])
        }
      }

      // Upsert để tự động cập nhật hoặc thêm mới
      const { error } = await supabase
        .from('manual_groups')
        .upsert({
          group_key: GROUP_STATUS_KEY,
          product_id: GROUP_STATUS_PRODUCT_ID,
          product_data: value
        }, { onConflict: 'group_key,product_id' })

      if (error) throw error

      return { success: true, value }
    } catch (e: any) {
      console.error('[GroupStatus] POST error:', e.message)
      return { success: false, error: e.message }
    }
  }

  return { success: false, error: 'Method not allowed' }
})
