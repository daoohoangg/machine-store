<template>
  <section class="site-map-page">
    <div class="site-map-card">
      <h1>Sơ đồ website Tuấn Minh</h1>

      <NuxtLink to="/" class="home-link">Trang chủ</NuxtLink>

      <p class="section-label">Danh mục sản phẩm</p>

      <div class="tabs">
        <button
          type="button"
          class="tab-btn"
          :class="{ active: viewMode === 'group' }"
          @click="viewMode = 'group'"
        >
          Nhóm hàng
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: viewMode === 'az' }"
          @click="viewMode = 'az'"
        >
          Sắp xếp A - Z
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ active: viewMode === 'brand' }"
          @click="viewMode = 'brand'"
        >
          Thương hiệu
        </button>
      </div>

      <div v-if="viewMode === 'group'" class="panel">
        <div class="group-header">
          <span>🛒</span>
          <strong>Điện máy</strong>
        </div>

        <div class="category-grid">
          <NuxtLink
            v-for="item in categories"
            :key="item.name"
            :to="`/homepage?category=${encodeURIComponent(item.name)}`"
            class="category-item"
          >
            <span class="item-icon">{{ item.icon }}</span>
            <span class="item-name">{{ item.name }}</span>
          </NuxtLink>
        </div>
      </div>

      <div v-else-if="viewMode === 'az'" class="panel panel-az">
        <div v-for="[letter, items] in categoriesByLetter" :key="letter" class="letter-block">
          <h3>{{ letter }}</h3>
          <div class="category-grid">
            <NuxtLink
              v-for="item in items"
              :key="item.name"
              :to="`/homepage?category=${encodeURIComponent(item.name)}`"
              class="category-item"
            >
              <span class="item-icon">{{ item.icon }}</span>
              <span class="item-name">{{ item.name }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <div v-else class="panel">
        <div class="brand-grid">
          <span v-for="brand in brands" :key="brand" class="brand-item">{{ brand }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import excelCategoriesData from '~/data/excel-categories.json'
import { useHomeProducts } from '~/composables/useHomeProducts'

type ViewMode = 'group' | 'az' | 'brand'

const viewMode = ref<ViewMode>('group')

const normalizeCategoryName = (value: string | null | undefined) => {
  return (value || '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const textKey = (value: string) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
}

const iconByName = (name: string) => {
  const key = textKey(name)
  if (key.includes('may phat dien')) return '⚡'
  if (key.includes('may rua xe')) return '🚿'
  if (key.includes('nen khi')) return '💨'
  if (key.includes('cua xang')) return '🪚'
  if (key.includes('cat co')) return '✂️'
  if (key.includes('xoi dat')) return '🚜'
  if (key.includes('bom nuoc')) return '🌊'
  if (key.includes('dam')) return '🏗️'
  if (key.includes('dong co')) return '⚙️'
  if (key.includes('khoan dat')) return '🕳️'
  if (key.includes('phun thuoc')) return '🧪'
  if (key.includes('tia canh')) return '🪴'
  if (key.includes('hut bui')) return '🧹'
  if (key.includes('cam tay')) return '🔧'
  if (key.includes('xit')) return '🔫'
  return '🛍️'
}

const categories = computed(() => {
  const seen = new Set<string>()
  return (excelCategoriesData as string[])
    .map((name) => normalizeCategoryName(name))
    .filter((name) => {
      if (!name) return false
      const key = textKey(name)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((name) => ({ name, icon: iconByName(name) }))
})

const categoriesByLetter = computed(() => {
  const grouped = new Map<string, Array<{ name: string; icon: string }>>()
  const sorted = [...categories.value].sort((a, b) => textKey(a.name).localeCompare(textKey(b.name)))

  for (const item of sorted) {
    const letter = textKey(item.name).charAt(0).toUpperCase() || '#'
    const bucket = grouped.get(letter) || []
    bucket.push(item)
    grouped.set(letter, bucket)
  }

  return Array.from(grouped.entries())
})

const { products } = useHomeProducts()

const brands = computed(() => {
  const seen = new Set<string>()
  return products.value
    .map((item) => item.brand)
    .filter((brand) => {
      const value = brand.trim()
      if (!value) return false
      const key = textKey(value)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => textKey(a).localeCompare(textKey(b)))
})
</script>

<style scoped>
.site-map-page {
  background: #f0f0f0;
  padding: 10px;
}

.site-map-card {
  background: #fff;
  border: 1px solid #d8d8d8;
}

h1 {
  margin: 0;
  font-size: 34px;
  font-weight: 500;
  padding: 12px 14px;
  border-bottom: 1px solid #e5e5e5;
}

.home-link {
  display: inline-block;
  margin: 10px 14px 0;
  color: #1a66d8;
  font-size: 24px;
  font-weight: 500;
}

.section-label {
  margin: 12px 14px 8px;
  font-size: 28px;
  color: #222;
}

.tabs {
  display: flex;
  gap: 10px;
  padding: 0 14px 10px;
  border-bottom: 1px solid #d8d8d8;
}

.tab-btn {
  border: none;
  background: none;
  border-bottom: 2px solid transparent;
  color: #444;
  cursor: pointer;
  font-size: 20px;
  padding: 6px 10px;
}

.tab-btn.active {
  color: #1a66d8;
  border-bottom-color: #1a66d8;
}

.panel {
  background: #efefef;
  padding: 12px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  margin-bottom: 10px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px 14px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  color: #1c1c1c;
}

.category-item:hover {
  background: #e6ecf8;
}

.item-icon {
  font-size: 20px;
}

.item-name {
  font-size: 20px;
  line-height: 1.3;
}

.panel-az {
  display: grid;
  gap: 14px;
}

.letter-block h3 {
  margin: 0 0 6px;
  font-size: 22px;
  color: #2b2b2b;
}

.brand-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

.brand-item {
  background: #fff;
  border: 1px solid #dadada;
  border-radius: 6px;
  padding: 8px 10px;
  text-align: center;
  font-size: 18px;
  color: #333;
}

@media (max-width: 1200px) {
  h1 {
    font-size: 26px;
  }

  .home-link {
    font-size: 20px;
  }

  .section-label {
    font-size: 22px;
  }

  .tab-btn {
    font-size: 16px;
  }

  .group-header {
    font-size: 20px;
  }

  .category-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .item-name {
    font-size: 16px;
  }

  .brand-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .tabs {
    flex-wrap: wrap;
    gap: 6px;
  }

  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .brand-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
