<template>
  <div class="auth-layout">
    <AppHeader @search-toggle="handleSearchToggle" />

    <main class="auth-main">
      <slot />
    </main>

    <AppFooter />

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

provide('searchState', {
  isSearchOpen,
  closeSearch
})
</script>

<style scoped>
.auth-layout {
  background: #fff;
  min-height: 100vh;
}

.auth-main {
  background: #2e93ea;
}

.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 40;
}
</style>
