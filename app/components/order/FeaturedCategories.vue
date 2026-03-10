<template>
  <section class="featured-block">
    <h3>🔥 Danh mục nổi bật</h3>
    <div class="featured-grid">
      <div v-for="item in categories" :key="item.name" class="featured-item">
        <div class="discount">{{ item.discount }}</div>
        <div class="thumb"></div>
        <p>{{ item.name }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const categories = [
  { name: 'Máy hút ẩm', discount: '-43%' },
  { name: 'Tivi', discount: '-43%' },
  { name: 'Quạt, Máy làm mát', discount: '-44%' },
  { name: 'Tủ lạnh', discount: '-44%' },
  { name: 'Máy giặt', discount: '-43%' },
  { name: 'Điều hòa', discount: '-44%' },
  { name: 'Máy lọc không khí', discount: '-43%' },
  { name: 'Máy sấy quần áo', discount: '-43%' },
  { name: 'Máy rửa chén bát', discount: '-44%' },
  { name: 'Máy hút bụi', discount: '-44%' }
]
</script>

<style scoped>
.featured-block {
  margin-top: 14px;
}

.featured-block h3 {
  font-size: 24px;
  margin-bottom: 8px;
}

.featured-grid {
  border: 1px solid #d8d8d8;
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
}

.featured-item {
  border-right: 1px solid #e1e1e1;
  background: #fff;
  min-height: 118px;
  position: relative;
  text-align: center;
  padding: 18px 6px 8px;
}

.featured-item:last-child {
  border-right: 0;
}

.discount {
  position: absolute;
  right: 4px;
  top: 4px;
  background: #e53935;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  padding: 0 4px;
}

.thumb {
  width: 56px;
  height: 56px;
  margin: 0 auto 6px;
  border-radius: 8px;
  background: linear-gradient(145deg, #f0f0f0, #dcdcdc);
}

.featured-item p {
  font-size: 13px;
  margin: 0;
}

@media (max-width: 1200px) {
  .featured-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .featured-item {
    border-bottom: 1px solid #e1e1e1;
  }

  .featured-item:nth-child(2n) {
    border-right: 0;
  }

  .featured-block h3 {
    font-size: 18px;
  }
}
</style>
