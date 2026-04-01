import { defineEventHandler, getCookie, setCookie, getRequestURL } from 'h3'

export default defineEventHandler((event) => {
  const isDev = process.env.NODE_ENV === 'development'
  const origin = getRequestURL(event).origin
  const maxAge15Days = 60 * 60 * 24 * 15 // 15 days

  const authToken = getCookie(event, 'auth_token')
  if (authToken) {
    setCookie(event, 'auth_token', authToken, {
      httpOnly: true,
      maxAge: maxAge15Days,
      path: '/',
      sameSite: 'lax',
      secure: !isDev || origin.startsWith('https')
    })
  }

  const adminToken = getCookie(event, 'admin_token')
  if (adminToken) {
    setCookie(event, 'admin_token', adminToken, {
      httpOnly: true,
      maxAge: maxAge15Days,
      path: '/'
    })
  }
})
