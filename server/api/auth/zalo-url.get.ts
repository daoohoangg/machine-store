import { defineEventHandler, sendRedirect, setCookie, getRequestURL, createError } from 'h3'
import { createHash, randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const appId = config.zaloAppId
  let redirectUri = config.zaloRedirectUri
  
  if (!redirectUri) {
     // Default to local/current origin if not in .env
     const origin = getRequestURL(event).origin
     redirectUri = `${origin}/api/auth/zalo-callback`
  }

  if (!appId) {
    throw createError({ statusCode: 500, statusMessage: 'Zalo App ID not configured' })
  }

  // PKCE Implementation
  const codeVerifier = randomBytes(32).toString('base64url').substring(0, 43)
  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  const state = Math.random().toString(36).substring(7)
  
  // Store state and code_verifier in cookies
  setCookie(event, 'zalo_state', state, { maxAge: 600, httpOnly: true })
  setCookie(event, 'zalo_code_verifier', codeVerifier, { maxAge: 600, httpOnly: true })

  const zaloAuthUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&code_challenge=${codeChallenge}`
  
  return sendRedirect(event, zaloAuthUrl)
})
