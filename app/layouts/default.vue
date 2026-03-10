<template>
  <div :class="{ 'has-search-open': isSearchOpen }">
    <AppHeader @search-toggle="handleSearchToggle" />
    <div class="container">
      <div class="page-wrapper">
        <AppSidebar />
        <main class="main-content">
          <slot />
        </main>
      </div>
    </div>
    <AppFooter />
    
    <!-- Transparent Overlay -->
    <div class="search-overlay" v-if="isSearchOpen" @click="closeSearch"></div>
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'

const isSearchOpen = ref(false)

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
</style>
