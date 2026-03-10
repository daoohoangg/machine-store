<template>
  <section class="suggest-section">
    <div class="section-head">
      <h3>💡 Gợi ý cho bạn</h3>
    </div>

    <div class="product-grid">
      <article v-for="item in products" :key="item.title" class="card">
        <div class="badge" v-if="item.discount">{{ item.discount }}</div>
        <div class="thumb"></div>
        <p class="title">{{ item.title }}</p>
        <p class="price">{{ item.price }}</p>
        <div class="sold-bar">
          <span :style="{ width: item.soldPercent + '%' }"></span>
          <small>Đã bán {{ item.sold }}</small>
        </div>
      </article>
    </div>

    <div class="more-link">Xem thêm sản phẩm ▼</div>
  </section>
</template>

<script setup lang="ts">
const products = [
  { title: 'Máy hút ẩm và lọc không khí', price: '6.750.000 đ', sold: 113, soldPercent: 62, discount: '-32%' },
  { title: 'Máy hút ẩm kết hợp lọc không khí', price: '7.790.000 đ', sold: 185, soldPercent: 70, discount: '-18%' },
  { title: 'Smart Tivi Coocaa 43 inch', price: '4.190.000 đ', sold: 678, soldPercent: 88, discount: '-28%' },
  { title: 'Smart tivi HD Coocaa 32', price: '2.990.000 đ', sold: 701, soldPercent: 90, discount: '-23%' },
  { title: 'Quạt hút gió âm tường', price: '339.000 đ', sold: 516, soldPercent: 83, discount: '-15%' },
  { title: 'Quạt đứng Panasonic F-409K', price: '2.790.000 đ', sold: 946, soldPercent: 92, discount: '-24%' },
  { title: 'Tủ lạnh Funiki FR-135CD.1', price: '3.490.000 đ', sold: 2240, soldPercent: 96, discount: '-13%' },
  { title: 'Tủ lạnh Toshiba Inverter 180 lít', price: '4.890.000 đ', sold: 104, soldPercent: 55, discount: '-14%' },
  { title: 'Máy giặt Toshiba Inverter 10kg', price: '5.890.000 đ', sold: 193, soldPercent: 68, discount: '-25%' },
  { title: 'Máy giặt Toshiba Inverter 9.5kg', price: '6.990.000 đ', sold: 85, soldPercent: 48, discount: '-29%' },
  { title: 'Điều hòa 2 chiều Daikin', price: '12.590.000 đ', sold: 24, soldPercent: 22, discount: '-26%' },
  { title: 'Aptomat 2P lắp nổi', price: '85.000 đ', sold: 2, soldPercent: 9, discount: '-5K' }
]
</script>

<style scoped>
.suggest-section {
  margin-top: 12px;
}

.section-head {
  border: 1px solid #d9d9d9;
  border-bottom: none;
  background: #fff;
  padding: 10px 12px;
}

.section-head h3 {
  margin: 0;
  font-size: 34px;
}

.product-grid {
  border: 1px solid #d9d9d9;
  background: #fff;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  padding: 10px;
}

.card {
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  padding: 8px;
  position: relative;
}

.badge {
  position: absolute;
  right: 6px;
  top: 6px;
  background: #ff9800;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 20px;
}

.thumb {
  height: 120px;
  border-radius: 6px;
  background: linear-gradient(145deg, #f3f3f3, #dcdcdc);
  margin-bottom: 8px;
}

.title {
  margin: 0 0 8px;
  min-height: 38px;
  font-size: 13px;
}

.price {
  margin: 0 0 8px;
  color: #d91c1c;
  font-size: 18px;
  font-weight: 700;
}

.sold-bar {
  position: relative;
  height: 16px;
  background: #e2e2e2;
  border-radius: 20px;
  overflow: hidden;
}

.sold-bar span {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: #ff9800;
}

.sold-bar small {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 11px;
}

.more-link {
  text-align: center;
  padding: 10px;
  color: #333;
  font-size: 15px;
}

@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .section-head h3 {
    font-size: 20px;
  }
}
</style>
