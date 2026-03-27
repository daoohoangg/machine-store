import { defineEventHandler, readBody, getMethod } from 'h3'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { useSqlite } from '../utils/sqlite'

// The JSON file for migration
const jsonPath = path.resolve(process.cwd(), 'app/data/news.json')

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  const db = useSqlite()

  if (method === 'GET') {
    try {
      // Check if table is empty
      const count: any = db.prepare('SELECT COUNT(*) as count FROM news').get()
      
      if (count.count === 0 && fs.existsSync(jsonPath)) {
        console.log('Migrating news.json to SQLite...')
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
        
        const insert = db.prepare(`
          INSERT INTO news (slug, image, tag, title, description, link, content)
          VALUES (@slug, @image, @tag, @title, @description, @link, @content)
        `)
        
        db.transaction((items) => {
          for (const item of items) {
            insert.run({
                slug: item.slug || '',
                image: item.image || '',
                tag: item.tag || '',
                title: item.title || '',
                description: item.description || '',
                link: item.link || '',
                content: item.content || ''
            })
          }
        })(data)
      }

      const news = db.prepare('SELECT * FROM news ORDER BY id DESC').all()
      return news
    } catch (e) {
      console.error('SQLite News GET error:', e)
      return []
    }
  }

  if (method === 'POST' || method === 'PUT') {
    try {
      const body = await readBody(event) // This is an array of news items
      
      db.transaction((items) => {
        // Clear table and re-insert
        db.prepare('DELETE FROM news').run()
        const insert = db.prepare(`
          INSERT INTO news (slug, image, tag, title, description, link, content)
          VALUES (@slug, @image, @tag, @title, @description, @link, @content)
        `)
        for (const item of items) {
          insert.run({
              slug: item.slug || '',
              image: item.image || '',
              tag: item.tag || '',
              title: item.title || '',
              description: item.description || '',
              link: item.link || '',
              content: item.content || ''
          })
        }
      })(body)
      
      return { success: true }
    } catch (e: any) {
      console.error('SQLite News POST/PUT error:', e)
      return { success: false, error: e.message }
    }
  }
})
