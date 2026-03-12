<template>
  <section class="product-section">
    <div class="section-head">
      <h3>💡 Gợi ý cho bạn</h3>
    </div>

    <div class="product-grid">
      <ProductCard v-for="item in products" :key="item.title" :product="item" />
    </div>

    <div class="section-foot">
      <button class="more-btn">Xem thêm sản phẩm ▼</button>
    </div>
  </section>
</template>

<script setup lang="ts">
const { products: homeProducts } = useHomeProducts()

const products = computed(() => {
  return homeProducts.value.slice(0, 18).map((item) => ({
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
  font-size: 36px;
  color: #222;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
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
    font-size: 26px;
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

  .section-head h3 {
    font-size: 20px;
  }
}
</style>
