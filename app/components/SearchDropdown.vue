<template>
  <div class="search-dropdown" v-if="isOpen" @click.stop>
    <div class="modal-head">
      <p class="modal-title">Gợi ý tìm kiếm</p>
      <button class="close-btn" type="button" aria-label="Đóng tìm kiếm" @click="emit('close')">✕</button>
    </div>

    <div class="dropdown-scroll-content">
      <!-- Default View -->
      <template v-if="!searchQuery">
        <!-- Recent Searches -->
      <div v-if="recentSearches && recentSearches.length > 0" class="recent-searches-wrapper">
        <div class="recent-title">
          <i class="fa-solid fa-clock-rotate-left"></i> Lịch sử tìm kiếm
        </div>
        <div class="recent-list">
          <div 
            v-for="(item, idx) in recentSearches" 
            :key="idx" 
            class="recent-item" 
            @click="emit('select-recent', item)"
          >
            {{ item }}
          </div>
        </div>
      </div>


      <!-- Hot Categories -->
      <div class="hot-categories-wrapper">
        <div class="hot-title">
          <span class="fire-icon">🔥</span> Danh mục nổi bật
        </div>
        
        <div class="hot-grid">
          <NuxtLink 
            class="hot-item" 
            v-for="(item, idx) in quickDeals" 
            :key="item.categoryId || idx"
            :to="`/homepage?categoryId=${item.categoryId}&categoryName=${encodeURIComponent(item.name)}`"
            @click="emit('close')"
          >
            <div class="item-img-wrapper" :style="{ backgroundColor: !item.imageUrl ? item.color : 'transparent' }">
              <div class="item-discount" v-if="item.hasPrice">HOT</div>
              <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="item-img" />
              <div v-else class="item-img mock-img"></div>
            </div>
            <span class="item-name">{{ item.name }}</span>
          </NuxtLink>
        </div>
        
        <NuxtLink to="/so-do-website" class="view-more-btn" @click="emit('close')">
          Xem thêm ⌄
        </NuxtLink>
      </div>
    </template>

    <!-- Search Results View -->
    <template v-else>
      <div class="search-results-wrapper">
        <div class="results-title">Kết quả tìm kiếm cho "{{ searchQuery }}"</div>
        
        <div v-if="searchResults.length === 0 && matchedCategories.length === 0" class="no-results">
          Không tìm thấy sản phẩm hoặc danh mục nào phù hợp.
        </div>
        
        <div v-else class="results-list">
          <!-- Categories match -->
          <NuxtLink 
            v-for="item in matchedCategories" 
            :key="'cat-' + item.id" 
            :to="`/homepage?categoryId=${item.id}&categoryName=${encodeURIComponent(item.name)}`"
            class="result-item cat-result"
            @click="emit('close')"
          >
            <div class="result-icon-wrapper">
              <i class="fa-solid fa-folder"></i>
            </div>
            <div class="result-info">
              <div class="result-name">Danh mục: <strong>{{ item.name }}</strong></div>
            </div>
          </NuxtLink>

          <!-- Product match -->
          <NuxtLink 
            v-for="item in searchResults" 
            :key="'prod-' + item.id" 
            :to="`/san-pham/${item.slug}`"
            class="result-item"
            @click="emit('close')"
          >
            <div class="result-img-wrapper">
              <img v-if="item.image" :src="item.image" :alt="item.title" class="result-img" />
              <div v-else class="result-img mock-img"></div>
            </div>
            <div class="result-info">
              <div class="result-name">{{ item.title }}</div>
              <div class="result-prices">
                <span class="result-price">{{ formatPrice(item.price) }}</span>
                <span v-if="item.oldPrice && item.oldPrice > item.price" class="result-old-price">{{ formatPrice(item.oldPrice) }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

const emit = defineEmits(['close', 'select-recent'])

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  },
  recentSearches: {
    type: Array,
    default: () => []
  }
})

// Get products to find lowest prices
const { products } = useHomeProducts()
// Get categories
const { categories: apiCategories, fetchCategories } = useCategories()

onMounted(() => {
  if (!apiCategories.value || apiCategories.value.length === 0) {
    fetchCategories()
  }
})

