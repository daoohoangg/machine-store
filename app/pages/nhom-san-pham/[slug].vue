<template>
  <div class="group-page container">
    <div class="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <span>/</span>
      <span class="current">{{ groupName }}</span>
    </div>

    <div class="page-header">
      <h1>{{ groupName }}</h1>
      <div v-if="!pending" class="product-count">{{ products.length }} sản phẩm</div>
    </div>

    <div v-if="pending" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải sản phẩm...</p>
    </div>

    <div v-else-if="products.length === 0" class="empty-state">
      <p>Không tìm thấy sản phẩm nào trong nhóm này.</p>
    </div>

    <div v-else class="product-grid">
      <ProductCard 
        v-for="p in products" 
        :key="p.id" 
        :product="p" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useManualGroups } from '~/composables/useManualGroups'
import { useHomeProducts } from '~/composables/useHomeProducts'
import { useGroups } from '~/composables/useGroups'
import { useImageGuard } from '~/composables/useImageGuard'

const route = useRoute()
const slug = route.params.slug as string
const { manualGroups, fetchManualGroups } = useManualGroups()
const { groups, fetchGroups } = useGroups()
const { isImageFailed } = useImageGuard()

const groupName = computed(() => {
  if (slug === 'flash-sale') return 'Flash Sale (⚡)'
  if (slug === 'new-products' || slug === 'san-pham-moi') return 'Sản phẩm mới (🆕)'
  return 'Nhóm sản phẩm'
})

const manualKey = computed(() => {
  if (slug === 'flash-sale') return 'flash-sale'
  if (slug === 'new-products' || slug === 'san-pham-moi') return 'new-products'
  return null
})

const manualProducts = computed(() => {
  if (!manualKey.value) return []
  return (manualGroups.value as any)[manualKey.value as any] || []
})

const manualPending = computed(() => false)

const apiGroupId = computed(() => {
  if (!groups.value) return null
  const searchName = slug === 'flash-sale' ? 'FLASH SALE' : 'SẢN PHẨM MỚI'
  const group = groups.value.find(g => 
    g.name?.toUpperCase().includes(searchName) || 
    g.slug?.toLowerCase().includes(slug.toLowerCase())
  )
  return group?.id || null
})

const { products: apiProducts, pending: apiPending } = useHomeProducts(computed(() => {
  if (apiGroupId.value) return { group_id: apiGroupId.value, limit: 100 }
  return { limit: 100 }
}))

const products = computed(() => {
  const all = manualProducts.value.length > 0 ? [...manualProducts.value] : [...apiProducts.value]
  const unique = Array.from(new Map(all.map(p => [p.id, p])).values())
  
  const valid = unique.filter(p => !isImageFailed(p.image))
  
  // Sorting: manual first, then rest
  return valid.sort((a, b) => {
    const manualIds = manualProducts.value.map(p => String(p.id))
    const aIdx = manualIds.indexOf(String(a.id))
    const bIdx = manualIds.indexOf(String(b.id))
    
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    
    return Number(b.id) - Number(a.id)
  })
})

const pending = computed(() => manualPending.value || apiPending.value)

onMounted(() => {
  fetchManualGroups()
  fetchGroups()
})

useHead({
  title: `${groupName.value} - Tuấn Minh Điện Máy`
})
</script>

<style scoped>
.group-page {
  padding: 40px 15px;
  min-height: 60vh;
}
.breadcrumb {
  display: flex;
  gap: 10px;
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
}
.breadcrumb a {
  color: #0869c6;
  text-decoration: none;
}
.breadcrumb a:hover {
  text-decoration: underline;
}
.page-header {
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.page-header h1 {
  font-size: 28px;
  margin: 0;
  text-transform: uppercase;
  color: #e31b1b;
  font-weight: 700;
}
.product-count {
  font-size: 14px;
  color: #888;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
}
@media (max-width: 1200px) {
  .product-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 900px) {
  .product-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 600px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .page-header h1 { font-size: 20px; }
}
.loading-state, .empty-state {
  text-align: center;
  padding: 100px 0;
  color: #999;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #e31b1b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
