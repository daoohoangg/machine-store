<template>
  <section class="top-selling-row">
    <div class="deals-grid" :class="{ 'is-expanded': isExpanded }">
      <NuxtLink
        v-for="item in displayedDeals"
        :key="item.categoryId"
        :to="`/homepage?categoryId=${item.categoryId}&categoryName=${encodeURIComponent(item.name)}`"
        class="deal-item"
      >
        <div class="icon-circle" :style="{ background: item.imageUrl ? 'transparent' : item.color }">
          <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="deal-img" />
          <i v-else :class="item.icon"></i>
        </div>
        <div class="deal-info">
          <p class="deal-label">
            {{ item.name }}
          </p>
          <p class="deal-price" v-if="item.price">{{ item.price }}</p>
        </div>
      </NuxtLink>
    </div>

    <div v-if="hasMore" class="controls">
      <button
        class="view-more"
        type="button"
        @click="isExpanded = !isExpanded"
      >
        <span>{{ isExpanded ? 'Thu gọn chuyên mục' : 'Xem thêm chuyên mục' }}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ rotated: isExpanded }"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHomeProducts } from '~/composables/useHomeProducts'
import { useCategories } from '~/composables/useCategories'

const { products } = useHomeProducts()
const { categories: apiCategories } = useCategories()

const isExpanded = ref(false)

const formatPrice = (price: number) => `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ`

const iconByName = (name: string) => {
  const key = name.toLowerCase()
  if (key.includes('tivi')) return 'fa-solid fa-tv'
  if (key.includes('tủ') || key.includes('tu')) return 'fa-solid fa-warehouse' // Fridge/Cabinet
  if (key.includes('giặt') || key.includes('giat')) return 'fa-solid fa-shirt'
  if (key.includes('lọc') || key.includes('loc')) return 'fa-solid fa-faucet-drip'
  if (key.includes('nóng') || key.includes('nuoc')) return 'fa-solid fa-temperature-high'
  if (key.includes('bụi') || key.includes('bui')) return 'fa-solid fa-broom'
  if (key.includes('cà phê') || key.includes('ca phe') || key.includes('coffee') || key.includes('pha')) return 'fa-solid fa-mug-hot'
  if (key.includes('điều hòa')) return 'fa-solid fa-snowflake'
  return 'fa-solid fa-bag-shopping'
}

const bgColorByName = (name: string) => {
  const key = name.toLowerCase()
  if (key.includes('tivi')) return 'linear-gradient(135deg, #8E2DE2, #4A00E0)'
  if (key.includes('tủ lạnh') || key.includes('tu lanh')) return 'linear-gradient(135deg, #2b5876, #4e4376)'
  if (key.includes('máy giặt') || key.includes('giat')) return 'linear-gradient(135deg, #1e3c72, #2a5298)'
  if (key.includes('máy lọc') || key.includes('loc khong khi')) return 'linear-gradient(135deg, #a8edea, #fed6e3)'
  if (key.includes('cây nước') || key.includes('hot water')) return 'linear-gradient(135deg, #00c6ff, #0072ff)'
  if (key.includes('hút bụi')) return 'linear-gradient(135deg, #f093fb, #f5576c)'
  if (key.includes('coffee')) return 'linear-gradient(135deg, #606c88, #3f4c6b)'
  if (key.includes('bình nóng lạnh')) return 'linear-gradient(135deg, #ff9a9e, #fad0c4)'
  return 'linear-gradient(135deg, #667eea, #764ba2)'
}

const normalizeCategoryName = (value: string | null | undefined) => {
  return (value || '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const quickDeals = computed(() => {
  const list: any[] = []
  
  // Also try to get min price from products if available for these categories
  const categoryPriceMap = new Map<string, number>()
  for (const item of products.value) {
    const name = normalizeCategoryName(item.category)
    const current = categoryPriceMap.get(name) || Infinity
    if (item.price < current && item.price > 0) {
      categoryPriceMap.set(name, item.price)
    }
  }

  apiCategories.value.forEach((parent) => {
    if (parent.children && parent.children.length > 0) {
      parent.children.forEach((child) => {
        const name = normalizeCategoryName(child.name)
        const minPrice = categoryPriceMap.get(name)
        list.push({
          categoryId: child.id,
          icon: iconByName(child.name),
          imageUrl: child.image,
          name: name,
          price: minPrice ? formatPrice(minPrice) : '',
          color: bgColorByName(child.name)
        })
      })
    } else {
      const name = normalizeCategoryName(parent.name)
      const minPrice = categoryPriceMap.get(name)
      list.push({
        categoryId: parent.id,
        icon: iconByName(parent.name),
        imageUrl: parent.image,
        name: name,
        price: minPrice ? formatPrice(minPrice) : '',
        color: bgColorByName(parent.name)
      })
    }
  })

  return list
})

const displayedDeals = computed(() => {
  if (isExpanded.value) return quickDeals.value
  return quickDeals.value.slice(0, 16)
})

const hasMore = computed(() => quickDeals.value.length > 16)
</script>

<style scoped>
.top-selling-row {
  background: #fff;
  border-top: 1px solid #f0f3f5;
  padding-bottom: 20px;
  width: calc(100% - var(--sidebar-w));
  margin-left: var(--sidebar-w);
}

.controls {
  padding: 12px 0;
  display: flex;
  justify-content: center;
  background: #fff;
}

.view-more {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #4095e6;
  background: #fff;
  color: #1777d2;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  padding: 6px 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-more:hover {
  background: #f0f7ff;
}

.view-more svg {
  transition: transform 0.3s;
}

.view-more svg.rotated {
  transform: rotate(180deg);
}

.deals-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  border-top: 1px solid #e8e8e8;
  border-left: 1px solid #e8e8e8;
}

.deal-item {
  padding: 16px 8px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  background: #fff;
  text-decoration: none;
  border-right: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
}

.deal-item:hover {
  transform: translateY(-2px);
}

.icon-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}

.deal-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.deal-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.deal-label {
  margin: 0;
  font-size: 13px;
  color: #666;
  line-height: 1.3;
}

.deal-price {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1d;
}

@media (max-width: 1200px) {
  .deals-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    row-gap: 14px;
  }
}

@media (max-width: 1024px) {
  .top-selling-row {
    width: 100%;
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .top-selling-row {
    padding-bottom: 0px !important;
    margin-bottom: 0px !important;
    border-top: none !important;
  }
  
  .controls {
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
  }
  
  .deals-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border-bottom: none !important;
    row-gap: 8px;
  }
  
  .deal-item {
    padding: 8px 4px;
    gap: 4px;
  }

  .icon-circle {
    width: 44px; /* Reduced from 60px */
    height: 44px;
    font-size: 20px;
  }
  
  .deal-label {
    font-size: 11px; /* Reduced text size */
    line-height: 1.2;
  }
  
  .deal-price {
    font-size: 13px; /* Reduced price size */
  }
  
  /* Show 8 items by default (2 rows of 4) on mobile */
  .deals-grid:not(.is-expanded) .deal-item:nth-child(n+9) {
    display: none;
  }
}
</style>
