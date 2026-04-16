<template>
  <div class="checkout-layout" :class="{ 'has-search-open': isSearchOpen }">
    <AppHeader :show-promo="false" @search-toggle="handleSearchToggle" />

    <main class="checkout-main">
      <div class="container">
        <slot />
      </div>
    </main>

    <AppFooter />
    <FloatingContact />

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
.checkout-main {
  padding: 10px 0 0;
}

.checkout-layout {
  background: #fff;
  min-height: 100vh;
}

.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 40;
}
</style>
