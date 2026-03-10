<template>
  <section class="flash-sale">
    <div class="flash-head">
      <h3>⚡ FLASH SALE</h3>
      <a href="#">Xem tất cả ❯</a>
    </div>

    <div class="flash-grid">
      <article v-for="item in items" :key="item.title" class="flash-card">
        <div class="thumb"></div>
        <p class="title">{{ item.title }}</p>
        <p class="brand">{{ item.brand }}</p>
        <div class="price-row">
          <strong>{{ item.price }}</strong>
          <small>{{ item.oldPrice }}</small>
        </div>
        <div class="countdown">Kết thúc sau {{ item.endIn }}</div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
const items = [
  { title: 'Máy phun xịt rửa áp lực cao', brand: 'Bosch', price: '1.990.000đ', oldPrice: '2.190.000đ', endIn: '21 ngày' },
  { title: 'Máy rửa xe Bosch Easy AQT', brand: 'Bosch', price: '1.790.000đ', oldPrice: '2.160.000đ', endIn: '21 ngày' },
  { title: 'Máy phun xịt rửa áp lực', brand: 'Bosch', price: '1.599.000đ', oldPrice: '1.990.000đ', endIn: '21 ngày' },
  { title: 'Tủ lạnh ô tô Alpicool Sword', brand: 'Alpicool Việt Nam', price: '3.790.000 đ', oldPrice: '', endIn: '14 ngày' },
  { title: 'Tủ lạnh mini Alpicool G22', brand: 'Alpicool Việt Nam', price: '3.990.000đ', oldPrice: '4.460.000đ', endIn: '25 ngày' },
  { title: 'Máy hút ẩm Glucklich Pro', brand: 'Glucklich', price: '4.590.000đ', oldPrice: '4.990.000đ', endIn: '18 ngày' }
]
</script>

<style scoped>
.flash-sale {
  margin-top: 8px;
  border: 1px solid #4f8edb;
  background: #4f8edb;
}

.flash-head {
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
}

.flash-head h3 {
  margin: 0;
  font-size: 18px;
}

.flash-head a {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}

.flash-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  padding: 0 10px 10px;
}

.flash-card {
  background: #fff;
  border-radius: 6px;
  padding: 8px;
}

.thumb {
  height: 110px;
  background: linear-gradient(145deg, #f1f1f1, #dedede);
  border-radius: 6px;
  margin-bottom: 8px;
}

.title {
  margin: 0;
  min-height: 34px;
  font-size: 13px;
}

.brand {
  margin: 6px 0;
  color: #0a67c7;
  font-size: 13px;
}

.price-row strong {
  color: #d91c1c;
  display: block;
}

.price-row small {
  color: #999;
  text-decoration: line-through;
}

.countdown {
  margin-top: 8px;
  background: #d71920;
  color: #fff;
  text-align: center;
  border-radius: 3px;
  font-size: 12px;
  padding: 4px;
}

@media (max-width: 1200px) {
  .flash-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
