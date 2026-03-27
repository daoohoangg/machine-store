import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_KEY

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY must be set in .env')
  }

  return createClient(url, key)
}
