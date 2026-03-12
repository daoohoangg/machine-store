<template>
  <div class="homepage-page">
    <div class="category-header">
      <h1>{{ currentCategory || 'Danh mục sản phẩm' }}</h1>
    </div>

    <!-- Product Grid Component Reuse -->
    <div v-if="filteredProducts.length > 0" class="products-grid container">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>

    <div v-else class="empty-state container">
      <p>Không tìm thấy sản phẩm nào trong danh mục này.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHomeProducts } from '~/composables/useHomeProducts'
import ProductCard from '~/components/product/ProductCard.vue'

const route = useRoute()
const { products } = useHomeProducts()

const currentCategory = computed(() => {
  const cat = route.query.category
  return Array.isArray(cat) ? cat[0] : cat
})

const filteredProducts = computed(() => {
  if (!currentCategory.value) return products.value
  
  return products.value.filter(
    (p) => p.category.toLowerCase() === currentCategory.value?.toLowerCase()
  )
})

useSeoMeta({
  title: () => currentCategory.value ? `${currentCategory.value} | Tuấn Minh` : 'Danh mục sản phẩm | Tuấn Minh',
  description: () => currentCategory.value ? `Danh sách các sản phẩm thuộc nhóm ${currentCategory.value} chính hãng tại Tuấn Minh.` : 'Khám phá danh mục sản phẩm máy nông nghiệp tại Tuấn Minh.',
})
</script>

<style scoped>
.homepage-page {
  min-height: 100vh;
  background: #f7f7f7;
  padding-bottom: 40px;
}

.category-header {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  text-align: center;
}

.category-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  padding: 0 15px;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  background: #fff;
  border-radius: 8px;
  color: #666;
}

@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
