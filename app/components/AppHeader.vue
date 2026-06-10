<template>
  <header class="app-header">
    <div class="top-banner" v-if="showPromo">
      <NuxtLink to="/">
        <img src="~/assets/img/banner/top-banner.jpg" alt="Khuyến mãi" class="top-banner-img" />
      </NuxtLink>
    </div>
    <div class="main-strip">
        <div class="container header-inner">
        <div class="header-left" :class="{ 'with-main-offset': alignWithMain }">
          <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Hiện danh mục">
            <i class="fa-solid fa-bars"></i>
          </button>
          <NuxtLink to="/" class="logo-link" aria-label="Trang chủ">
            <img class="logo-image" src="/logo.png" alt="Logo" />
          </NuxtLink>
        </div>

        <div class="header-search-container" ref="searchContainerRef">
          <form class="header-search" :class="{ 'is-focused': isSearchOpen }" @submit.prevent="saveSearch">
            <div class="input-wrapper">
              <input
                type="text"
                placeholder="Bạn cần tìm kiếm sản phẩm gì?"
                v-model="searchQuery"
                @focus="handleFocus"
              />
            </div>
            <button type="submit" class="search-btn">
              <span class="desktop-text">Tìm kiếm</span>
              <i class="fa-solid fa-magnifying-glass mobile-icon"></i>
            </button>
          </form>
          <SearchDropdown 
            :is-open="isSearchOpen" 
            :search-query="searchQuery" 
            :recent-searches="recentSearches"
            @close="handleCloseSearch" 
            @select-recent="handleSelectRecent"
          />
        </div>

        <div class="header-actions">
          <a class="action-item hotline-item hide-on-mobile-action" :href="'tel:' + settings.hotline.replace(/[^0-9]/g, '')">
            <span class="action-icon"><i class="fa-solid fa-phone-volume"></i></span>
            <span class="action-label hl-label">
              <span class="hl-text">Hotline</span>
              <span class="hl-number">{{ settings.hotline }}</span>
            </span>
          </a>

          <NuxtLink class="action-item" to="/chinh-sach">
            <span class="action-icon"><i class="fa-solid fa-shield-halved"></i></span>
            <span class="action-label">Chính sách</span>
          </NuxtLink>

          <NuxtLink class="action-item" to="/voucher">
            <span class="action-icon"><i class="fa-solid fa-ticket"></i></span>
            <span class="action-label">Voucher</span>
          </NuxtLink>

          <button class="action-item" @click="isCartOpen = true">
            <span class="action-icon cart-icon-wrapper">
              <i class="fa-solid fa-cart-shopping"></i>
              <span v-if="totalItems > 0" class="cart-badge">{{ totalItems }}</span>
            </span>
            <span class="action-label">Giỏ hàng</span>
          </button>

          <!-- Login or User dropdown -->
          <div v-if="isAdmin || isUser" class="action-item user-dropdown-wrapper">
            <template v-if="isAdmin">
              <NuxtLink to="/admin" class="user-trigger">
                <span class="action-icon"><i class="fa-solid fa-user-shield"></i></span>
                <span class="action-label">{{ displayAccountName }}</span>
              </NuxtLink>
              <div class="user-dropdown">
                <NuxtLink to="/admin" class="dropdown-item"><i class="fa-solid fa-gear"></i> Trang quản trị</NuxtLink>
                <NuxtLink to="/auth/orders" class="dropdown-item"><i class="fa-solid fa-box"></i> Quản lý đơn hàng</NuxtLink>
                <NuxtLink to="/auth/vouchers" class="dropdown-item"><i class="fa-solid fa-ticket"></i> Voucher của tôi</NuxtLink>
                <button class="dropdown-item text-danger" @click="handleLogout"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</button>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/auth/profile" class="user-trigger">
                <span class="action-icon"><i class="fa-solid fa-user"></i></span>
                <span class="action-label">{{ displayAccountName }}</span>
              </NuxtLink>
              <div class="user-dropdown">
                <NuxtLink to="/auth/profile" class="dropdown-item"><i class="fa-solid fa-user-pen"></i> Thông tin tài khoản</NuxtLink>
                <NuxtLink to="/auth/orders" class="dropdown-item"><i class="fa-solid fa-box"></i> Đơn hàng của tôi</NuxtLink>
                <NuxtLink to="/auth/vouchers" class="dropdown-item"><i class="fa-solid fa-ticket"></i> Voucher của tôi</NuxtLink>
                <button class="dropdown-item text-danger" @click="handleLogout"><i class="fa-solid fa-right-from-bracket"></i> Đăng xuất</button>
              </div>
            </template>
          </div>

          <NuxtLink v-else class="action-item login-item" to="/auth/login">
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
import { ref, watch, inject, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useAdminAuth } from '~/composables/useAdminAuth'

