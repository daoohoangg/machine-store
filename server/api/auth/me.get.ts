import { useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const authToken = getCookie(event, 'auth_token')
  const adminToken = getCookie(event, 'admin_token')

  console.log('[Auth Me Debug] Checking tokens - Auth:', !!authToken, 'Admin:', !!adminToken);

  if (!authToken && !adminToken) {
    return { authenticated: false }
  }

  try {
    const supabase = useSupabase()
    let userPhone = ''
    let isAdmin = false

    if (adminToken) {
      // Decode admin token (which we base64 encoded in login.post.ts)
      try {
        const decoded = Buffer.from(adminToken, 'base64').toString('utf-8')
        if (decoded.startsWith('admin_')) {
          const parts = decoded.split('_')
          userPhone = parts[1]
          isAdmin = true
        }
      } catch (e) {
        console.error('Failed to decode admin token', e)
      }
    }

    if (!userPhone && authToken) {
      if (authToken.startsWith('user_')) {
        userPhone = authToken.replace('user_', '')
      }
    }

    if (!userPhone) {
      return { authenticated: false }
    }

    // Fetch user details from Supabase
    const { data: account, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('phone', userPhone)
      .single()

    if (error || !account) {
      // If not in Supabase yet, we only have the phone from the token
      return {
        authenticated: true,
        user: {
          phone: userPhone,
          name: userPhone,
          isAdmin: isAdmin
        }
      }
    }

    return {
      authenticated: true,
      user: {
        ...account,
        isAdmin: isAdmin || account.role === 'admin'
      }
    }
  } catch (err) {
    console.error('[Auth Me Error]:', err)
    return { authenticated: false, error: 'Internal Server Error' }
  }
})
