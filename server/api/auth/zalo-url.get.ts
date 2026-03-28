import { defineEventHandler, sendRedirect, setCookie, getRequestURL, createError } from 'h3'
import { createHash, randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const appId = config.zaloAppId
  const origin = getRequestURL(event).origin
  const isDev = process.env.NODE_ENV === 'development'
  const siteUrl = config.public.siteUrl || origin
  
  let redirectUri = config.zaloRedirectUri
  
  // Logic to determine redirectUri:
  // 1. If in development, ALWAYS use the current origin.
  // 2. Otherwise, prefer the siteUrl from config to ensure correct protocol (https).
  if (isDev) {
    redirectUri = `${origin}/api/auth/zalo-callback`
  } else if (!redirectUri) {
    redirectUri = `${siteUrl}/api/auth/zalo-callback`
  }

  console.log('[Zalo Auth Debug] Requesting with:', { 
    origin,
    siteUrl,
    isDev,
    finalRedirectUri: redirectUri,
    hasAppId: !!appId
  })

  // PKCE Implementation
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let codeVerifier = ''
  for (let i = 0; i < 43; i++) {
    codeVerifier += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/=/g, '')

  const state = Math.random().toString(36).substring(7)
  console.log('[Zalo Auth Debug] Generating URL with:', { 
    appId: !!appId, 
    redirectUri, 
    state, 
    codeChallenge: !!codeChallenge,
    verifierPrefix: codeVerifier.substring(0, 5) + '...'
  })

  // Store state and code_verifier in cookies
  const cookieOptions: any = { 
    maxAge: 600, 
    httpOnly: true, 
    path: '/', 
    sameSite: 'lax',
    secure: !isDev || origin.startsWith('https')
  }
  
  setCookie(event, 'zalo_state', state, cookieOptions)
  setCookie(event, 'zalo_code_verifier', codeVerifier, cookieOptions)

  const zaloAuthUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&code_challenge=${codeChallenge}`
  
  return sendRedirect(event, zaloAuthUrl)
})
