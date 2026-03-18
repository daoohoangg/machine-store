<template>
  <section class="product-section" v-if="pending || products.length > 0">
    <div class="section-head">
      <h3>{{ sectionTitle }}</h3>
    </div>

    <div v-if="pending && products.length === 0" class="loading-state">
      Đang tải sản phẩm...
    </div>

    <div v-else-if="products.length > 0" class="product-grid">
      <ProductCard
        v-for="item in products"
        :key="item.title"
        :product="item"
      />
    </div>



    <div class="section-foot" v-if="products.length > 0 && !limitToOneRow">
      <button 
        class="more-btn" 
        :disabled="pending"
        @click="handleLoadMore"
      >
        {{ pending ? 'Đang tải...' : 'Xem thêm sản phẩm ▼' }}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
const { lastViewedCategory } = useViewedProducts()
const { products: homeProducts, loadMore, pending } = useHomeProducts(() => lastViewedCategory.value)
const { isImageFailed } = useImageGuard()

const props = defineProps({
  limitToOneRow: {
    type: Boolean,
    default: false
  }
})

const currentPage = ref(1)

// Dynamic title based on viewed history
const sectionTitle = computed(() => {
  return 'Sản phẩm đã xem'
})

const products = computed(() => {
  let list = homeProducts.value
    .filter(item => !isImageFailed(item.image))
    .map((item) => ({
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
    
  if (props.limitToOneRow) {
    list = list.slice(0, 6)
  }
  return list
})

const handleLoadMore = async () => {
  currentPage.value++
  await loadMore(currentPage.value)
}
</script>

<style scoped>
.product-section {
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
  color: #222;
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

.section-foot {
  text-align: center;
  padding: 12px 0 4px;
}

.more-btn {
  border: 1px solid #2a84d8;
  border-radius: 4px;
  background: #fff;
  color: #0869c6;
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .section-head h3 {
    font-size: 20px;
  }

  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .more-btn {
    font-size: 15px;
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
