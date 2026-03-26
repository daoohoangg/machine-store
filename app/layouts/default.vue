<template>
  <div :class="{ 'has-search-open': isSearchOpen }">
    <AppHeader :align-with-main="showSidebar" @search-toggle="handleSearchToggle" />
    <template v-if="isHomePage">
      <slot />
    </template>
    <template v-else>
      <div class="container">
        <div class="page-wrapper">
          <AppSidebar :class="{ 'desktop-hidden': !showSidebar }" />
          <main class="main-content">
            <slot />
          </main>
        </div>
      </div>
    </template>
    <AppFooter />
    
    <div class="search-overlay" v-if="isSearchOpen" @click="closeSearch"></div>
    <div class="mobile-menu-overlay" v-if="isMobileMenuOpen" @click="closeMobileMenu"></div>

    <!-- Floating Phone Icon -->
    <div class="floating-phone-container" v-if="!isAdminPage">
      <div v-show="isPhoneMenuOpen" class="phone-menu shadow-lg">
        <a href="tel:0995556969" class="phone-menu-item">
          <i class="fa-solid fa-cart-shopping"></i> Mua hàng: <strong>0995.556.969</strong>
        </a>
        <a href="tel:19005068" class="phone-menu-item">
          <i class="fa-solid fa-headset"></i> Kỹ thuật: <strong>1900 5068</strong>
        </a>
      </div>
      <button @click="togglePhoneMenu" class="floating-phone" aria-label="Gọi ngay">
        <span class="phone-text">HOTLINE</span>
        <div class="phone-icon-wrapper">
          <div class="phone-ring"></div>
          <div class="phone-circle"></div>
          <i class="fa-solid fa-phone phone-icon"></i>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMobileMenu } from '~/composables/useMobileMenu'

const route = useRoute()
const { isMobileMenuOpen, closeMobileMenu } = useMobileMenu()
const isSearchOpen = ref(false)
const isPhoneMenuOpen = ref(false)
const isHomePage = computed(() => route.path === '/')
const isAdminPage = computed(() => route.path.startsWith('/admin'))

const togglePhoneMenu = () => {
  isPhoneMenuOpen.value = !isPhoneMenuOpen.value
}

const showSidebar = computed(() => {
  // Hide sidebar on product detail page and category page
  if (route.path.startsWith('/san-pham/')) return false
  if (route.path.startsWith('/homepage')) return false
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

/* Floating Phone Icon Styling */
.floating-phone-container {
  position: fixed;
  bottom: 30px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.floating-phone {
  height: 48px;
  background: #cc2121;
  border-radius: 24px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0 4px 0 16px;
  box-shadow: 0 4px 12px rgba(204, 33, 33, 0.4);
}

.phone-menu {
  background: white;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: slide-up 0.2s ease-out;
  border: 1px solid #eee;
  min-width: 200px;
}

.phone-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #333;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;
  font-size: 15px;
}

.phone-menu-item:hover {
  background: #f5f5f5;
  color: #cc2121;
}

.phone-menu-item i {
  color: #cc2121;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.phone-icon-wrapper {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6px;
}

.phone-circle {
  position: absolute;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: phone-scale 1.5s infinite ease-in-out;
  z-index: 1;
}

.phone-ring {
  position: absolute;
  width: 56px;
  height: 56px;
  border: 2px solid #cc2121;
  border-radius: 50%;
  animation: phone-ring-pulse 1.5s infinite ease-out;
  opacity: 0;
  z-index: 0;
}

.phone-icon {
  position: relative;
  font-size: 18px;
  color: #fff;
  z-index: 2;
  animation: phone-vibrate 1.5s infinite ease-in-out;
}

.phone-text {
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  white-space: nowrap;
}

@keyframes phone-scale {
  0% { transform: scale(0.9); }
  50% { transform: scale(1.1); box-shadow: 0 0 15px rgba(204, 33, 33, 0.6); }
  100% { transform: scale(0.9); }
}

@keyframes phone-ring-pulse {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes phone-vibrate {
  0%, 10%, 20%, 30%, 40%, 100% { transform: rotate(0deg); }
  5%, 15%, 25%, 35% { transform: rotate(15deg); }
  12%, 22%, 32% { transform: rotate(-15deg); }
}

@media (max-width: 768px) {
  .floating-phone-container {
    bottom: 20px;
    right: 15px; 
    transform: scale(0.85); 
    transform-origin: bottom right;
  }
}
</style>
