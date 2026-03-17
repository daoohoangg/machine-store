<template>
  <aside class="category-sidebar">
    <!-- Subcategories Block -->
    <div class="filter-block" v-if="subCategories.length > 0">
      <h3 class="filter-title">{{ categoryName.toUpperCase() }}</h3>
      <ul class="subcat-list">
        <li v-for="sub in subCategories" :key="sub.id" :class="{ active: sub.id === categoryId }">
          <NuxtLink :to="`/homepage?categoryId=${sub.id}&categoryName=${encodeURIComponent(sub.name)}`">
            <span class="subcat-icon">▶</span> {{ sub.name }}
          </NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Brands Filter Block -->
    <div class="filter-block" v-if="brands.length > 0">
      <h3 class="filter-title">THƯƠNG HIỆU</h3>
      <div class="filter-content">
        <div class="checkbox-list">
          <label v-for="brand in displayBrands" :key="brand.name" class="checkbox-item">
            <input 
              type="checkbox" 
              :value="brand.name" 
              v-model="selectedBrands"
              @change="emitFilters"
            />
            <span class="checkmark"></span>
            <span class="label-text">{{ brand.name }} ({{ brand.count }})</span>
          </label>
        </div>
        <button v-if="brands.length > 5" class="view-more-btn" @click="expandBrands = !expandBrands">
          {{ expandBrands ? 'Thu gọn ▴' : 'Xem thêm ▾' }}
        </button>
      </div>
    </div>

    <!-- Price Range Filter Block -->
    <div class="filter-block">
      <h3 class="filter-title">KHOẢNG GIÁ (VNĐ)</h3>
      <div class="filter-content">
        <div class="checkbox-list">
          <label v-for="range in priceRanges" :key="range.id" class="checkbox-item">
            <input 
              type="checkbox" 
              :value="range.id" 
              v-model="selectedPriceRanges"
              @change="emitFilters"
            />
            <span class="checkmark"></span>
            <span class="label-text">{{ range.label }}</span>
          </label>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps({
  categoryId: { type: Number, required: true },
  categoryName: { type: String, default: 'DANH MỤC' },
  subCategories: { type: Array, default: () => [] },
  availableProducts: { type: Array, default: () => [] }
})

const emit = defineEmits(['filter-changed'])

const selectedBrands = ref<string[]>([])
const selectedPriceRanges = ref<string[]>([])
const expandBrands = ref(false)

// Reset filters when category changes
watch(() => props.categoryId, () => {
  selectedBrands.value = []
  selectedPriceRanges.value = []
  emitFilters()
})

const emitFilters = () => {
  emit('filter-changed', {
    brands: selectedBrands.value,
    prices: selectedPriceRanges.value
  })
}

const brands = computed(() => {
  if (!props.availableProducts) return []
  const brandCounts = new Map<string, number>()
  
  // Extract brands from available products in this category
  props.availableProducts.forEach((p: any) => {
    let brandName = p.brand
    if (!brandName && p.title) {
      // Fallback: use first word as brand if brand is missing
      const firstWord = p.title.split(' ')[0]
      if (firstWord.length > 2 && firstWord.length < 12) {
        brandName = firstWord.toUpperCase()
      }
    }
    
    if (brandName) {
      brandName = brandName.toUpperCase()
      brandCounts.set(brandName, (brandCounts.get(brandName) || 0) + 1)
    }
  })
  
  return Array.from(brandCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const displayBrands = computed(() => {
  return expandBrands.value ? brands.value : brands.value.slice(0, 5)
})

const priceRanges = [
  { id: 'under_100k', label: 'Dưới 100K' },
  { id: '100k_500k', label: '200K - 500K' },
  { id: '500k_1m', label: '500K - 1 triệu' },
  { id: '1m_1.5m', label: '1 triệu - 1,5 triệu' },
  { id: '1.5m_2m', label: '1,5 triệu - 2 triệu' },
  { id: '2m_3m', label: '2 triệu - 3 triệu' },
  { id: '3m_5m', label: '3 triệu - 5 triệu' },
  { id: '5m_8m', label: '5 triệu - 8 triệu' },
  { id: '8m_10m', label: '8 triệu - 10 triệu' },
  { id: 'over_10m', label: '10 triệu - 15 triệu' }
]
</script>

<style scoped>
.category-sidebar {
  width: 100%;
}

.filter-block {
  background: #fff;
  border: 1px solid #eee;
  margin-bottom: 20px;
}

.filter-title {
  font-size: 15px;
  font-weight: 700;
  text-align: center;
  padding: 12px;
  margin: 0;
  border-bottom: 1px solid #eee;
  color: #333;
}

.subcat-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.subcat-list li {
  border-bottom: 1px solid #f5f5f5;
}

.subcat-list li:last-child {
  border-bottom: none;
}

.subcat-list a {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  color: #444;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
}

.subcat-list a:hover {
  color: #1a73e8;
  background: #f8fafd;
}

.subcat-icon {
  font-size: 10px;
  color: #888;
  margin-right: 10px;
}

.subcat-list .active a {
  font-weight: 700;
  color: #1a73e8;
  background: #f4f8ff;
}

.filter-content {
  padding: 15px;
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  font-size: 14px;
  color: #555;
  user-select: none;
}

.checkbox-item input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: relative;
  height: 16px;
  width: 16px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-right: 10px;
  flex-shrink: 0;
}

.checkbox-item:hover input ~ .checkmark {
  border-color: #1a73e8;
}

.checkbox-item input:checked ~ .checkmark {
  background-color: #1a73e8;
  border-color: #1a73e8;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-item input:checked ~ .checkmark:after {
  display: block;
}

.label-text {
  flex: 1;
}

.view-more-btn {
  background: none;
  border: none;
  color: #1a73e8;
  font-size: 13px;
  padding: 10px 0 0;
  width: 100%;
  cursor: pointer;
  text-align: center;
}

.view-more-btn:hover {
  text-decoration: underline;
}
</style>
