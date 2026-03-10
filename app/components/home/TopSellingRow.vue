<template>
  <div class="section top-selling-row">
    <div class="section-header flex-between">
      <h3>Top sản phẩm bán chạy</h3>
      <button class="btn-orange">Xem tất cả ></button>
    </div>

    <div class="product-grid">
      <ProductCard v-for="(prod, idx) in topProducts" :key="idx" :product="prod" />
    </div>
  </div>
</template>

<script setup>
import ProductCard from '~/components/product/ProductCard.vue'

const topProducts = [
  {
    title: 'Bình xịt thuốc diệt côn trùng Con ong vàng 16D (COV-16)',
    price: '920.000',
    oldPrice: '',
    discount: null,
    gift: false,
    ratingCount: 112
  },
  {
    title: 'Máy cắt cỏ Oshima 260 bạc',
    price: '2.090.000',
    oldPrice: '2.550.000',
    discount: '-18%',
    gift: true,
    ratingCount: 13
  },
  {
    title: 'Bình xịt thuốc diệt côn trùng Oshima OS20',
    price: '1.320.000',
    oldPrice: '2.050.000',
    discount: '-35%',
    gift: false,
    ratingCount: 12
  },
  {
    title: 'Máy cắt cỏ Oshima 330',
    price: '2.180.000',
    oldPrice: '3.200.000',
    discount: '-32%',
    gift: true,
    ratingCount: 12
  }
]
</script>

<style scoped>
/* Sections */
.section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--border-color);
  margin-bottom: 20px;
}
.section-header h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
}
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Products Section */
.btn-orange {
  background: #ff9800;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
}
.btn-orange:hover {
  background: #f57c00;
}

/* Product Grid (Single Row override) */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border-top: 1px solid var(--border-color);
  border-left: 1px solid var(--border-color);
}
</style>
