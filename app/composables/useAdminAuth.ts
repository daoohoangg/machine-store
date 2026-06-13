import { useState, useRequestHeaders } from '#imports'

export const useAdminAuth = () => {
  const isAdmin = useState('admin-auth', () => false)
  const isUser = useState('user-auth', () => false)
  const adminName = useState('admin-name', () => '')
  const userName = useState('user-name', () => '')
  const userPhone = useState('user-phone', () => '')
  const userTier = useState('user-tier', () => '')

  // Restore auth state from localStorage on client (after hydration) if server didn't set it
  if (process.client) {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('user_auth') === 'true' && !isUser.value) {
        isUser.value = true
        userName.value = localStorage.getItem('user_name') || ''
        userPhone.value = localStorage.getItem('user_phone') || ''
        userTier.value = localStorage.getItem('user_tier') || ''
      }
      if (localStorage.getItem('admin_auth') === 'true' && !isAdmin.value) {
        isAdmin.value = true
        adminName.value = localStorage.getItem('admin_name') || 'Admin'
        userPhone.value = localStorage.getItem('user_phone') || ''
      }
    }
  }

  const initAuth = async () => {
    try {
      // Forward headers from client if running on server to preserve cookies
      let headers = {}
      if (process.server) {
        const event = useRequestEvent()
        if (event) {
          headers = { cookie: event.node.req.headers.cookie || '' }
        }
      }

      const data = await $fetch('/api/auth/me', { headers })
      if (data && (data as any).authenticated) {
        const payload = data as any
        if (payload.user?.isAdmin) {
          isAdmin.value = true
          adminName.value = payload.user.name || 'Admin'
          userPhone.value = payload.user.phone || ''
          if (import.meta.client) {
            localStorage.setItem('admin_auth', 'true')
            localStorage.setItem('admin_name', adminName.value)
            localStorage.setItem('user_phone', userPhone.value)
          }
        } else {
          isUser.value = true
          userName.value = payload.user.name || payload.user.phone
          userPhone.value = payload.user.phone || ''
          userTier.value = payload.user.premium_name || ''
          if (import.meta.client) {
            localStorage.setItem('user_auth', 'true')
            localStorage.setItem('user_name', userName.value)
            localStorage.setItem('user_phone', userPhone.value)
            localStorage.setItem('user_tier', userTier.value)
          }
        }
      } else {
        if (import.meta.client) logout()
      }
    } catch (err) {
      console.error('[Auth Init Error]:', err)
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
        localStorage.setItem('user_tier', tier || '')
      }
    }
  }

  const login = async (phone: string) => {
    const normalizedPhone = phone.replace(/^Admin\s+/i, '').trim()

    try {
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
      return { success: false, error: err.statusMessage || 'Đăng nhập thất bại' }
    }
  }

  const logout = async () => {
    isAdmin.value = false
    isUser.value = false
    adminName.value = ''
    userName.value = ''
    userPhone.value = ''
    userTier.value = ''
    if (import.meta.client) {
      try {
        await $fetch('/api/admin/logout', { method: 'POST' })
      } catch (err) {
        console.warn('[Logout] Failed to clear server cookies:', err)
      }
      
      localStorage.removeItem('admin_auth')
      localStorage.removeItem('admin_name')
      localStorage.removeItem('admin_auth_expires_at')
      localStorage.removeItem('user_auth')
      localStorage.removeItem('user_name')
      localStorage.removeItem('user_phone')
      localStorage.removeItem('user_tier')
      localStorage.removeItem('abaha_order_id')
      localStorage.removeItem('tuanminh_cart')
      localStorage.removeItem('tuanminh_viewed_products_v2')
      localStorage.removeItem('recent_searches')
      localStorage.removeItem('site_settings')
    }
  }

  const isAgencyAccount = computed(() => {
    if (!userTier.value) return false
    const tier = userTier.value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[�d]/g, 'd')
      .toLowerCase()
    return (
      tier.includes('dai ly') ||
      tier.includes('dai li') ||
      tier.includes('nha phan phoi') ||
      tier.includes('npp')
    )
  })

  return { isAdmin, adminName, isUser, userName, userPhone, userTier, isAgencyAccount, setUser, login, logout, initAuth }
}
