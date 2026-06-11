export default defineNuxtRouteMiddleware(async (to, from) => {
  // This runs before component render on both server and client
  const { initAuth, isUser, isAdmin } = useAdminAuth()
  
  // Only initialize on server if not already initialized
  if (process.server && !isUser.value && !isAdmin.value) {
    const event = useRequestEvent()
    if (event) {
      // Try to read auth from cookies in the request
      const authCookie = getCookie(event, 'user_auth')
      const adminCookie = getCookie(event, 'admin_auth')
      
      if (authCookie || adminCookie) {
        await initAuth()
      }
    }
  }
})
