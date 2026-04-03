import { useState } from '#imports'

export const useAdminAuth = () => {
  const isAdmin = useState('admin-auth', () => false)
  const isUser = useState('user-auth', () => false)
  const adminName = useState('admin-name', () => '')
  const userName = useState('user-name', () => '')

  const initAuth = async () => {
    if (import.meta.client) {
      // 1. Initial Local storage check
      isAdmin.value = localStorage.getItem('admin_auth') === 'true'
      adminName.value = localStorage.getItem('admin_name') || 'Admin'
      isUser.value = localStorage.getItem('user_auth') === 'true'
      userName.value = localStorage.getItem('user_name') || ''

      // 2. Verify on server-side to get actual state/profile
      try {
        const data = await $fetch('/api/auth/me')
        if (data && (data as any).authenticated) {
          const payload = data as any
          if (payload.user?.isAdmin) {
            isAdmin.value = true
            adminName.value = payload.user.name || 'Admin'
            localStorage.setItem('admin_auth', 'true')
            localStorage.setItem('admin_name', adminName.value)
          } else {
            isUser.value = true
            userName.value = payload.user.name || payload.user.phone
            localStorage.setItem('user_auth', 'true')
            localStorage.setItem('user_name', userName.value)
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

  const setUser = (name: string, phone: string, asAdmin: boolean = false) => {
    if (asAdmin) {
      isAdmin.value = true
      adminName.value = name || 'Admin'
      if (import.meta.client) {
        localStorage.setItem('admin_auth', 'true')
        localStorage.setItem('admin_name', adminName.value)
        localStorage.setItem('admin_auth_expires_at', (Date.now() + 15 * 24 * 60 * 60 * 1000).toString())
      }
    } else {
      isUser.value = true
      userName.value = name || phone
      if (import.meta.client) {
        localStorage.setItem('user_auth', 'true')
        localStorage.setItem('user_name', userName.value)
      }
    }
  }

  const login = async (phone: string) => {
    // Legacy backdoor for admin login UI
    if (phone === '0123' || phone === 'Admin 0123') {
      setUser('Admin', '0123', true)
      return { success: true }
    }

    try {
      // Still allow checking for admin specifically via this endpoint if needed
      const { data, error } = await useFetch('/api/admin/login', {
        method: 'POST',
        body: { phone }
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
    if (import.meta.client) {
      localStorage.removeItem('admin_auth')
      localStorage.removeItem('admin_name')
      localStorage.removeItem('admin_auth_expires_at')
      localStorage.removeItem('user_auth')
      localStorage.removeItem('user_name')
    }
  }

  return { isAdmin, adminName, isUser, userName, setUser, login, logout, initAuth }
}
