import { createClient } from '@supabase/supabase-js'

const url = 'https://fdharkukrplerfekphfc.supabase.co'
const key = 'sb_publishable_bi8p5-tplSaH6v9FsgDwpQ_R05hmTK0'

const supabase = createClient(url, key)

const newTiers = [
  { name: 'Thành viên (Hạng mặc định)', percent: 0 },
  { name: 'ĐẠI LÍ CẤP 2 (Giá NPP + 2%)', percent: 32.0 },
  { name: 'ĐẠI LÍ CẤP 2 (Giá NPP + 1%)', percent: 32.666667 },
  { name: 'ĐẠI LÍ CẤP 1 (Giá NPP)', percent: 33.333 },
  { name: 'NHÀ PHÂN PHỐI (Giá NPP + 3%)', percent: 31.333333 },
  { name: 'NHÀ PHÂN PHỐI (Giá NPP + 2%)', percent: 32.0 },
  { name: 'NHÀ PHÂN PHỐI (Giá NPP + 1%)', percent: 32.666667 },
  { name: 'NHÀ PHÂN PHỐI (Giá NPP + CK quý 3%)', percent: 31.333333 }
]

async function run() {
  console.log('Fetching existing membership tiers...')
  const { data: existing, error: getError } = await supabase
    .from('membership_tiers')
    .select('*')

  if (getError) {
    console.error('Error fetching tiers:', getError)
    return
  }

  console.log(`Found ${existing.length} existing tiers. Merging with new ones...`)
  
  // Merge list, preventing duplicates based on name (case-insensitive)
  const mergedList = [...existing]
  
  for (const nt of newTiers) {
    const exists = existing.some(et => et.name.trim().toLowerCase() === nt.name.trim().toLowerCase())
    if (!exists) {
      mergedList.push(nt)
    }
  }

  console.log(`Total merged list size: ${mergedList.value || mergedList.length}. Saving to database...`)

  // Clear existing
  const { error: deleteError } = await supabase
    .from('membership_tiers')
    .delete()
    .neq('name', '___NON_EXISTENT_NAME___') // Delete all

  if (deleteError) {
    console.error('Error clearing old tiers:', deleteError)
    return
  }

  // Insert merged list
  const recordsToInsert = mergedList.map(t => ({
    name: t.name,
    percent: t.percent
  }))

  const { data: inserted, error: insertError } = await supabase
    .from('membership_tiers')
    .insert(recordsToInsert)
    .select()

  if (insertError) {
    console.error('Error inserting merged list:', insertError)
  } else {
    console.log('Successfully inserted merged list! New tiers list:')
    console.table(inserted.map(i => ({ Tên: i.name, '% Chiết khấu': i.percent })))
  }
}

run()
