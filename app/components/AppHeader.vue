<template>
  <header class="app-header">
    <div class="top-strip" :class="{ 'is-hidden': isScrolled }">
      <div class="container top-strip-inner">
        <p class="top-copy">Pha nhanh - Uống ngon | Máy pha cà phê giá ưu đãi</p>
        <p class="top-price">Giá từ <strong>890.000đ</strong></p>
      </div>
    </div>

    <div class="main-strip">
        <div class="container header-inner">
        <div class="header-left" :class="{ 'with-main-offset': alignWithMain }">
          <NuxtLink to="/" class="logo-link" aria-label="Trang chủ">
            <img class="logo-image" src="/favicon.jpg" alt="Logo" />
          </NuxtLink>
        </div>

        <div class="header-search-container" ref="searchContainerRef">
          <div class="header-search" :class="{ 'is-focused': isSearchOpen }">
            <div class="input-wrapper">
              <input
                type="text"
                placeholder="Bạn cần tìm kiếm sản phẩm gì?"
                @focus="handleFocus"
              />
            </div>
            <button class="search-btn">Tìm kiếm</button>
          </div>
          <SearchDropdown :is-open="isSearchOpen" @close="isSearchOpen = false" />
        </div>

        <div class="header-actions">
          <button class="action-item" @click="isCartOpen = true">
            <span class="action-icon cart-icon-wrapper">
              <i class="fa-solid fa-cart-shopping"></i>
              <span v-if="totalItems > 0" class="cart-badge">{{ totalItems }}</span>
            </span>
            <span class="action-label">Giỏ hàng</span>
          </button>
          <button class="action-item">
            <span class="action-icon"><i class="fa-solid fa-phone"></i></span>
            <span class="action-label">Đường dây nóng</span>
          </button>
          <NuxtLink class="action-item" to="/auth/login">
            <span class="action-icon"><i class="fa-solid fa-user"></i></span>
            <span class="action-label">Đăng nhập</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </header>

  <AppCartModal v-if="isCartOpen" @close="isCartOpen = false" />
</template>

<script setup>
import { ref, watch, inject, onMounted, onBeforeUnmount } from 'vue'
import AppCartModal from '~/components/AppCartModal.vue'
import { useCart } from '~/composables/useCart'

defineProps({
  alignWithMain: {
    type: Boolean,
    default: false
  }
})

const { totalItems } = useCart()

const emit = defineEmits(['search-toggle'])

const isCartOpen = ref(false)
const isScrolled = ref(false)

const searchState = inject('searchState', null)
const isSearchOpen = searchState ? searchState.isSearchOpen : ref(false)
const searchContainerRef = ref(null)

watch(isSearchOpen, (newVal) => {
  emit('search-toggle', newVal)
})

const handleFocus = () => {
  isSearchOpen.value = true
}

const handleClickOutside = (event) => {
  if (searchContainerRef.value && !searchContainerRef.value.contains(event.target)) {
    isSearchOpen.value = false
  }
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
}

.top-strip {
  background: linear-gradient(90deg, #5b1d08, #a84d0f, #5b1d08);
  color: #fff;
  max-height: 50px;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
  opacity: 1;
}

.top-strip.is-hidden {
  max-height: 0;
  opacity: 0;
  pointer-events: none;
}

.top-strip-inner {
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 700;
}

.top-copy {
  font-size: 18px;
  line-height: 1;
}

.top-price {
  font-size: 16px;
  background: #fdf5eb;
  color: #111;
  border-radius: 999px;
  padding: 6px 14px;
}

.main-strip {
  background: #e31b1b;
  color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
}

.header-inner {
  display: flex;
  align-items: center;
  min-height: 68px;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-left.with-main-offset {
  width: var(--sidebar-w, 250px);
  min-width: var(--sidebar-w, 250px);
}

.logo-link {
  display: inline-flex;
  align-items: center;
}

.logo-image {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.header-search-container {
  flex: 0 1 720px;
  width: 100%;
  max-width: 720px;
  min-width: 240px;
  position: relative;
}

.header-search {
  display: flex;
  height: 40px;
  background: #fff;
  border-radius: 3px;
  overflow: hidden;
}

.header-search.is-focused {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.input-wrapper {
  flex: 1;
  display: flex;
  position: relative;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  padding: 0 12px;
  font-size: 15px;
}


.search-btn {
  border: none;
  background: #ececec;
  color: #111;
  font-weight: 700;
  width: 112px;
  font-size: 14px;
  cursor: pointer;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

.action-item {
  color: #fff;
  border: none;
  background: transparent;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.action-icon {
  font-size: 22px;
  line-height: 1;
}

.cart-icon-wrapper {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -7px;
  right: -9px;
  min-width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #ffe43b;
  color: #b30500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  padding: 0 4px;
}

@media (max-width: 1200px) {
  .top-strip {
    display: none;
  }

  .header-inner {
    flex-wrap: nowrap;
    padding: 10px 0;
    gap: 12px;
  }

  .header-left.with-main-offset {
    width: auto;
    min-width: 0;
  }

  .header-search-container {
    order: 2;
    flex: 1;
    min-width: 150px;
  }

  .header-actions {
    margin-left: auto;
  }

  .action-item {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .header-inner {
    flex-wrap: nowrap;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 0;
  }

  .header-search-container {
    order: 2;
    flex: 1;
    min-width: 0;
    max-width: none;
  }

  .header-search {
    height: 34px;
  }

  .search-btn {
    display: none; /* Hide 'Tìm kiếm' text button on mobile */
  }

  /* Show a search icon instead or just let them tap enter */
  .input-wrapper::after {
    content: "🔍";
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    pointer-events: none;
  }

  .logo-image {
    width: 36px;
    height: 36px;
  }

  .action-item {
    padding: 0;
  }

  .action-label {
    display: none;
  }

  .action-icon {
    font-size: 20px;
  }

  .input-wrapper input {
    font-size: 13px;
    padding-right: 30px;
  }
}
</style>
