<template>
  <div class="category-toolbar">
    <div class="product-count">{{ productCount }} Sản phẩm</div>
    <div class="sort-actions">
      <button 
        v-for="opt in sortOptions" 
        :key="opt.id"
        class="sort-btn"
        :class="{ active: currentSort === opt.id }"
        @click="selectSort(opt.id)"
      >
        {{ opt.label }}
      </button>
      
      <!-- Special highlighted sort option -->
      <button class="sort-btn highlight" :class="{ active: currentSort === 'meta' }" @click="selectSort('meta')">
        <span class="meta-icon">👍</span> META gợi ý
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps({
  productCount: { type: Number, default: 0 }
})

const emit = defineEmits(['sort-changed'])
const currentSort = ref('best_selling')

const sortOptions = [
  { id: 'best_selling', label: 'Bán chạy nhất' },
  { id: 'price_asc', label: 'Giá tăng dần' },
  { id: 'price_desc', label: 'Giá giảm dần' },
  { id: 'discount', label: 'Giảm giá' },
  { id: 'newest', label: 'Mới nhất' },
  { id: 'installment', label: 'Trả góp' }
]

const selectSort = (id: string) => {
  currentSort.value = id
  emit('sort-changed', id)
}
</script>

<style scoped>
.category-toolbar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.product-count {
  font-weight: 700;
  font-size: 14px;
  color: #333;
}

.sort-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.sort-btn {
  background: #fff;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-btn:hover {
  border-color: #1a73e8;
  color: #1a73e8;
}

.sort-btn.active {
  border-color: #1a73e8;
  color: #1a73e8;
  font-weight: 500;
  box-shadow: inset 0 0 0 1px #1a73e8;
}

.sort-btn.highlight {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #e31b1b;
  border-color: #eee;
}

.sort-btn.highlight:hover, .sort-btn.highlight.active {
  border-color: #e31b1b;
  box-shadow: inset 0 0 0 1px #e31b1b;
}

@media (max-width: 768px) {
  .sort-actions {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 5px;
  }
  .sort-btn {
    white-space: nowrap;
  }
}
</style>
