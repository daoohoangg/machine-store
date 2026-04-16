<template>
  <div :class="{ 'has-search-open': isSearchOpen }">
    <AppHeader :align-with-main="showSidebar" @search-toggle="handleSearchToggle" />
    <template v-if="isHomePage">
      <slot />
    </template>
    <template v-else>
      <div class="container">
        <div class="page-wrapper">
          <AppSidebar v-if="showSidebar" />
          <main class="main-content">
            <slot />
          </main>
        </div>
      </div>
    </template>
    <AppFooter />
    <FloatingContact />
    
    <div class="search-overlay" v-if="isSearchOpen" @click="closeSearch"></div>
    <div class="mobile-menu-overlay" v-if="isMobileMenuOpen" @click="closeMobileMenu"></div>
  </div>
</template>

<script setup>
import { ref, provide, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMobileMenu } from '~/composables/useMobileMenu'
import { useSiteSettings } from '~/composables/useSiteSettings'

const { settings } = useSiteSettings()

const route = useRoute()
const { isMobileMenuOpen, closeMobileMenu } = useMobileMenu()
const isSearchOpen = ref(false)
const isHomePage = computed(() => route.path === '/')
const isAdminPage = computed(() => route.path.startsWith('/admin'))


const showSidebar = computed(() => {
  // Hide sidebar on product detail page, category page, admin and auth pages
  if (route.path.startsWith('/san-pham/')) return false
  if (route.path.startsWith('/homepage')) return false
  if (route.path.startsWith('/admin')) return false
  if (route.path.startsWith('/auth/')) return false
  return true
})

const handleSearchToggle = (isOpen) => {
  isSearchOpen.value = isOpen
}

const closeSearch = () => {
  isSearchOpen.value = false
}

// Provide state to AppHeader so it can be controlled
provide('searchState', {
  isSearchOpen,
  closeSearch
})
</script>

<style scoped>
/* Dark blurred overlay */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 40; /* Below header, above content */
}

/* Mobile Menu Dark Overlay */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1050; /* Needs to be above header (1000) so it darkens header too, or below. We'll set below sidebar (2000) */
}

/* Hide sidebar on desktop if not shown, but allow it on mobile */
@media (min-width: 1025px) {
  .desktop-hidden {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .container {
    padding-top: 0;
  }
}


</style>
