import { defineEventHandler, readBody, getMethod } from 'h3'
import * as fs from 'node:fs'
import * as path from 'node:path'

const dataPath = path.resolve(process.cwd(), 'app/data/manual-groups.json')

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  if (method === 'GET') {
    try {
      if (!fs.existsSync(dataPath)) {
        return { "flash-sale": [], "new-products": [] }
      }
      const data = fs.readFileSync(dataPath, 'utf-8')
      return JSON.parse(data)
    } catch (e) {
      return { "flash-sale": [], "new-products": [] }
    }
  }

  if (method === 'POST' || method === 'PUT') {
    try {
      const body = await readBody(event)
      
      const dir = path.dirname(dataPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      
      fs.writeFileSync(dataPath, JSON.stringify(body, null, 2), 'utf-8')
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  }
})
