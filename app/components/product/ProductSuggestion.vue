<template>
  <section class="suggestion-section">
    <div class="section-head">
      <h3>Goi y cho ban</h3>
    </div>

    <div v-if="pending && randomProducts.length === 0" class="loading-state">
      Dang tai goi y...
    </div>

    <div v-else-if="randomProducts.length > 0" class="product-grid">
      <ProductCard
        v-for="item in randomProducts"
        :key="item.id"
        :product="item"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import ProductCard from '~/components/product/ProductCard.vue'

const { products, pending } = useHomeProducts()
const { isImageFailed } = useImageGuard()

const isClient = ref(false)

onMounted(() => {
  isClient.value = true
})

const randomProducts = computed(() => {
  const validProducts = products.value.filter(p => !isImageFailed(p.image))
  
  if (validProducts.length === 0) return []
  
  return validProducts.slice(0, 18).map(item => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    price: item.price,
    discount: item.discount,
    sold: item.sold,
    soldPercent: Math.min(95, Math.max(10, Math.round((item.sold || 2) / 1))),
    image: item.image,
    specs: item.specs || []
  }))
})
</script>

<style scoped>
.suggestion-section {
  margin-top: 12px;
  border: 1px solid #d8d8d8;
  background: #ededed;
  padding: 10px;
}

.section-head {
  margin-bottom: 10px;
}

.section-head h3 {
  margin: 0;
  font-size: 24px;
  color: #e31b1b;
  text-transform: uppercase;
  font-weight: 700;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #666;
  font-size: 16px;
}

@media (max-width: 1200px) {
  .section-head h3 {
    font-size: 20px;
  }
  .product-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 992px) {
  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
  
  .product-grid > *:nth-child(n+7) {
    display: none;
  }

  .section-head h3 {
    font-size: 18px;
  }
}
</style>
