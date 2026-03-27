import { defineEventHandler, readBody, getMethod } from 'h3'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { useSqlite } from '../utils/sqlite'

// The JSON file for migration
const jsonPath = path.resolve(process.cwd(), 'app/data/manual-groups.json')

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const db = useSqlite()
  
  if (method === 'GET') {
    try {
      // Check if table is empty
      const count: any = db.prepare('SELECT COUNT(*) as count FROM manual_groups').get()
      
      if (count.count === 0 && fs.existsSync(jsonPath)) {
        console.log('Migrating manual-groups.json to SQLite...')
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
        
        const insert = db.prepare(`
          INSERT INTO manual_groups (group_key, product_id, product_data)
          VALUES (@group_key, @product_id, @product_data)
        `)
        
        db.transaction(() => {
          for (const groupKey in data) {
            const products = data[groupKey]
            if (Array.isArray(products)) {
              for (const product of products) {
                insert.run({
                  group_key: groupKey,
                  product_id: String(product.id),
                  product_data: JSON.stringify(product)
                })
              }
            }
          }
        })()
      }

      const rows = db.prepare('SELECT * FROM manual_groups').all()
      const result: any = { "flash-sale": [], "new-products": [] }
      
      for (const row of rows as any[]) {
        if (!result[row.group_key]) result[row.group_key] = []
        result[row.group_key].push(JSON.parse(row.product_data))
      }
      
      return result
    } catch (e) {
      console.error('SQLite Manual Groups GET error:', e)
      return { "flash-sale": [], "new-products": [] }
    }
  }

  if (method === 'POST' || method === 'PUT') {
    try {
      const body = await readBody(event) // This is an object with group keys
      
      db.transaction(() => {
        // Clear table and re-insert
        db.prepare('DELETE FROM manual_groups').run()
        const insert = db.prepare(`
          INSERT INTO manual_groups (group_key, product_id, product_data)
          VALUES (@group_key, @product_id, @product_data)
        `)
        
        for (const groupKey in body) {
          const products = body[groupKey]
          if (Array.isArray(products)) {
            for (const product of products) {
              insert.run({
                group_key: groupKey,
                product_id: String(product.id),
                product_data: JSON.stringify(product)
              })
            }
          }
        }
      })()
      
      return { success: true }
    } catch (e: any) {
      console.error('SQLite Manual Groups POST/PUT error:', e)
      return { success: false, error: e.message }
    }
  }
})
