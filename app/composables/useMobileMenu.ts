import { useState } from '#imports'

export const useMobileMenu = () => {
  const isMobileMenuOpen = useState('mobile-menu-open', () => false)

  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  }

  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
  }

  const openMobileMenu = () => {
    isMobileMenuOpen.value = true
  }

  return {
    isMobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    openMobileMenu
  }
}
