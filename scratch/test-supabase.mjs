import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const url = process.env.SUPABASE_URL
const key = process.env.SUPABASE_KEY

if (!url || !key) {
  console.error('SUPABASE_URL or SUPABASE_KEY missing in .env')
  process.exit(1)
}

const supabase = createClient(url, key)

async function test() {
  console.log('Testing Supabase connection...')
  const { data, error } = await supabase.from('vouchers').select('*').limit(1)
  
  if (error) {
    console.error('Error fetching vouchers:', error)
    if (error.code === '42P01') {
      console.log('HINT: The table "vouchers" does not exist.')
    }
  } else {
    console.log('Success! Found', data.length, 'vouchers (limited to 1)')
    console.log('Record:', data[0])
  }
}

test()
