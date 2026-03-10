<template>
  <header class="app-header">
    <div class="container header-inner">
      <div class="header-left">
        <button class="menu-btn">☰</button>
        <div class="logo">META</div>
      </div>
      
      <!-- Search Area wrapper -->
      <div class="header-search-container" ref="searchContainerRef">
        <div class="header-search" :class="{ 'is-focused': isSearchOpen }">
          <!-- Input Wrapper anchors the dropdown specifically to the input width -->
          <div class="input-wrapper">
            <input 
              type="text" 
              placeholder="Bạn cần tìm kiếm sản phẩm gì?" 
              @focus="handleFocus"
            />
            <button class="voice-btn">🎤</button>
            
            <!-- Dropdown overlay attached to just the input -->
            <SearchDropdown :is-open="isSearchOpen" />
          </div>
          <button class="search-btn">Tìm kiếm</button>
        </div>
      </div>

      <div class="header-actions">
        <div class="action-item" @click="isCartOpen = true">
          <div class="cart-icon-wrapper">
            🛒
            <span v-if="totalItems > 0" class="cart-badge">{{ totalItems }}</span>
          </div>
          <br><span>Giỏ hàng</span>
        </div>
        <div class="action-item">📞 <br><span>Hotline</span></div>
        <NuxtLink class="action-item" to="/auth/login">👤 <br><span>Đăng nhập</span></NuxtLink>
      </div>
    </div>
  </header>
  <div v-if="showPromo" class="promo-bar">
    <div class="container">
      <div class="promo-inner">
        <span>Trang chủ &gt; Thương hiệu Oshima</span>
        <span class="promo-text">KHUYẾN MẠI: Mua đồ gia dụng Hafele, Sharp tặng máy đánh</span>
      </div>
    </div>
  </div>

  <!-- Cart Modal Overlay -->
  <AppCartModal v-if="isCartOpen" @close="isCartOpen = false" />
</template>

<script setup>
import { ref, watch, inject, onMounted, onBeforeUnmount } from 'vue'
import AppCartModal from '~/components/AppCartModal.vue'
import { useCart } from '~/composables/useCart'

defineProps({
  showPromo: {
    type: Boolean,
    default: true
  }
})

const { totalItems } = useCart()

const emit = defineEmits(['search-toggle'])

const isCartOpen = ref(false)

const searchState = inject('searchState', null)
const isSearchOpen = searchState ? searchState.isSearchOpen : ref(false)
const searchContainerRef = ref(null)

// Watch local or injected state and emit to parent
watch(isSearchOpen, (newVal) => {
  emit('search-toggle', newVal)
})

const handleFocus = () => {
  isSearchOpen.value = true
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (searchContainerRef.value && !searchContainerRef.value.contains(event.target)) {
    isSearchOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-header {
  background-color: var(--primary-red);
  color: white;
  padding: 10px 0;
  position: sticky;
  top: 0;
  z-index: 1000; /* Extremely high to ensure it stays above all content when scrolling */
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}
.menu-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}
.logo {
  font-size: 32px;
  font-weight: 900;
  letter-spacing: 1px;
}
.header-search-container {
  flex: 1;
  margin: 0 100px; /* Increased from 50px to significantly shrink the width */
  position: relative;
}
.header-search {
  display: flex;
  background: white;
  border-radius: 4px;
  height: 38px;
}
.header-search.is-focused {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
.input-wrapper {
  flex: 1;
  display: flex;
  position: relative; /* Anchor for the dropdown */
}
.input-wrapper input {
  flex: 1;
  border: none;
  padding: 10px 15px;
  outline: none;
}
.voice-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 16px;
  padding: 0 10px;
  cursor: pointer;
}
.search-btn {
  background: #e0e0e0; /* Gray bg matched from screenshot */
  border: none;
  padding: 0 20px;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  font-weight: 500;
}
.search-btn:hover {
  background: #d5d5d5;
}
.header-actions {
  display: flex;
  gap: 20px;
}
.action-item {
  text-align: center;
  font-size: 12px;
  cursor: pointer;
}
.cart-icon-wrapper {
  position: relative;
  display: inline-block;
  font-size: 20px;
}
.cart-badge {
  position: absolute;
  top: -8px;
  right: -10px;
  background: #fcd500;
  color: #d4161c;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 5px;
  border-radius: 10px;
  line-height: 1;
}
.action-item span { margin-top: 4px; display: inline-block; }

.promo-bar {
  padding: 0;
  font-size: 13px;
  color: #666;
}
.promo-inner {
  background: white;
  border-bottom: 1px solid var(--border-color);
  padding: 8px 15px;
  border-radius: 0;
  display: flex;
  justify-content: space-between;
}
.promo-text {
  font-weight: bold;
  color: #333;
}
</style>
