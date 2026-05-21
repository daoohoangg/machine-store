import { createClient } from '@supabase/supabase-js'

const url = 'https://fdharkukrplerfekphfc.supabase.co'
const key = 'sb_publishable_bi8p5-tplSaH6v9FsgDwpQ_R05hmTK0'

const supabase = createClient(url, key)

async function test() {
  console.log('Querying membership_tiers table...')
  const { data, error } = await supabase
    .from('membership_tiers')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Query failed:', error)
  } else {
    console.log('Membership tiers data:', data)
  }
}

test()
