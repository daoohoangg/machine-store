<template>
  <section class="category-row-section" v-if="newProducts.length > 0">
    <div class="section-head">
      <h3>Sản phẩm mới</h3>
      <NuxtLink to="/homepage" class="view-all">Xem tất cả ></NuxtLink>
    </div>

    <div class="product-grid">
      <ProductCard
        v-for="item in newProducts"
        :key="item.id"
        :product="item"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ProductCard from '~/components/product/ProductCard.vue'
import { useHomeProducts, type FetchOptions } from '~/composables/useHomeProducts'
import { useGroups } from '~/composables/useGroups'
import { useImageGuard } from '~/composables/useImageGuard'

const { groups, fetchGroups } = useGroups()

onMounted(() => {
  if (!groups.value.length) {
    fetchGroups()
  }
})

const newProductsGroupId = computed(() => {
  if (!groups.value) return null
  const group = groups.value.find(g => g.slug === 'san-pham-moi' || g.name?.toUpperCase().includes('SẢN PHẨM MỚI'))
  return group?.id || null
})

const fetchOptions = computed<FetchOptions>(() => {
  if (newProductsGroupId.value) {
    return { group_id: newProductsGroupId.value, limit: 100 }
  }
  return { limit: 100 } // fallback
})

const { products } = useHomeProducts(fetchOptions)
const { isImageFailed } = useImageGuard()

const newProducts = computed(() => {
  if (!products.value?.length) return []
  
  const validProducts = products.value.filter(p => !isImageFailed(p.image))
  
  const sorted = [...validProducts]
  // Fallback sort if group ID is not yet available
  if (!newProductsGroupId.value) {
    sorted.sort((a, b) => Number(b.id) - Number(a.id))
  }
  
  return sorted.slice(0, 6) // Limit to one row of 6 products
})
</script>

<style scoped>
.category-row-section {
  margin-top: 12px;
  border: 1px solid #d8d8d8;
  background: #ededed; /* Grey background like ProductSection */
  padding: 10px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-head h3 {
  margin: 0;
  font-size: 24px;
  color: #222;
  text-transform: uppercase;
  font-weight: 700;
}

.view-all {
  font-size: 14px;
  color: #0869c6;
  text-decoration: none;
}
.view-all:hover {
  text-decoration: underline;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 1200px) {
  .section-head h3 {
    font-size: 20px;
  }
  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .product-grid > *:nth-child(n+7) {
    display: none;
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
  
  /* Show only exactly 4 items on mobile (2 cols, 2 rows) */
  .product-grid > *:nth-child(n+5) {
    display: none;
  }

  .section-head h3 {
    font-size: 18px;
  }
}
</style>
