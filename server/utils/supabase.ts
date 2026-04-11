import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl
  const key = config.public.supabaseKey

  if (!url || !key) {
    throw new Error('Supabase configuration missing in runtimeConfig (SUPABASE_URL/SUPABASE_KEY)')
  }

  return createClient(url, key)
}
