<template>
  <aside class="app-sidebar">
    <div class="sidebar-title">
      <span class="menu-icon">☰</span>
      <h3>Danh mục sản phẩm</h3>
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
        <NuxtLink :to="`/homepage?categoryId=${item.id}&categoryName=${encodeURIComponent(item.name)}`" class="category-item">
          <span class="item-icon">{{ item.icon }}</span>
          <span class="item-name">{{ item.name }}</span>
          <span v-if="item.children && item.children.length > 0" class="arrow-icon">›</span>
        </NuxtLink>

        <!-- Sub-menu -->
        <div v-if="item.children && item.children.length > 0" class="sub-menu">
          <div class="sub-menu-content">
            <div class="sub-menu-header">{{ item.name }}</div>
            <ul class="sub-category-list">
              <li v-for="child in item.children" :key="child.id">
                <NuxtLink :to="`/homepage?categoryId=${child.id}&categoryName=${encodeURIComponent(child.name)}`" class="sub-category-item">
                  {{ child.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </li>
    </ul>

    <NuxtLink
      v-if="hasMoreCategories"
      class="view-more"
      to="/so-do-website"
    >
      Xem thêm chuyên mục
    </NuxtLink>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCategories } from '~/composables/useCategories'

const { categories: apiCategories, isLoading, fetchCategories } = useCategories()

const iconByName = (name: string) => {
  const key = name.toLowerCase()
  if (key.includes('máy phát điện') || key.includes('may phat dien')) return '⚡'
  if (key.includes('máy rửa xe') || key.includes('may rua xe')) return '🚿'
  if (key.includes('nén khí') || key.includes('nen khi')) return '💨'
  if (key.includes('cưa xăng') || key.includes('cua xang')) return '🪚'
  if (key.includes('cắt cỏ') || key.includes('cat co')) return '✂️'
  if (key.includes('xới đất') || key.includes('xoi dat')) return '🚜'
  if (key.includes('bơm nước') || key.includes('bom nuoc')) return '🌊'
  if (key.includes('đầm') || key.includes('dam')) return '🏗️'
  if (key.includes('động cơ') || key.includes('dong co')) return '⚙️'
  if (key.includes('khoan đất') || key.includes('khoan dat')) return '🕳️'
  if (key.includes('phun thuốc') || key.includes('phun thuoc')) return '🧪'
  if (key.includes('tỉa cành') || key.includes('tia canh')) return '🪴'
  if (key.includes('hút bụi') || key.includes('hut bui')) return '🧹'
  if (key.includes('cầm tay') || key.includes('cam tay')) return '🔧'
  if (key.includes('xịt') || key.includes('xit')) return '🔫'
  return '🛍️'
}

const normalizeCategoryName = (value: string | null | undefined) => {
  return (value || '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const categories = computed(() => {
  return apiCategories.value.map((cat) => ({
    ...cat,
    name: normalizeCategoryName(cat.name),
    icon: iconByName(cat.name),
    children: cat.children?.map(child => ({
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
})
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
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid #e2e2e2;
  color: #222;
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
  text-align: center;
  font-size: 16px;
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
    width: 100%;
    align-self: stretch;
    border-right: none;
    border-bottom: 1px solid #d8d8d8;
  }

  .category-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
