import { defineEventHandler, sendRedirect } from 'h3'

export default defineEventHandler(async (event) => {
  const appId = process.env.ZALO_APP_ID
  let redirectUri = process.env.ZALO_REDIRECT_URI
  
  if (!redirectUri) {
     // Default to local/current origin if not in .env
     const origin = getRequestURL(event).origin
     redirectUri = `${origin}/api/auth/zalo-callback`
  }

  if (!appId) {
    throw createError({ statusCode: 500, statusMessage: 'Zalo App ID not configured' })
  }

  const state = Math.random().toString(36).substring(7)
  
  // Store state in cookie to verify on callback
  setCookie(event, 'zalo_state', state, { maxAge: 600, httpOnly: true })

  const zaloAuthUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
  
  return sendRedirect(event, zaloAuthUrl)
})
