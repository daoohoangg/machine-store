import { getCookie, createError, type H3Event } from 'h3'

export const validateAdminSession = (event: H3Event) => {
  const adminToken = getCookie(event, 'admin_token')
  if (!adminToken) return null

  try {
    const decoded = Buffer.from(adminToken, 'base64').toString('utf-8')
    if (decoded.startsWith('admin_')) {
      const parts = decoded.split('_')
      const phone = parts[1]
      
      // The phone number "0123" is the Master Key
      if (phone === '0123') {
        return { phone, role: 'admin', isMaster: true }
      }
      
      return { phone, role: 'admin' }
    }
  } catch (e) {
    console.error('[AdminAuth] Failed to decode token:', e)
  }
  return null
}

export const requireAdmin = async (event: H3Event) => {
  const session = validateAdminSession(event)
  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized: Admin access required'
    })
  }
  return session
}
