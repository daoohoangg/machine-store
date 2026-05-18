import { defineEventHandler, readBody, getMethod } from 'h3'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { useSupabase } from '../utils/supabase'

// The JSON file for migration
const jsonPath = path.resolve(process.cwd(), 'app/data/manual-groups.json')

export default defineEventHandler(async (event) => {
  try {
    const method = getMethod(event)
    console.log(`[ManualGroups] Handling ${method} request via Supabase`)

    const supabase = useSupabase()
    
    if (method === 'GET') {
      try {
        // Check if table is empty to trigger migration
        const { count, error: countError } = await supabase
          .from('manual_groups')
          .select('*', { count: 'exact', head: true })
        
        if (!countError && count === 0 && fs.existsSync(jsonPath)) {
          console.log('[Supabase] Migrating manual-groups.json to Supabase...')
          const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
          
          const itemsToInsert: any[] = []
          for (const groupKey in data) {
            const products = data[groupKey]
            if (Array.isArray(products)) {
              for (const product of products) {
                itemsToInsert.push({
                  group_key: groupKey,
                  product_id: String(product.id),
                  product_data: product
                })
              }
            }
          }

          if (itemsToInsert.length > 0) {
            const { error: insertError } = await supabase
              .from('manual_groups')
              .insert(itemsToInsert)

            if (insertError) {
              console.error('[Supabase] Manual Groups Migration error:', insertError)
            } else {
              console.log('[Supabase] Manual Groups Migration successful')
            }
          }
        }

        const { data: rows, error } = await supabase
          .from('manual_groups')
          .select('*')
        
        if (error) throw error

        const result: any = { "outlet-shop": [], "new-products": [] }
        if (rows) {
          for (const row of rows) {
            if (!result[row.group_key]) result[row.group_key] = []
            result[row.group_key].push(row.product_data)
          }
        }
        
        return result
      } catch (e: any) {
        console.error('Supabase Manual Groups GET error:', e)
        return { error: e.message, status: 'error' }
      }
    }

    if (method === 'POST' || method === 'PUT') {
      try {
        const body = await readBody(event)
        
        if (!body || typeof body !== 'object') {
          throw new Error('Invalid request body')
        }

        // 1. Delete all existing manual groups (bỏ qua rows settings bắt đầu bằng '__')
        const { error: deleteError } = await supabase
          .from('manual_groups')
          .delete()
          .not('group_key', 'like', '__%')

        if (deleteError) throw deleteError

        // 2. Prepare items for insertion
        const itemsToInsert: any[] = []
        for (const groupKey in body) {
          const products = body[groupKey]
          if (Array.isArray(products)) {
            for (const product of products) {
              if (!product || !product.id) continue;
              itemsToInsert.push({
                group_key: groupKey,
                product_id: String(product.id),
                product_data: product
              })
            }
          }
        }

        if (itemsToInsert.length > 0) {
          const { error: insertError } = await supabase
            .from('manual_groups')
            .insert(itemsToInsert)

          if (insertError) throw insertError
        }
        
        return { success: true }
      } catch (e: any) {
        console.error('Supabase Manual Groups POST/PUT error:', e)
        return { success: false, error: e.message }
      }
    }
  } catch (globalError: any) {
    console.error('[Supabase ManualGroups GLOBAL ERROR]:', globalError)
    return { success: false, error: 'Supabase Initialization Error: ' + globalError.message }
  }
})
