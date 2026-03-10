<template>
  <div class="product-section">
    <div class="sort-bar">
      <button class="sort-btn active">Bán chạy nhất</button>
      <button class="sort-btn">Giá tăng dần</button>
      <button class="sort-btn">Giá giảm dần</button>
      <button class="sort-btn">Giảm giá</button>
      <button class="sort-btn">Mới nhất</button>
      
      <div class="view-modes">
        <span :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">☷</span>
        <span :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">𝌆</span>
      </div>
    </div>

    <div class="product-grid" :class="{ 'list-layout': viewMode === 'list' }">
      <ProductCard 
        v-for="(prod, idx) in products" 
        :key="idx" 
        :product="prod" 
        :is-list-view="viewMode === 'list'" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProductCard from '~/components/product/ProductCard.vue'

const viewMode = ref('grid') // Default to grid view

const products = [
  {
    title: 'Máy chà nhám Oshima CNL-1200 - 1.200W',
    price: '1.750.000',
    oldPrice: '',
    discount: null,
    gift: false,
    ratingCount: 0
  },
  {
    title: 'Bình xịt thuốc diệt côn trùng Oshima OS20',
    price: '1.320.000',
    oldPrice: '1.350.000',
    discount: '-30K',
    gift: false,
    ratingCount: 12
  },
  {
    title: 'Bình xịt điện bơm đôi con ong vàng COV20 DP (20 lít)',
    price: '1.430.000',
    oldPrice: '1.550.000',
    discount: '-120K',
    gift: false,
    ratingCount: 3
  },
  {
    title: 'Dây xịt áp lực Oshima 8.5mm x 15m',
    price: '220.000',
    oldPrice: '290.000',
    discount: '-24%',
    gift: false,
    ratingCount: 0
  },
  {
    title: 'Máy xoa hồ Oshima MXH 750',
    price: '2.730.000',
    oldPrice: '3.900.000',
    discount: '-30%',
    gift: false,
    ratingCount: 0
  },
  {
    title: 'Máy cắt sắt Oshima OS 2000',
    price: '1.730.000',
    oldPrice: '',
    discount: null,
    gift: false,
    ratingCount: 0
  },
  {
    title: 'Máy cưa xích Oshima OS5280 LT',
    price: '2.340.000',
    oldPrice: '',
    discount: null,
    gift: false,
    ratingCount: 1
  },
  {
    title: 'Máy cắt cỏ 2 thì Oshima Super 430',
    price: '2.350.000',
    oldPrice: '2.990.000',
    discount: '-21%',
    gift: true,
    ratingCount: 0
  },
  {
    title: 'Máy cắt cỏ 2 thì Oshima TJ53',
    price: '3.440.000',
    oldPrice: '4.550.000',
    discount: '-24%',
    gift: true,
    ratingCount: 0
  },
  {
    title: 'Máy cưa kiếm Oshima CK-650',
    price: '1.190.000',
    oldPrice: '',
    discount: null,
    gift: false,
    ratingCount: 0
  },
  {
    title: 'Máy khoan pin Oshima KP12 TD 12V',
    price: ' ',
    oldPrice: '',
    discount: null,
    gift: false,
    ratingCount: 1
  },
  {
    title: 'Bình xịt thuốc diệt côn trùng Con ong vàng 16D (COV-16)',
    price: '920.000',
    oldPrice: '',
    discount: null,
    gift: false,
    ratingCount: 112
  }
]
</script>

<style scoped>
.product-section {
  background: white;
  padding: 0;
}

/* Sort Bar */
.sort-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  border: 1px solid var(--border-color);
  border-bottom: none;
  background: white;
}
.sort-btn {
  background: white;
  border: 1px solid #ddd;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 3px;
  transition: all 0.2s;
}
.sort-btn:hover {
  border-color: #999;
}
.sort-btn.active {
  color: #333;
  border-color: #ccc;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) inset;
  background-color: #f9f9f9;
}
.view-modes {
  margin-left: auto;
  font-size: 20px;
  color: #999;
  letter-spacing: 5px;
  cursor: pointer;
}
.view-modes span {
  cursor: pointer;
  transition: color 0.2s;
}
.view-modes span.active {
  color: #d4161c;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  border-top: 1px solid var(--border-color);
  border-left: 1px solid var(--border-color);
}

/* List Layout */
.product-grid.list-layout {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: none;
}
.product-grid.list-layout > * {
  border-left: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}
.product-grid.list-layout > *:first-child {
  border-top: 1px solid var(--border-color);
}
</style>
