<template>
  <div class="search-dropdown" v-if="isOpen">
    <div class="modal-head">
      <p class="modal-title">Gợi ý tìm kiếm</p>
      <button class="close-btn" type="button" aria-label="Đóng tìm kiếm" @click="emit('close')">✕</button>
    </div>

    <!-- Promotion Banner inside dropdown -->
    <div class="dropdown-promo">
      <span class="promo-icon">%</span>
      <span class="promo-text">Máy lạnh Chính hãng - Giá Tốt - Lắp đặt trọn gói - Giao hàng nhanh</span>
      <span class="chevron">›</span>
    </div>

    <!-- Hot Categories -->
    <div class="hot-categories-wrapper">
      <div class="hot-title">
        <span class="fire-icon">🔥</span> Danh mục nổi bật
      </div>
      
      <div class="hot-grid">
        <div class="hot-item" v-for="(item, idx) in hotCategories" :key="idx">
          <div class="item-img-wrapper">
            <div class="item-discount" v-if="item.discount">{{ item.discount }}</div>
            <div class="item-img mock-img"></div>
          </div>
          <span class="item-name">{{ item.name }}</span>
        </div>
      </div>
      
      <div class="view-more-btn">
        Xem thêm ⌄
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['close'])

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const hotCategories = [
  { name: 'Quạt, Máy làm mát', discount: '-44%' },
  { name: 'Tivi', discount: '-43%' },
  { name: 'Điều hòa', discount: '-44%' },
  { name: 'Tủ lạnh', discount: '-44%' },
  { name: 'Máy hút ẩm', discount: '-43%' },
  { name: 'Máy giặt', discount: '-43%' },
  { name: 'Máy rửa chén bát', discount: '-44%' },
  { name: 'Máy sấy quần áo', discount: '-43%' }
]
</script>

<style scoped>
.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  max-height: calc(100vh - 108px);
  overflow-y: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1200;
  border: 1px solid #eee;
}

.modal-head {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #fff;
  border-bottom: 1px solid #efefef;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  margin: 0;
  font-size: 15px;
  color: #333;
  font-weight: 700;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 18px;
  line-height: 1;
  color: #666;
  cursor: pointer;
}

/* Promo Banner */
.dropdown-promo {
  background: #f0f8ff; /* Light blue tint matching screenshot */
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}
.promo-icon {
  background: #ff4d4f;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}
.promo-text {
  color: #333;
  flex: 1;
  font-size: 14px;
}
.chevron {
  color: #999;
  font-size: 18px;
}

/* Hot Categories */
.hot-categories-wrapper {
  padding: 15px;
}
.hot-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #333;
  margin-bottom: 15px;
}
.fire-icon {
  font-size: 18px;
}

.hot-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px 10px;
}
.hot-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
}
.hot-item:hover .item-name {
  color: var(--link-color);
}
.item-img-wrapper {
  position: relative;
  width: 50px;
  height: 50px;
  margin-bottom: 8px;
}
.item-img {
  width: 100%;
  height: 100%;
  background: #f1f1f1;
  border-radius: 4px;
}
.item-discount {
  position: absolute;
  top: -8px;
  right: -15px;
  background: #db2828;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 4px;
  border-radius: 2px;
  z-index: 2;
}
.item-name {
  font-size: 13px;
  color: #333;
  line-height: 1.3;
}

.view-more-btn {
  text-align: center;
  color: var(--link-color);
  font-size: 13px;
  margin-top: 20px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .search-dropdown {
    max-height: calc(100vh - 88px);
  }

  .hot-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 560px) {
  .hot-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
