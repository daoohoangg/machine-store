import { defineEventHandler, readBody, getMethod } from 'h3'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { useSupabase } from '../utils/supabase'

// The JSON file for migration
const jsonPath = path.resolve(process.cwd(), 'app/data/news.json')

export default defineEventHandler(async (event) => {
  try {
    const method = getMethod(event)
    const supabase = useSupabase()

    if (method === 'GET') {
      try {
        // Check if table is empty to trigger migration
        const { count, error: countError } = await supabase
          .from('news')
          .select('*', { count: 'exact', head: true })

        if (!countError && count === 0 && fs.existsSync(jsonPath)) {
          console.log('[Supabase] Migrating news.json to Supabase...')
          const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
          
          const itemsToInsert = data.map((item: any) => ({
            slug: item.slug || '',
            image: item.image || '',
            tag: item.tag || '',
            title: item.title || '',
            description: item.description || '',
            link: item.link || '',
            content: item.content || ''
          }))

          const { error: insertError } = await supabase
            .from('news')
            .insert(itemsToInsert)

          if (insertError) {
            console.error('[Supabase] Migration error:', insertError)
          } else {
            console.log('[Supabase] Migration successful')
          }
        }

        const { data: news, error } = await supabase
          .from('news')
          .select('*')
          .order('id', { ascending: false })

        if (error) throw error
        return news || []
      } catch (e: any) {
        console.error('Supabase News GET error:', e)
        return { error: e.message, status: 'error' }
      }
    }

    if (method === 'POST' || method === 'PUT') {
      try {
        const body = await readBody(event) // This is an array of news items
        
        // Supabase doesn't have a simple "delete all and insert" in one transaction easily without RPC
        // But we can delete and then insert.
        // For a simple app, we can just delete all rows.
        const { error: deleteError } = await supabase
          .from('news')
          .delete()
          .neq('id', -1) // Delete all

        if (deleteError) throw deleteError

        const itemsToInsert = body.map((item: any) => ({
          slug: item.slug || '',
          image: item.image || '',
          tag: item.tag || '',
          title: item.title || '',
          description: item.description || '',
          link: item.link || '',
          content: item.content || ''
        }))

        const { error: insertError } = await supabase
          .from('news')
          .insert(itemsToInsert)

        if (insertError) throw insertError
        
        return { success: true }
      } catch (e: any) {
        console.error('Supabase News POST/PUT error:', e)
        return { success: false, error: e.message }
      }
    }
  } catch (globalError: any) {
    console.error('[Supabase News GLOBAL ERROR]:', globalError)
    return { success: false, error: 'Supabase Initialization Error: ' + globalError.message }
  }
})