const { settings } = useSiteSettings()
const { isAdmin, isUser, adminName, userName, logout, initAuth } = useAdminAuth()

const displayAccountName = computed(() => {
  const name = isAdmin.value ? adminName.value : userName.value
  if (!name) return isAdmin.value ? 'Admin' : 'Tài khoản'
  return name
})

const handleLogout = async () => {
  await logout()
  if (router.currentRoute.value.path === '/admin') {
    router.push('/')
  }
}

import AppCartModal from '~/components/AppCartModal.vue'
import { useCart } from '~/composables/useCart'
import { useMobileMenu } from '~/composables/useMobileMenu'

defineProps({
  alignWithMain: {
    type: Boolean,
    default: false
  },
  showPromo: {
    type: Boolean,
    default: true
  }
})

const { totalItems } = useCart()
const { toggleMobileMenu } = useMobileMenu()
const router = useRouter()

const emit = defineEmits(['search-toggle'])

const isCartOpen = ref(false)

const searchState = inject('searchState', null)
const isSearchOpen = searchState ? searchState.isSearchOpen : ref(false)
const searchContainerRef = ref(null)
const searchQuery = ref('')
const recentSearches = ref([])

const loadRecentSearches = () => {
  try {
    const saved = localStorage.getItem('recent_searches')
    if (saved) {
      recentSearches.value = JSON.parse(saved)
    }
  } catch (e) {}
}

const saveSearch = () => {
  const query = searchQuery.value.trim()
  if (!query) return
  
  // Remove if exists to push to front
  const existingIdx = recentSearches.value.indexOf(query)
  if (existingIdx !== -1) {
    recentSearches.value.splice(existingIdx, 1)
  }
  
  recentSearches.value.unshift(query)
  if (recentSearches.value.length > 3) {
    recentSearches.value = recentSearches.value.slice(0, 3)
  }
  
  try {
    localStorage.setItem('recent_searches', JSON.stringify(recentSearches.value))
  } catch(e) {}
  
  // Navigate to catalog page with search parameter
  router.push({
    path: '/homepage',
    query: { searchName: query }
  })
  
  // Close the search dropdown after submitting
  isSearchOpen.value = false
}

const handleSelectRecent = (query) => {
  searchQuery.value = query
  saveSearch()
}

watch(isSearchOpen, (newVal) => {
  emit('search-toggle', newVal)
})

const handleFocus = () => {
  isSearchOpen.value = true
}

const handleClickOutside = (event) => {
  if (searchContainerRef.value && !searchContainerRef.value.contains(event.target)) {
    isSearchOpen.value = false
    searchQuery.value = ''
  }
}

const handleCloseSearch = () => {
  isSearchOpen.value = false
  searchQuery.value = ''
}

