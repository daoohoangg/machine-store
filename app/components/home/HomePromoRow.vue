<template>
  <section class="home-promo-strip">
    <div v-if="isLoading && quickDeals.length === 0" class="loading-placeholder">
      <div v-for="i in 8" :key="i" class="skeleton-item">
        <div class="skeleton-circle"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
    <div v-else class="promo-grid">
      <NuxtLink 
        v-for="item in quickDeals" 
        :key="item.categoryId" 
        :to="`/homepage?categoryId=${item.categoryId}&categoryName=${encodeURIComponent(item.name)}`" 
        class="promo-item"
      >
        <div class="image-circle" :style="{ backgroundColor: !item.imageUrl ? item.color : 'transparent' }">
          <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="cat-thumb" />
          <span v-else class="icon">{{ item.icon }}</span>
        </div>
        <div class="promo-info">
          <span class="promo-label">{{ getLabel(item.name) }}</span>
          <span class="promo-price">{{ item.price }}</span>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

// Get products to find lowest prices
const { products } = useHomeProducts()
// Get categories
const { categories: apiCategories, isLoading, fetchCategories } = useCategories()

onMounted(() => {
  fetchCategories()
})

const formatPrice = (price: number) => {
  if (!price || price <= 0) return 'Giá tốt'
  return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ`
}

const getLabel = (name: string) => {
  const lower = name.toLowerCase()
  if (lower.includes('tivi')) return `Mua ${name} chỉ từ`
  if (lower.includes('tủ') || lower.includes('máy giặt')) return `${name} giá chỉ từ`
  return `${name} giá chỉ từ`
}

const iconByName = (name: string) => {
  const key = name.toLowerCase()
  if (key.includes('tivi')) return '📺'
  if (key.includes('tủ') || key.includes('tu')) return '🧊'
  if (key.includes('giặt') || key.includes('giat')) return '🧺'
  if (key.includes('lọc') || key.includes('loc')) return '🌀'
  if (key.includes('nóng') || key.includes('nuoc')) return '🚰'
  if (key.includes('bụi') || key.includes('bui')) return '🧹'
  if (key.includes('cà phê') || key.includes('ca phe') || key.includes('coffee')) return '☕'
  if (key.includes('điều hòa')) return '❄️'
  return '🛍️'
}

const bgColorByName = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = ['#6B21A8', '#1E40AF', '#2563EB', '#0EA5E9', '#2DD4BF', '#F97316', '#FBBF24', '#B45309']
  return colors[hash % colors.length]
}

const normalizeCategoryName = (value: string | null | undefined) => {
  return (value || '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const quickDeals = computed(() => {
  // Map categoryId to lowest price
  const categoryPriceMap = new Map<number, number>()
  
  if (products.value && Array.isArray(products.value)) {
    products.value.forEach(item => {
      if (item.categoryId && item.price > 0) {
        const cid = Number(item.categoryId)
        const currentMin = categoryPriceMap.get(cid) || Infinity
        if (item.price < currentMin) {
          categoryPriceMap.set(cid, item.price)
        }
      }
    })
  }

  const list: any[] = []
  if (apiCategories.value && Array.isArray(apiCategories.value)) {
    apiCategories.value.forEach((parent) => {
      if (parent.children && parent.children.length > 0) {
        parent.children.forEach((child) => {
          const name = normalizeCategoryName(child.name)
          const minPrice = categoryPriceMap.get(child.id)
          
          list.push({
            categoryId: child.id,
            icon: iconByName(child.name),
            imageUrl: child.image,
            name: name,
            price: minPrice ? formatPrice(minPrice) : 'Giá cực tốt',
            color: bgColorByName(child.name),
            hasPrice: !!minPrice
          })
        })
      }
    })
  }

  // Sort: show categories that have found prices first
  return list
    .sort((a, b) => (b.hasPrice ? 1 : 0) - (a.hasPrice ? 1 : 0))
    .slice(0, 8)
})
</script>

<style scoped>
.home-promo-strip {
  background: #fff;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.promo-grid, .loading-placeholder {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 10px;
  padding: 0 10px;
}

.promo-item, .skeleton-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  text-decoration: none;
}

.image-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s;
  background: #f9f9f9;
}

.cat-thumb {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
  background: #fff;
}

.icon {
  font-size: 32px;
}

.promo-item:hover .image-circle {
  transform: translateY(-4px);
}

.promo-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
}

.promo-label {
  font-size: 13px;
  color: #555;
  line-height: 1.25;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 32px;
}

.promo-price {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
}

/* Skeleton styles */
.skeleton-circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #eee;
}
.skeleton-line {
  height: 12px;
  width: 80%;
  background: #eee;
  border-radius: 2px;
  margin-top: 4px;
}
.skeleton-line.short {
  width: 50%;
}

@media (max-width: 1200px) {
  .promo-grid, .loading-placeholder {
    grid-template-columns: repeat(4, 1fr);
    row-gap: 20px;
  }
}

@media (max-width: 768px) {
  .promo-grid, .loading-placeholder {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .image-circle, .skeleton-circle {
    width: 60px;
    height: 60px;
  }
}
</style>
