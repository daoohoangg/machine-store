<template>
  <aside class="app-sidebar" :class="{ 'is-mobile-open': isMobileMenuOpen }">
    <div class="sidebar-title">
      <div class="title-left">
        <span class="menu-icon"><i class="fa-solid fa-bars"></i></span>
        <h3>Danh mục sản phẩm</h3>
      </div>
      <button class="close-btn" @click="closeMobileMenu" aria-label="Đóng">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      Đang tải danh mục...
    </div>

    <ul v-else class="category-list">
      <li 
        v-for="item in displayedCategories" 
        :key="item.id" 
        class="category-li"
      >
        <NuxtLink :to="`/homepage?categoryId=${item.id}&categoryName=${encodeURIComponent(item.name)}`" class="category-item" @click="closeMobileMenu">
          <div class="item-icon">
            <img v-if="item.image && !isImageFailed(item.image)" :src="item.image" :alt="item.name" @error="markImageAsFailed(item.image)" class="item-icon-img" />
            <i v-else :class="item.icon"></i>
          </div>
          <span class="item-name">{{ item.name }}</span>
          <span v-if="item.children && item.children.length > 0" class="arrow-icon">
            <i class="fa-solid fa-chevron-right"></i>
          </span>
        </NuxtLink>

        <!-- Sub-menu -->
        <div v-if="item.children && item.children.length > 0" class="sub-menu">
          <div class="sub-menu-content">
            <div class="sub-menu-header">{{ item.name }}</div>
            <ul class="sub-category-list">
              <li v-for="child in item.children" :key="child.id">
                <NuxtLink :to="`/homepage?categoryId=${child.id}&categoryName=${encodeURIComponent(child.name)}`" class="sub-category-item" @click="closeMobileMenu">
                  {{ child.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ul>

    <ClientOnly>
      <NuxtLink
        v-if="hasMoreCategories"
        class="view-more"
        to="/so-do-website"
        @click="closeMobileMenu"
      >
        Xem thêm chuyên mục
      </NuxtLink>
    </ClientOnly>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCategories } from '~/composables/useCategories'
import { useCategoryVisibility } from '~/composables/useCategoryVisibility'
import { useImageGuard } from '~/composables/useImageGuard'
import { useMobileMenu } from '~/composables/useMobileMenu'

const { categories: apiCategories, isLoading, fetchCategories } = useCategories()
const { fetchVisibility, isCategoryVisible } = useCategoryVisibility()
const { isImageFailed, markImageAsFailed } = useImageGuard()
const { isMobileMenuOpen, closeMobileMenu } = useMobileMenu()
const route = useRoute()

const iconByName = (name: string) => {
  const key = name.toLowerCase()
  if (key.includes('máy phát điện') || key.includes('may phat dien')) return 'fa-solid fa-bolt'
  if (key.includes('máy rửa xe') || key.includes('may rua xe')) return 'fa-solid fa-faucet-drip'
  if (key.includes('nén khí') || key.includes('nen khi')) return 'fa-solid fa-wind'
  if (key.includes('cưa xăng') || key.includes('cua xang')) return 'fa-solid fa-wrench'
  if (key.includes('cắt cỏ') || key.includes('cat co')) return 'fa-solid fa-scissors'
  if (key.includes('xới đất') || key.includes('xoi dat')) return 'fa-solid fa-tractor'
  if (key.includes('bơm nước') || key.includes('bom nuoc')) return 'fa-solid fa-water'
  if (key.includes('đầm') || key.includes('dam')) return 'fa-solid fa-building'
  if (key.includes('động cơ') || key.includes('dong co')) return 'fa-solid fa-gear'
  if (key.includes('khoan đất') || key.includes('khoan dat')) return 'fa-solid fa-bore-hole'
  if (key.includes('phun thuốc') || key.includes('phun thuoc')) return 'fa-solid fa-flask-vial'
  if (key.includes('tỉa cành') || key.includes('tia canh')) return 'fa-solid fa-leaf'
  if (key.includes('hút bụi') || key.includes('hut bui')) return 'fa-solid fa-broom'
  if (key.includes('cầm tay') || key.includes('cam tay')) return 'fa-solid fa-wrench'
  if (key.includes('xịt') || key.includes('xit')) return 'fa-solid fa-spray-can'
  return 'fa-solid fa-bag-shopping'
}

const normalizeCategoryName = (value: string | null | undefined) => {
  return (value || '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const categories = computed(() => {
  return apiCategories.value
    .filter(cat => isCategoryVisible(cat.id))
    .map((cat) => ({
      ...cat,
      name: normalizeCategoryName(cat.name),
      icon: iconByName(cat.name),
      children: cat.children
        ?.filter(child => isCategoryVisible(child.id))
        .map(child => ({
          ...child,
          name: normalizeCategoryName(child.name)
        }))
    }))
})

const maxVisibleCategories = 10 // Adjusted to match deal-grid with bigger fonts

const displayedCategories = computed(() => {
  return categories.value.slice(0, maxVisibleCategories)
})

const hasMoreCategories = computed(() => categories.value.length > maxVisibleCategories)

onMounted(() => {
  fetchCategories()
  fetchVisibility()
})

// Close menu whenever the route changes
watch(() => route.path, () => {
  closeMobileMenu()
})

// Also close menu on query change
watch(() => route.query, () => {
  closeMobileMenu()
}, { deep: true })
</script>

<style scoped>
.app-sidebar {
  width: var(--sidebar-w);
  flex: 0 0 var(--sidebar-w);
  align-self: flex-start;
  background: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #e2e2e2;
  color: #222;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  display: none;
  background: transparent;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  padding: 4px;
}

.sidebar-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.menu-icon {
  color: #d82323;
}

.loading-state {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.category-list {
  padding: 6px 0;
  list-style: none;
  margin: 0;
}

.category-li {
  position: relative;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f9f9f9;
  text-decoration: none;
  color: inherit;
  transition: background 0.2s;
}

.category-item:hover {
  background: #f8fbff;
  color: #d82323;
}

.item-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.item-icon-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.item-name {
  flex: 1;
  font-size: 14px;
  color: #333;
  line-height: 1.3;
  font-weight: 500;
}

.category-item:hover .item-name {
  color: #d82323;
}

.arrow-icon {
  font-size: 18px;
  color: #ccc;
  line-height: 1;
}

/* Sub-menu logic */
.sub-menu {
  display: none;
  position: absolute;
  top: 0;
  left: 100%;
  width: 240px;
  background: #fff;
  border: 1px solid #e2e2e2;
  box-shadow: 4px 0 10px rgba(0,0,0,0.1);
  z-index: 100;
  min-height: 100%;
}

.category-li:hover .sub-menu {
  display: block;
}

.sub-menu-content {
  padding: 12px;
}

.sub-menu-header {
  font-weight: 700;
  color: #d82323;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f1f1f1;
  font-size: 15px;
}

.sub-category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sub-category-item {
  display: block;
  padding: 6px 0;
  font-size: 13px;
  color: #444;
  text-decoration: none;
  transition: padding-left 0.2s, color 0.2s;
}

.sub-category-item:hover {
  color: #d82323;
  padding-left: 5px;
}

.view-more {
  margin: auto auto -12px;
  display: block;
  border: 1px solid #4095e6;
  background: #fff;
  color: #1777d2;
  font-size: 14px;
  border-radius: 4px;
  padding: 6px 14px;
  text-align: center;
  text-decoration: none;
  width: 80%;
}

@media (max-width: 1024px) {
  .app-sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    width: 320px;
    max-width: 85vw;
    height: 100vh;
    z-index: 2000;
    box-shadow: 5px 0 15px rgba(0,0,0,0.1);
    transition: left 0.3s ease;
    overflow-y: auto;
  }

  .app-sidebar.is-mobile-open {
    left: 0;
  }

  .close-btn {
    display: block;
  }

  .category-list {
    display: block;
  }

  .category-item {
    border-right: 1px solid #f1f1f1;
  }

  /* Disable hover menu on mobile, maybe just list them or simplify */
  .sub-menu {
    display: none !important;
  }
}

@media (max-width: 640px) {
  .category-list {
    grid-template-columns: 1fr;
  }

  .sidebar-title {
    font-size: 18px;
  }

  .item-name {
    font-size: 14px;
  }
}
</style>
