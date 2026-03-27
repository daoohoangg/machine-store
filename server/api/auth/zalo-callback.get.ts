import { defineEventHandler, getQuery, setCookie, getCookie } from 'h3'
import { useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string
  const savedState = getCookie(event, 'zalo_state')

  if (!code || state !== savedState) {
    return sendHtmlResponse(event, 'zalo-login-error')
  }

  try {
    const appId = process.env.ZALO_APP_ID
    const appSecret = process.env.ZALO_APP_SECRET

    if (!appId || !appSecret) {
      throw new Error('Zalo App ID or App Secret not configured')
    }

    // 1. Exchange code for access token
    const tokenRes: any = await $fetch('https://oauth.zaloapp.com/v4/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'secret_key': appSecret
      } as Record<string, string>,
      body: new URLSearchParams({
        code,
        app_id: appId as string,
        grant_type: 'authorization_code'
      })
    })

    const accessToken = tokenRes.access_token
    if (!accessToken) throw new Error('Failed to get access token')

    // 2. Get User Profile
    const profileRes: any = await $fetch(`https://graph.zalo.me/v2.0/me?fields=id,name,picture`, {
      headers: {
        'access_token': accessToken
      }
    })

    const { id: zaloId, name, picture } = profileRes
    const avatarUrl = picture?.data?.url

    // 3. Upsert into Supabase
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
      console.error('Supabase upsert error:', upsertError)
      // If table doesn't exist yet, we might get an error. 
      // User is supposed to run the SQL.
    }

    // 4. Set auth cookie (consistent with existing phone login)
    setCookie(event, 'auth_token', 'zalo_' + zaloId, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    })

    return sendHtmlResponse(event, 'zalo-login-success')

  } catch (error) {
    console.error('Zalo Auth Error:', error)
    return sendHtmlResponse(event, 'zalo-login-error')
  }
})

function sendHtmlResponse(event: any, message: string) {
  return `
    <html>
      <head>
        <title>Zalo Login</title>
      </head>
      <body>
        <script>
          window.opener.postMessage('${message}', '*');
          window.close();
        </script>
        <p>Đang xử lý đăng nhập...</p>
      </body>
    </html>
  `
}
