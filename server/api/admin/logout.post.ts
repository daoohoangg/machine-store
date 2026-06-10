import { defineEventHandler, deleteCookie } from 'h3'

export default defineEventHandler((event) => {
  // Clear admin token cookie
  deleteCookie(event, 'admin_token', {
    httpOnly: true,
    path: '/'
  })
  
  // Also clear user token if exists
  deleteCookie(event, 'auth_token', {
    httpOnly: true,
    path: '/'
  })
  
  console.log('[Admin Logout] Cleared auth cookies')
  
  return {
    success: true,
    message: 'Ðang xu?t thành công'
  }
})
