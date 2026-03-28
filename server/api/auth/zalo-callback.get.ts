import { defineEventHandler, getQuery, setCookie, getCookie } from 'h3'
import { useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = query.code as string
  const state = query.state as string
  const origin = getRequestURL(event).origin
  const config = useRuntimeConfig(event)
  const isDev = process.env.NODE_ENV === 'development'
  const siteUrl = config.public.siteUrl || origin
  
  const savedState = getCookie(event, 'zalo_state')
  const codeVerifier = getCookie(event, 'zalo_code_verifier')
  
  let redirectUri = config.public.zaloRedirectUri
  if (isDev) {
    redirectUri = `${origin}/api/auth/zalo-callback`
  } else if (!redirectUri) {
    redirectUri = `${siteUrl}/api/auth/zalo-callback`
  }

  console.log('[Zalo Auth Debug] Callback started', { 
    code: !!code, 
    queryState: state, 
    savedState, 
    matching: state === savedState,
    hasVerifier: !!codeVerifier,
    verifierLength: codeVerifier?.length,
    origin,
    isDev,
    redirectUri
  })

  // Detailed validation for better error messages
  if (!code) {
    return sendHtmlResponse(event, 'zalo-login-error', 'Lỗi: Không tìm thấy authorization code từ Zalo')
  }
  if (!state || state !== savedState) {
    console.warn('[Zalo Auth Debug] State mismatch or missing', { queryState: state, savedState })
    return sendHtmlResponse(event, 'zalo-login-error', 'Lỗi: State không khớp (có thể do hết hạn phiên làm việc hoặc mismatch domain)')
  }
  if (!codeVerifier) {
    return sendHtmlResponse(event, 'zalo-login-error', 'Lỗi: Thiếu code_verifier (Cookie đã bị xóa hoặc không được gửi)')
  }

  try {
    const appId = config.zaloAppId
    const appSecret = config.zaloAppSecret
    
    console.log('[Zalo Auth Debug] Config:', { appId: !!appId, appSecret: !!appSecret ? appSecret.substring(0, 4) + '...' : 'none' })

    if (!appId || !appSecret) {
      throw new Error('Zalo App ID or App Secret not configured')
    }

    // 1. Exchange code for access token
    let tokenRes: any = await $fetch('https://oauth.zaloapp.com/v4/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'secret_key': appSecret
      } as Record<string, string>,
      body: new URLSearchParams({
        code,
        app_id: appId as string,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier as string,
        redirect_uri: redirectUri as string
      })
    })

    // Robust parsing if response is a string
    if (typeof tokenRes === 'string') {
      try {
        tokenRes = JSON.parse(tokenRes)
      } catch (e) {
        console.error('[Zalo Auth Debug] Failed to parse token response as JSON:', tokenRes)
      }
    }

    const accessToken = tokenRes?.access_token
    if (!accessToken) {
      console.error('[Zalo Auth Debug] Token exchange response ERROR:', tokenRes)
      throw new Error(`Zalo API error: ${tokenRes?.error_name || 'unknown'} (${tokenRes?.error_description || ''})`)
    }

    // 2. Get User Profile
    console.log('[Zalo Auth Debug] Fetching profile with token...')
    const profileRes: any = await $fetch(`https://graph.zalo.me/v2.0/me?fields=id,name,picture`, {
      headers: {
        'access_token': accessToken
      }
    }).catch(err => {
      console.error('[Zalo Auth Debug] Profile fetch Exception:', err)
      return { error: err.message }
    })

    console.log('[Zalo Auth Debug] Profile response:', profileRes)

    if (!profileRes?.id) {
       console.error('[Zalo Auth Debug] Profile retrieval failed:', profileRes)
       throw new Error('Failed to get user profile')
    }

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
      path: '/',
      sameSite: 'lax',
      secure: !isDev || origin.startsWith('https')
    })

    return sendHtmlResponse(event, 'zalo-login-success')

  } catch (error) {
    console.error('Zalo Auth Error:', error)
    return sendHtmlResponse(event, 'zalo-login-error')
  }
})

function sendHtmlResponse(event: any, message: string, detail: string = '') {
  return `
    <html>
      <head>
        <title>Zalo Login</title>
        <meta property="zalo-platform-site-verification" content="QS-S9uF2INrww9DX_iWBQtJ3aNAOjKKbDZGq" />
      </head>
      <body>
        <script>
          window.opener.postMessage('${message}', '*');
          if ('${detail}') {
             console.error('Zalo Auth Details:', '${detail}');
          } else if ('${message}' === 'zalo-login-success') {
             window.close();
          }
        </script>
        <p>Đang xử lý đăng nhập...</p>
        ${detail ? `
        <div style="color: red; font-size: 14px; padding: 20px; border: 1px solid red; background: #fff1f1; margin-top: 20px;">
          <b>LỖI ĐĂNG NHẬP:</b><br/> ${detail}
        </div>
        ` : ''}
      </body>
    </html>
  `
}
