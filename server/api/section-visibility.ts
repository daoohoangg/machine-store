import { defineEventHandler, readBody, getMethod } from 'h3'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { useSupabase } from '../utils/supabase'

const CONFIG_KEY = 'section_visibility'
const jsonPath = path.resolve(process.cwd(), 'app/data/section-visibility.json')

const defaultVisibility = {
  showOutletShop: true,
  showNewProducts: true,
}

// Read from JSON file fallback
const readFromFile = (): typeof defaultVisibility => {
  try {
    if (fs.existsSync(jsonPath)) {
      const raw = fs.readFileSync(jsonPath, 'utf-8')
      return { ...defaultVisibility, ...JSON.parse(raw) }
    }
  } catch (e) {
    console.warn('[SectionVisibility] Could not read JSON file:', e)
  }
  return { ...defaultVisibility }
}

// Write to JSON file fallback
const writeToFile = (value: typeof defaultVisibility) => {
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(value, null, 2), 'utf-8')
  } catch (e) {
    console.warn('[SectionVisibility] Could not write JSON file:', e)
  }
}

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  if (method === 'GET') {
    // Try Supabase first, fallback to JSON file
    try {
      const supabase = useSupabase()
      const { data, error } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', CONFIG_KEY)
        .maybeSingle()

      if (!error && data) {
        return { ...defaultVisibility, ...data.value }
      }
      // Table doesn't exist or error - try JSON file
    } catch (e: any) {
      console.warn('[SectionVisibility] Supabase not available, using JSON file:', e.message)
    }

    return readFromFile()
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const value = {
      showOutletShop: body.showOutletShop ?? true,
      showNewProducts: body.showNewProducts ?? true,
    }

    // Try Supabase first
    try {
      const supabase = useSupabase()
      const { error } = await supabase
        .from('site_config')
        .upsert({ key: CONFIG_KEY, value }, { onConflict: 'key' })

      if (!error) {
        // Also save to file as backup
        writeToFile(value)
        return { success: true, value }
      }
      // Supabase failed (e.g. table not exists) - fallback to file
      console.warn('[SectionVisibility] Supabase upsert failed, using file fallback')
    } catch (e: any) {
      console.warn('[SectionVisibility] Supabase not available for save, using JSON file:', e.message)
    }

    // Fallback: save to JSON file
    writeToFile(value)
    return { success: true, value, storage: 'file' }
  }

  return { success: false, error: 'Method not allowed' }
})
