export default defineNuxtRouteMiddleware(async (to, from) => {
  const { initAuth, isUser, isAdmin, userTier } = useAdminAuth()
  
  if (!isUser.value && !isAdmin.value && !userTier.value) {
    await initAuth()
  }
})
