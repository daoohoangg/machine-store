<template>
  <div class="section">
    <div class="section-header">
      <h3>Oshima <span>(243 sản phẩm)</span></h3>
    </div>
    <div class="category-grid">
      <div class="cat-item" v-for="n in 10" :key="n">
        <div class="cat-img"></div>
        <span class="cat-name">{{ categoryNames[n-1] || 'Danh mục' }}</span>
      </div>
    </div>
    <div class="view-more-cats">Xem thêm chuyên mục ⌄</div>
  </div>
</template>

<script setup>
const categoryNames = [
  'Máy nông nghiệp', 'Máy cưa, Máy cắt gỗ', 'Máy nén khí', 'Máy rửa xe', 'Máy hàn nhiệt', 
  'Máy bơm nước', 'Máy khoan', 'Thiết bị nâng hạ', 'Máy thổi bụi', 'Máy cân mực Laser'
]
</script>

<style scoped>
/* Sections */
.section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid var(--border-color);
}
.section-header h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
}
.section-header h3 span {
  font-weight: normal;
  color: #999;
  font-size: 14px;
}

/* Category Grid */
.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  border: 1px solid var(--border-color);
  border-width: 1px 0 0 1px;
}
.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px 10px;
  border: 1px solid var(--border-color);
  border-width: 0 1px 1px 0;
  text-align: center;
  cursor: pointer;
}
.cat-item:hover {
  box-shadow: 0 0 5px rgba(0,0,0,0.1);
  position: relative;
  z-index: 1;
}
.cat-img {
  width: 60px;
  height: 60px;
  background-color: #f1f1f1;
  margin-bottom: 10px;
  border-radius: 5px;
}
.cat-name {
  font-size: 12px;
  color: #333;
}
.view-more-cats {
  text-align: center;
  margin-top: 15px;
  font-size: 13px;
  color: var(--link-color);
  cursor: pointer;
}
</style>
