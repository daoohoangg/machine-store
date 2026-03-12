<template>
  <aside class="app-sidebar">
    <div class="sidebar-title">
      <span class="menu-icon">☰</span>
      <h3>Danh mục sản phẩm</h3>
    </div>

    <ul class="category-list">
      <li v-for="item in displayedCategories" :key="item.name">
        <NuxtLink :to="`/homepage?category=${encodeURIComponent(item.name)}`" class="category-item">
          <span class="item-icon">{{ item.icon }}</span>
          <span class="item-name">{{ item.name }}</span>
        </NuxtLink>
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
import { computed } from 'vue'
import excelCategoriesData from '~/data/excel-categories.json'

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
  const seen = new Set<string>()
  return (excelCategoriesData as string[])
    .map((name) => normalizeCategoryName(name))
    .filter((name) => {
      if (!name) return false
      const key = name.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((name) => ({
      name,
      icon: iconByName(name)
    }))
})

const maxVisibleCategories = 8

const displayedCategories = computed(() => {
  return categories.value.slice(0, maxVisibleCategories)
})

const hasMoreCategories = computed(() => categories.value.length > maxVisibleCategories)
</script>

<style scoped>
.app-sidebar {
  width: var(--sidebar-w);
  flex: 0 0 var(--sidebar-w);
  background: #fff;
  border-right: 1px solid #d8d8d8;
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid #e2e2e2;
  font-size: 18px;
  font-weight: 700;
  color: #222;
}

.menu-icon {
  color: #d82323;
}

.category-list {
  padding: 6px 0;
  list-style: none;
  margin: 0;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f1f1f1;
  text-decoration: none;
  color: inherit;
}

.category-item:hover {
  background: #f8fbff;
}

.item-icon {
  width: 24px;
  text-align: center;
  font-size: 16px;
}

.item-name {
  font-size: 14px;
  color: #222;
  line-height: 1.3;
}

.view-more {
  margin: 10px auto 14px;
  display: block;
  border: 1px solid #4095e6;
  background: #fff;
  color: #1777d2;
  font-size: 14px;
  border-radius: 4px;
  padding: 6px 14px;
}

@media (max-width: 1024px) {
  .app-sidebar {
    width: 100%;
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
