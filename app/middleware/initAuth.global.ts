export default defineNuxtRouteMiddleware(async (to, from) => {
  const { initAuth, isUser, isAdmin } = useAdminAuth()
  
  // N?u chu?a có state (d?c bi?t là trên server ho?c load trang l?n d?u),
  // ti?n hành load auth session
  if (!isUser.value && !isAdmin.value) {
    await initAuth()
  }
})