const formatPrice = (price: number) => {
  if (!price || price <= 0) return 'Giá tốt'
  return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ`
}

const bgColorByName = (name: string) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = ['#6B21A8', '#1E40AF', '#2563EB', '#0EA5E9', '#2DD4BF', '#F97316', '#FBBF24', '#B45309']
  return colors[hash % colors.length]
}

const normalizeCategoryName = (value: string | null | undefined) => {
  return (value || '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const quickDeals = computed(() => {
  // Map categoryId to lowest price
  const categoryPriceMap = new Map<number, number>()
  
  if (products.value && Array.isArray(products.value)) {
    products.value.forEach((item: any) => {
      if (item.categoryId && item.price > 0) {
        const cid = Number(item.categoryId)
        const currentMin = categoryPriceMap.get(cid) || Infinity
        if (item.price < currentMin) {
          categoryPriceMap.set(cid, item.price)
        }
      }
    })
  }

  const list: any[] = []
  if (apiCategories.value && Array.isArray(apiCategories.value)) {
    apiCategories.value.forEach((parent: any) => {
      if (parent.children && parent.children.length > 0) {
        parent.children.forEach((child: any) => {
          const name = normalizeCategoryName(child.name)
          const minPrice = categoryPriceMap.get(child.id)
          
          list.push({
            categoryId: child.id,
            imageUrl: child.image,
            name: name,
            price: minPrice ? formatPrice(minPrice) : 'Giá cực tốt',
            color: bgColorByName(child.name),
            hasPrice: !!minPrice
          })
        })
      }
    })
  }

  // Sort: show categories that have found prices first
  return list
    .sort((a, b) => (b.hasPrice ? 1 : 0) - (a.hasPrice ? 1 : 0))
    .slice(0, 10)
})

const searchResults = computed(() => {
  if (!props.searchQuery || !props.searchQuery.trim() || !products.value) return []
  
  const query = props.searchQuery.toLowerCase().trim()
  return products.value.filter((item: any) => {
    const nameMatch = item.title && item.title.toLowerCase().includes(query)
    const codeMatch = item.productCode && item.productCode.toLowerCase().includes(query)
    return nameMatch || codeMatch
  }).slice(0, 8)
})

const matchedCategories = computed(() => {
  if (!props.searchQuery || !props.searchQuery.trim() || !apiCategories.value) return []

  const query = props.searchQuery.toLowerCase().trim()
  const matched = []

  apiCategories.value.forEach((parent: any) => {
    if (parent.name && parent.name.toLowerCase().includes(query)) {
      matched.push(parent)
    }
    if (parent.children && parent.children.length > 0) {
      parent.children.forEach((child: any) => {
        if (child.name && child.name.toLowerCase().includes(query)) {
          matched.push(child)
        }
      })
    }
  })

  // Deduplicate by ID and slice
  const unique = Array.from(new Map(matched.map(item => [item.id, item])).values())
  return unique.slice(0, 3) // Show up to 3 matched categories
})
</script>

<style scoped>
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  max-height: calc(100vh - 108px);
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1200;
  border: 1px solid #eee;
  display: flex;
  flex-direction: column;
}

.dropdown-scroll-content {
  overflow-y: auto;
  flex: 1;
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

/* Recent Searches */
.recent-searches-wrapper {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
}
.recent-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.recent-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.recent-item {
  background: #f5f5f5;
  color: #333;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}
.recent-item:hover {
  background: #e0e0e0;
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
  background: transparent;
  border-radius: 4px;
  object-fit: contain;
}
.mock-img {
  background: #f1f1f1;
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
  display: block;
  text-align: center;
  color: var(--link-color);
  font-size: 13px;
  margin-top: 20px;
  cursor: pointer;
  text-decoration: none;
}
.view-more-btn:hover {
  text-decoration: underline;
}

/* Search Results View */
.search-results-wrapper {
  padding: 15px;
}
.results-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  font-style: italic;
}
.no-results {
  text-align: center;
  padding: 30px 0;
  color: #999;
  font-size: 14px;
}
.results-list {
  display: flex;
  flex-direction: column;
}
.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-bottom: 1px solid #f5f5f5;
  text-decoration: none;
  transition: background-color 0.2s;
  border-radius: 4px;
}
.result-item:last-child {
  border-bottom: none;
}
.result-item:hover {
  background-color: #f9f9f9;
}
.result-img-wrapper {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #eee;
}
.result-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: transparent;
}
.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.result-name {
  font-size: 14px;
  color: #333;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.result-prices {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.result-price {
  font-size: 15px;
  font-weight: 700;
  color: #e31b1b;
}
.result-old-price {
  font-size: 12px;
  color: #999;
  text-decoration: line-through;
}

/* Category Result Specific */
.cat-result {
  background-color: #f7f9fc;
}
.result-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 18px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .search-dropdown {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 90vw !important;
    height: auto;
    max-height: 80vh !important;
    border-radius: 12px !important;
    z-index: 9999 !important;
    border: none !important;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important;
    animation: none !important;
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