onMounted(() => {
  initAuth()
  document.addEventListener('click', handleClickOutside)
  loadRecentSearches()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.top-banner {
  display: block;
  width: 100%;
  background: rgb(49, 120, 208);
}
.top-banner-img {
  width: 100%;
  display: block;
  height: 68px;
  object-fit: contain;
}
.app-header {
  display: contents;
}

.main-strip {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  z-index: 1000;
  background: linear-gradient(90deg, #0052cc, #007aff, #0052cc);
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

.mobile-menu-btn {
  display: none;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 4px 8px;
  margin-right: 4px;
}

.logo-link {
  display: inline-flex;
  align-items: center;
}

.logo-image {
  width: 52px;
  height: 52px;
  object-fit: contain;
  border-radius: 8px;
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

.mobile-icon {
  display: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: auto;
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
  text-decoration: none;
}

.hl-label {
  position: relative;
  display: inline-flex;
  align-items: center;
}
.hl-text {
  transition: opacity 0.3s;
}
.hl-number {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(5px);
  opacity: 0;
  visibility: hidden;
  color: #fff;
  background: #e31b1b;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 800;
  white-space: nowrap;
  transition: all 0.3s;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 10;
}
.hl-number::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: transparent transparent #e31b1b transparent;
}
 .hotline-item:hover .hl-number {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(12px);
}

.action-icon {
  font-size: 22px;
  line-height: 1;
  width: 28px;
  text-align: center;
  display: inline-flex;
  justify-content: center;
}

.user-dropdown-wrapper {
  position: relative;
  display: inline-flex;
  height: 100%;
  align-items: center;
}

.user-trigger {
  color: #fff;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 100%;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  min-width: 180px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-radius: 4px;
  padding: 8px 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.2s;
  z-index: 100;
  border: 1px solid #eee;
}

.user-dropdown-wrapper:hover .user-dropdown {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: block;
  padding: 10px 16px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item i {
  width: 20px;
  text-align: center;
  margin-right: 8px;
  color: #888;
}

.dropdown-item:hover {
  background: #f5f5f5;
  color: #0066cc;
}

.dropdown-item.text-danger {
  color: #e31b1b;
}

.dropdown-item.text-danger:hover {
  background: #fff0f0;
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

  .mobile-menu-btn {
    display: block;
  }
}

@media (max-width: 768px) {
  .app-header {
  }

  .top-banner-img {
    height: auto;
  }

  /* To prevent content from jumping under fixed header */
  :root {
    --header-height: 96px;
  }

  .header-inner {
    flex-wrap: nowrap;
    justify-content: space-between;
    gap: 4px; /* Reduced gap to fit all items */
    padding: 6px 4px; /* Add small padding so icons don't touch edge */
    min-height: 48px; /* Override desktop min-height */
  }

  
  .login-item {
    display: inline-flex;
  }

  .header-left {
    order: 1;
    flex: 0 0 auto;
  }

  .header-search-container {
    order: 2;
    flex: 1 1 auto; /* Grow to fill space but allow shrinking */
    min-width: 0;
    max-width: 100%; 
    margin: 0 10px; /* Add margin to shrink the search container slightly */
  }

  .header-actions {
    order: 3;
    flex: 0 0 auto; /* Never shrink or grow, keep exact width */
    gap: 6px; /* Reduced gap */
  }

  .header-search {
    height: 30px; /* Shorter search box */
    border-radius: 15px; /* Pill shape makes it look more compact */
  }

  .search-btn {
    width: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }

  .desktop-text {
    display: none;
  }

  .mobile-icon {
    display: block;
    font-size: 14px;
    color: #666;
  }

  .logo-image {
    width: 32px;
    height: 32px;
  }

  .action-item {
    padding: 0;
  }

  .action-label {
    display: none;
  }

  .hide-on-mobile-action {
    display: none !important;
  }

  .action-icon {
  font-size: 20px;
  width: 24px;
}

  .mobile-menu-btn {
    font-size: 20px;
    padding: 2px 4px;
    margin-right: 2px;
  }

  .input-wrapper input {
    font-size: 12px;
    padding: 0 8px;
  }
}
</style>


