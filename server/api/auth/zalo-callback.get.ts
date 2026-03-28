import { defineEventHandler, getQuery, setCookie, getCookie } from 'h3'
import { useSupabase } from '../../utils/supabase'

// Memory cache for used codes to prevent double-processing (within a short window)
const usedCodes = new Set<string>()
// Clean up old codes periodically
setInterval(() => usedCodes.clear(), 1000 * 60 * 5) // every 5 mins

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

  if (!code) {
    return sendHtmlResponse(event, 'zalo-login-error', 'Lỗi: Không tìm thấy authorization code từ Zalo')
  }

  // Prevent double processing of the same code
  if (usedCodes.has(code)) {
    console.warn('[Zalo Auth Debug] Code already used, ignoring duplicate request:', code.substring(0, 10) + '...')
    // If it's a duplicate, we can either return success (assuming the first request is still processing)
    // or just return empty to stop further execution.
    return sendHtmlResponse(event, 'zalo-login-info', 'Yêu cầu đang được xử lý...')
  }
  usedCodes.add(code)
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

    if (!appId || !appSecret) {
      throw new Error('Zalo App ID or App Secret not configured')
    }

    console.log('[Zalo Auth Debug] Code verifier from cookie:', !!codeVerifier, codeVerifier?.length)
    console.log('[Zalo Auth Debug] App Secret (prefix):', !!appSecret ? appSecret.substring(0, 4) + '...' : 'none')

    const exchangeBody = {
      code,
      app_id: appId as string,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier as string
    };
    
    console.log('[Zalo Auth Debug] Exchange params:', {
       ...exchangeBody,
       code: !!code,
       code_verifier: !!codeVerifier,
       app_id: appId
    })

    // 1. Exchange code for access token
    let tokenRes: any = await $fetch('https://oauth.zaloapp.com/v4/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'secret_key': appSecret
      } as Record<string, string>,
      body: new URLSearchParams(exchangeBody)
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

    // 2. Return Access Token to Frontend
    // We send the token back so the frontend (with a Vietnamese IP) can fetch the profile.
    console.log('[Zalo Auth Debug] Token obtained, sending back to frontend...')
    
    return sendHtmlResponse(event, 'zalo-token-received', accessToken)

  } catch (error: any) {
    console.error('Zalo Auth Error:', error)
    return sendHtmlResponse(event, 'zalo-login-error', error.message || String(error))
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
          const message = {
            type: '${message}',
            detail: '${detail.replace(/'/g, "\\'")}'
          };
          window.opener.postMessage(message, '*');
          
          if ('${message}' === 'zalo-login-success') {
             setTimeout(() => window.close(), 1000);
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
