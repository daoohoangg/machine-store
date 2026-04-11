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

      <div v-if="isLoading" class="loading-panel">
        Đang tải dữ liệu...
      </div>

      <div v-else-if="viewMode === 'group'" class="panel">
        <div class="group-header">
          <i class="fa-solid fa-cart-shopping"></i>
          <strong>Điện máy</strong>
        </div>

        <div class="category-grid">
          <NuxtLink
            v-for="item in categories"
            :key="item.id"
            :to="`/homepage?category=${encodeURIComponent(item.name)}`"
            class="category-item"
          >
              <div class="item-icon">
                <img v-if="item.image && !isImageFailed(item.image)" :src="item.image" :alt="item.name" @error="markImageAsFailed(item.image)" class="item-icon-img" />
                <i v-else :class="item.icon"></i>
              </div>
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
              :key="item.id"
              :to="`/homepage?category=${encodeURIComponent(item.name)}`"
              class="category-item"
            >
              <div class="item-icon">
                <img v-if="item.image && !isImageFailed(item.image)" :src="item.image" :alt="item.name" @error="markImageAsFailed(item.image)" class="item-icon-img" />
                <i v-else :class="item.icon"></i>
              </div>
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
import { computed, ref, onMounted } from 'vue'
import { useCategories } from '~/composables/useCategories'
import { useHomeProducts } from '~/composables/useHomeProducts'
import { useImageGuard } from '~/composables/useImageGuard'

type ViewMode = 'group' | 'az' | 'brand'

const viewMode = ref<ViewMode>('group')
const { categories: apiCategories, isLoading, fetchCategories } = useCategories()
const { isImageFailed, markImageAsFailed } = useImageGuard()

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
  if (key.includes('may phat dien')) return 'fa-solid fa-bolt'
  if (key.includes('may rua xe')) return 'fa-solid fa-faucet-drip'
  if (key.includes('nen khi')) return 'fa-solid fa-wind'
  if (key.includes('cua xang')) return 'fa-solid fa-wrench'
  if (key.includes('cat co')) return 'fa-solid fa-scissors'
  if (key.includes('xoi dat')) return 'fa-solid fa-tractor'
  if (key.includes('bom nuoc')) return 'fa-solid fa-water'
  if (key.includes('dam')) return 'fa-solid fa-building'
  if (key.includes('dong co')) return 'fa-solid fa-gear'
  if (key.includes('khoan dat')) return 'fa-solid fa-bore-hole'
  if (key.includes('phun thuoc')) return 'fa-solid fa-flask-vial'
  if (key.includes('tia canh')) return 'fa-solid fa-leaf'
  if (key.includes('hut bui')) return 'fa-solid fa-broom'
  if (key.includes('cam tay')) return 'fa-solid fa-wrench'
  if (key.includes('xit')) return 'fa-solid fa-spray-can'
  return 'fa-solid fa-bag-shopping'
}

// Get all categories including subcategories for A-Z sorting
const flattenCategories = (cats: any[]): any[] => {
  let result: any[] = []
  cats.forEach(cat => {
    result.push(cat)
    if (cat.children && cat.children.length > 0) {
      result = result.concat(flattenCategories(cat.children))
    }
  })
  return result
}

const categories = computed(() => {
  return apiCategories.value.map((cat) => ({
    ...cat,
    name: normalizeCategoryName(cat.name),
    icon: iconByName(cat.name)
  }))
})

const categoriesByLetter = computed(() => {
  const allCats = flattenCategories(apiCategories.value)
  const grouped = new Map<string, Array<{ id: number; name: string; icon: string; image: string }>>()
  
  const processed = allCats.map(cat => ({
    id: cat.id,
    name: normalizeCategoryName(cat.name),
    icon: iconByName(cat.name),
    image: cat.image
  }))

  const sorted = processed.sort((a, b) => textKey(a.name).localeCompare(textKey(b.name)))

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

onMounted(() => {
  fetchCategories()
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
  font-size: 20px;
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

.loading-panel {
  padding: 40px;
  text-align: center;
  font-size: 20px;
  color: #666;
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
  text-decoration: none;
}

.category-item:hover {
  background: #e6ecf8;
}

.item-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.item-icon-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
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
