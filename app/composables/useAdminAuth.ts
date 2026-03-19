import { useState } from '#imports'

export const useAdminAuth = () => {
  const isAdmin = useState('admin-auth', () => false)
  const adminName = useState('admin-name', () => '')

  const initAuth = () => {
    if (import.meta.client) {
      isAdmin.value = localStorage.getItem('admin_auth') === 'true'
      adminName.value = localStorage.getItem('admin_name') || 'Admin'
    }
  }

  const login = (name: string = 'Admin') => {
    isAdmin.value = true
    adminName.value = name
    if (import.meta.client) {
      localStorage.setItem('admin_auth', 'true')
      localStorage.setItem('admin_name', name)
    }
  }

  const logout = () => {
    isAdmin.value = false
    adminName.value = ''
    if (import.meta.client) {
      localStorage.removeItem('admin_auth')
      localStorage.removeItem('admin_name')
    }
  }

  return { isAdmin, adminName, login, logout, initAuth }
}
