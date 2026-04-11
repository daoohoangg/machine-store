import { useState } from '#imports'

export const useAdminAuth = () => {
  const isAdmin = useState('admin-auth', () => false)
  const isUser = useState('user-auth', () => false)
  const adminName = useState('admin-name', () => '')
  const userName = useState('user-name', () => '')
  const userPhone = useState('user-phone', () => '')
  const userTier = useState('user-tier', () => '')

  const initAuth = async () => {
    if (import.meta.client) {
      // 1. Re-verify with server to get actual profile (Syncs with Abaha CRM)
      try {
        const data = await $fetch('/api/auth/me')
        if (data && (data as any).authenticated) {
          const payload = data as any
          if (payload.user?.isAdmin) {
            isAdmin.value = true
            adminName.value = payload.user.name || 'Admin'
            userPhone.value = payload.user.phone || ''
            localStorage.setItem('admin_auth', 'true')
            localStorage.setItem('admin_name', adminName.value)
            localStorage.setItem('user_phone', userPhone.value)
          } else {
            isUser.value = true
            userName.value = payload.user.name || payload.user.phone
            userPhone.value = payload.user.phone || ''
            userTier.value = payload.user.premium_name || ''
            localStorage.setItem('user_auth', 'true')
            localStorage.setItem('user_name', userName.value)
            localStorage.setItem('user_phone', userPhone.value)
          }
        } else {
          // If server says not authenticated, clear local state
          logout()
        }
      } catch (err) {
        console.error('[Auth Init Error]:', err)
      }
    }
  }

  const setUser = (name: string, phone: string, asAdmin: boolean = false, tier: string = '') => {
    if (asAdmin) {
      isAdmin.value = true
      adminName.value = name || 'Admin'
      userPhone.value = phone || ''
      if (import.meta.client) {
        localStorage.setItem('admin_auth', 'true')
        localStorage.setItem('admin_name', adminName.value)
        localStorage.setItem('user_phone', userPhone.value)
        localStorage.setItem('admin_auth_expires_at', (Date.now() + 15 * 24 * 60 * 60 * 1000).toString())
      }
    } else {
      isUser.value = true
      userName.value = name || phone
      userPhone.value = phone || ''
      userTier.value = tier || ''
      if (import.meta.client) {
        localStorage.setItem('user_auth', 'true')
        localStorage.setItem('user_name', userName.value)
        localStorage.setItem('user_phone', userPhone.value)
      }
    }
  }

  const login = async (phone: string) => {
    // Normalize: strip 'Admin ' prefix if present from old UI
    const normalizedPhone = phone.replace(/^Admin\s+/i, '').trim()

    try {
      // Always call server to ensure the admin_token httpOnly cookie is set
      const { data, error } = await useFetch('/api/admin/login', {
        method: 'POST',
        body: { phone: normalizedPhone }
      })

      if (error.value) throw error.value

      if (data.value && (data.value as any).success) {
        const payload = data.value as any
        setUser(payload.admin?.name || 'Admin', payload.admin?.phone, true)
        return { success: true }
      }
    } catch (err: any) {
      console.error('[Admin Login Composable Error]:', err)
      return { success: false, error: err.statusMessage || 'Đăng nhập thất bại. Số điện thoại sai quyền!' }
    }
  }

  const logout = () => {
    isAdmin.value = false
    isUser.value = false
    adminName.value = ''
    userName.value = ''
    userPhone.value = ''
    userTier.value = ''
    if (import.meta.client) {
      localStorage.removeItem('admin_auth')
      localStorage.removeItem('admin_name')
      localStorage.removeItem('admin_auth_expires_at')
      localStorage.removeItem('user_auth')
      localStorage.removeItem('user_name')
      localStorage.removeItem('user_phone')
    }
  }

  return { isAdmin, adminName, isUser, userName, userPhone, userTier, setUser, login, logout, initAuth }
}
