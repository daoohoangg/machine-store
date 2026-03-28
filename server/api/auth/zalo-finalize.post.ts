import { defineEventHandler, readBody, setCookie, createError } from 'h3'
import { useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { id: zaloId, name, picture } = body || {}
  
  if (!zaloId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid profile data provided'
    })
  }

  const avatarUrl = picture?.data?.url
  const origin = getRequestURL(event).origin
  const isDev = process.env.NODE_ENV === 'development'

  try {
    // 1. Upsert into Supabase
    const supabase = useSupabase()
    const { data: account, error: upsertError } = await supabase
      .from('accounts')
      .upsert({
        zalo_id: zaloId,
        full_name: name,
        avatar_url: avatarUrl,
        last_login: new Date().toISOString()
      }, { onConflict: 'zalo_id' })
      .select()
      .single()

    if (upsertError) {
      console.error('Supabase upsert error in finalize:', upsertError)
      // We continue even if upsert fails for now, or you might want to throw error
    }

    // 2. Set auth cookie (consistent with existing phone login)
    setCookie(event, 'auth_token', 'zalo_' + zaloId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      sameSite: 'lax',
      secure: !isDev || origin.startsWith('https')
    })

    return { success: true, zaloId }

  } catch (error: any) {
    console.error('Zalo Finalize Error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to finalize Zalo login'
    })
  }
})
