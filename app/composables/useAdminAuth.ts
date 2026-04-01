import { useState } from '#imports'

export const useAdminAuth = () => {
  const isAdmin = useState('admin-auth', () => false)
  const adminName = useState('admin-name', () => '')

  const initAuth = () => {
    if (import.meta.client) {
      const expiresAt = localStorage.getItem('admin_auth_expires_at')
      if (expiresAt && Date.now() > parseInt(expiresAt)) {
        logout()
        return
      }

      isAdmin.value = localStorage.getItem('admin_auth') === 'true'
      adminName.value = localStorage.getItem('admin_name') || 'Admin'
      
      if (isAdmin.value) {
        localStorage.setItem('admin_auth_expires_at', (Date.now() + 15 * 24 * 60 * 60 * 1000).toString())
      }
    }
  }

  const login = async (phone: string) => {
    try {
      const { data, error } = await useFetch('/api/admin/login', {
        method: 'POST',
        body: { phone }
      })

      if (error.value) throw error.value

      if (data.value && (data.value as any).success) {
        const payload = data.value as any
        isAdmin.value = true
        adminName.value = payload.admin?.name || 'Admin'
        if (import.meta.client) {
          localStorage.setItem('admin_auth', 'true')
          localStorage.setItem('admin_name', payload.admin?.name || 'Admin')
          localStorage.setItem('admin_auth_expires_at', (Date.now() + 15 * 24 * 60 * 60 * 1000).toString())
        }
        return { success: true }
      }
    } catch (err: any) {
      console.error('[Admin Login Composable Error]:', err)
      return { success: false, error: err.statusMessage || 'Đăng nhập thất bại. Số điện thoại sai quyền!' }
    }
  }

  const logout = () => {
    isAdmin.value = false
    adminName.value = ''
    if (import.meta.client) {
      localStorage.removeItem('admin_auth')
      localStorage.removeItem('admin_name')
      localStorage.removeItem('admin_auth_expires_at')
    }
  }

  return { isAdmin, adminName, login, logout, initAuth }
}
