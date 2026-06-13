<template>
  <section class="category-section">
    <div v-if="isLoading && categories.length === 0" class="loading-state">
      Đang tải chuyên mục...
    </div>
    <div v-else class="category-grid">
      <NuxtLink
        v-for="item in displayedCategories"
        :key="item.id"
        :to="`/homepage?categoryId=${item.id}&categoryName=${encodeURIComponent(item.name)}`"
        class="cat-item"
      >
        <div class="icon-wrap">
          <i :class="item.icon"></i>
        </div>
        <div class="cat-info">
          <p class="cat-name">{{ item.name }}</p>
        </div>
        <span v-if="item.discount" class="discount">{{ item.discount }}</span>
      </NuxtLink>
    </div>

    <div class="view-more-container">
      <button
        v-if="hasMoreCategories"
        class="view-more"
        type="button"
        @click="toggleCategories"
      >
        {{ isExpanded ? 'Thu gọn chuyên mục' : 'Xem thêm chuyên mục' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useHomeProducts } from '~/composables/useHomeProducts'
import { useCategories } from '~/composables/useCategories'

const { categories: apiCategories, isLoading, fetchCategories } = useCategories()

onMounted(() => {
  fetchCategories()
})

const iconByName = (name: string) => {
  const key = name.toLowerCase()
  if (key.includes('máy phát điện') || key.includes('may phat dien')) return 'fa-solid fa-bolt'
  if (key.includes('máy rửa xe') || key.includes('may rua xe')) return 'fa-solid fa-faucet-drip'
  if (key.includes('nén khí') || key.includes('nen khi')) return 'fa-solid fa-wind'
  if (key.includes('cưa xăng') || key.includes('cua xang')) return 'fa-solid fa-wrench' // Placeholder if no specific icon
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
  if (key.includes('tivi')) return 'fa-solid fa-tv'
  if (key.includes('quat')) return 'fa-solid fa-fan'
  if (key.includes('hut am')) return 'fa-solid fa-droplet-slash'
  if (key.includes('tu lanh') || key.includes('tủ lạnh')) return 'fa-solid fa-refrigerator'
  if (key.includes('giat')) return 'fa-solid fa-shirt'
  if (key.includes('dieu hoa') || key.includes('điều hòa')) return 'fa-solid fa-snowflake'
  if (key.includes('say')) return 'fa-solid fa-shirt'
  return 'fa-solid fa-bag-shopping'
}

const parseDiscount = (text: string | null) => {
  if (!text) return 0
  const num = Number((text || '').replace(/[^\d]/g, ''))
  return Number.isNaN(num) ? 0 : num
}

const normalizeCategoryName = (value: string | null | undefined) => {
  return (value || '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const { products } = useHomeProducts()

const categoryDiscountMap = computed(() => {
  const grouped = new Map<string, string | null>()

  for (const item of products.value) {
    const name = normalizeCategoryName(item.category) || 'Danh mục'
    const current = grouped.get(name)
    const currentDiscountValue = parseDiscount(current || null)
    const nextDiscountValue = parseDiscount(item.discount)
    grouped.set(name, nextDiscountValue > currentDiscountValue ? item.discount : current || null)
  }

  return grouped
})

const categories = computed(() => {
  const list: any[] = []
  
  apiCategories.value.forEach((parent) => {
    if (parent.children && parent.children.length > 0) {
      parent.children.forEach((child) => {
        list.push({
          id: child.id,
          name: child.name,
          icon: iconByName(child.name),
          discount: categoryDiscountMap.value.get(normalizeCategoryName(child.name)) || null
        })
      })
    } else {
      list.push({
        id: parent.id,
        name: parent.name,
        icon: iconByName(parent.name),
        discount: categoryDiscountMap.value.get(normalizeCategoryName(parent.name)) || null
      })
    }
  })

  return list
})

const maxVisibleCategories = 16
const isExpanded = ref(false)
const displayedCategories = computed(() => {
  if (isExpanded.value) return categories.value // Show original sorted list when expanded
  return categories.value.slice(0, maxVisibleCategories)
})

const hasMoreCategories = computed(() => categories.value.length > maxVisibleCategories)

const toggleCategories = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.category-section {
  background: #fff;
  border: none;
  width: calc(100% - var(--sidebar-w));
  margin-left: var(--sidebar-w);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.cat-item {
  border-right: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  padding: 12px 8px;
  text-align: center;
  position: relative;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  background: #fff;
}

.cat-item:hover {
  background: #fcfcfc;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.02);
}

.cat-item:nth-child(6n) {
  border-right: none;
}

.icon-wrap {
  font-size: 32px;
  line-height: 1;
}

.cat-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.cat-name {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #1b1b1b;
  line-height: 1.25;
}


.discount {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: #d81e1e;
  padding: 2px 5px;
  border-radius: 2px;
}

.view-more-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  border-top: 1px solid #e8e8e8;
}

.view-more {
  display: block;
  border: 1px solid #4095e6;
  background: #fff;
  color: #1777d2;
  font-size: 16px;
  border-radius: 4px;
  padding: 8px 18px;
  cursor: pointer;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #888;
}

@media (max-width: 1200px) {
  .category-section {
    width: 100%;
    margin-left: 0;
  }
  .category-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .cat-item:nth-child(6n) {
    border-right: 1px solid #e8e8e8;
  }

  .cat-item:nth-child(4n) {
    border-right: none;
  }
}

@media (max-width: 1024px) {
  .category-section {
    width: 100%;
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .category-section {
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
  }
  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cat-item:nth-child(4n) {
    border-right: 1px solid #e8e8e8;
  }

  .cat-item:nth-child(2n) {
    border-right: none;
  }

  .view-more-container {
    padding-bottom: 5px !important;
    margin-bottom: 0 !important;
    border-bottom: none !important;
  }

  .view-more {
    font-size: 14px;
    margin-bottom: 0;
  }
}
</style>

