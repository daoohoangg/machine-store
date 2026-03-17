<template>
  <div class="homepage-page">
    <div class="container">
      <div class="breadcrumb">
        <NuxtLink to="/">Trang chủ</NuxtLink> 
        <span class="separator">›</span> 
        <span class="current">{{ currentCategory || 'Danh mục sản phẩm' }}</span>
      </div>
      
      <div class="category-layout">
        <!-- Sidebar -->
        <div class="sidebar-col">
          <CategorySidebar
            :category-id="Number(categoryId)"
            :category-name="currentCategory"
            :sub-categories="subCategories"
            :available-products="allCategoryProducts"
            @filter-changed="onFilterChanged"
          />
        </div>

        <!-- Main Content -->
        <div class="main-col">
          <ClientOnly>
            <!-- Subcategory Image Grid -->
            <div class="subcat-image-grid" v-if="subCategories.length > 0">
              <NuxtLink 
                v-for="sub in subCategories" 
                :key="sub.id"
                :to="`/homepage?categoryId=${sub.id}&categoryName=${encodeURIComponent(sub.name)}`"
                class="subcat-box"
              >
                <div class="subcat-img">
                  <img v-if="sub.image" :src="sub.image" :alt="sub.name" />
                </div>
                <span class="subcat-name">{{ sub.name }}</span>
              </NuxtLink>
            </div>
            
            <div class="top-filters">
              <CategoryBrandFilter 
                :available-products="allCategoryProducts"
                @brand-toggled="onTopBrandToggled"
              />
              
              <CategoryToolbar 
                :product-count="processedProducts.length"
                @sort-changed="onSortChanged"
              />
            </div>
            
            <div v-if="processedProducts.length > 0" class="products-grid">
              <ProductCard
                v-for="product in processedProducts"
                :key="product.id"
                :product="product"
              />
            </div>

            <div v-else class="empty-state">
              <p>Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.</p>
            </div>
          </ClientOnly>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHomeProducts } from '~/composables/useHomeProducts'
import { useCategories, type Category } from '~/composables/useCategories'
import ProductCard from '~/components/product/ProductCard.vue'
import CategorySidebar from '~/components/category/CategorySidebar.vue'
import CategoryToolbar from '~/components/category/CategoryToolbar.vue'
import CategoryBrandFilter from '~/components/category/CategoryBrandFilter.vue'
import { useImageGuard } from '~/composables/useImageGuard'

const route = useRoute()
const { categories, fetchCategories } = useCategories()

const categoryId = computed(() => route.query.categoryId as string)
const currentCategory = computed(() => {
  const name = route.query.categoryName as string
  return name || 'Danh mục sản phẩm'
})

// Pass categoryId as a getter to useHomeProducts so it's reactive to URL changes
const { products, pending } = useHomeProducts(() => categoryId.value)
const { isImageFailed } = useImageGuard()

const subCategories = computed<Category[]>(() => {
  if (!categories.value.length) return []
  
  const cid = Number(categoryId.value)
  if (!cid) return categories.value // return root categories if no category selected
  
  // Recursively search for the active category to find its children
  let selectedCat = null
  const findCat = (list: Category[]) => {
    for (const c of list) {
      if (c.id === cid) {
        selectedCat = c
        return true
      }
      if (c.children && findCat(c.children)) return true
    }
    return false
  }
  
  findCat(categories.value)
  return selectedCat?.children || []
})

// Get all products that belong to this category OR any of its subcategories
const allCategoryProducts = computed(() => {
  if (!products.value) return []
  
  const cid = Number(categoryId.value)
  if (!cid) return products.value.filter(p => !isImageFailed(p.image)) // if no ID, return all

  const allIds = new Set<number>()
  allIds.add(cid)
  const addChildren = (list: Category[]) => {
    list.forEach(c => {
      allIds.add(c.id)
      if (c.children) addChildren(c.children)
    })
  }
  addChildren(subCategories.value)
  
  return products.value.filter(p => !isImageFailed(p.image) && p.categoryId && allIds.has(Number(p.categoryId)))
})

// Filtering & Sorting State
const selectedBrands = ref<string[]>([])
const selectedPrices = ref<string[]>([])
const currentSort = ref<string>('best_selling')

const onFilterChanged = (filters: { brands: string[], prices: string[] }) => {
  selectedBrands.value = filters.brands
  selectedPrices.value = filters.prices
}

const onTopBrandToggled = (brands: string[]) => {
  selectedBrands.value = brands
}

const onSortChanged = (sortId: string) => {
  currentSort.value = sortId
}

// Helper to check if a product matches price ranges
const matchesPrice = (price: number, ranges: string[]) => {
  if (ranges.length === 0) return true
  
  for (const range of ranges) {
    if (range === 'under_100k' && price < 100000) return true
    if (range === '100k_500k' && price >= 100000 && price <= 500000) return true
    if (range === '500k_1m' && price > 500000 && price <= 1000000) return true
    if (range === '1m_1.5m' && price > 1000000 && price <= 1500000) return true
    if (range === '1.5m_2m' && price > 1500000 && price <= 2000000) return true
    if (range === '2m_3m' && price > 2000000 && price <= 3000000) return true
    if (range === '3m_5m' && price > 3000000 && price <= 5000000) return true
    if (range === '5m_8m' && price > 5000000 && price <= 8000000) return true
    if (range === '8m_10m' && price > 8000000 && price <= 10000000) return true
    if (range === 'over_10m' && price > 10000000) return true
  }
  return false
}

const extractBrand = (p: any): string => {
  if (p.brand) return p.brand.toUpperCase()
  if (p.title) {
    const firstWord = p.title.split(' ')[0]
    if (firstWord.length > 2 && firstWord.length < 12) return firstWord.toUpperCase()
  }
  return ''
}

const processedProducts = computed(() => {
  let list = [...allCategoryProducts.value]
  
  // Apply brand filters
  if (selectedBrands.value.length > 0) {
    list = list.filter(p => {
      const b = extractBrand(p)
      return selectedBrands.value.includes(b)
    })
  }
  
  // Apply price filters
  if (selectedPrices.value.length > 0) {
    list = list.filter(p => matchesPrice(p.price, selectedPrices.value))
  }
  
  // Apply sorting
  switch (currentSort.value) {
    case 'price_asc':
      list.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      list.sort((a, b) => b.price - a.price)
      break
    case 'discount':
      list.sort((a, b) => {
        const getDiscount = (p:any) => {
          if (p.oldPrice && p.oldPrice > p.price) return p.oldPrice - p.price
          if (p.discount) {
            const num = Number(p.discount.replace(/[^\d]/g, ''))
            return Number.isNaN(num) ? 0 : num
          }
          return 0
        }
        return getDiscount(b) - getDiscount(a)
      })
      break
    case 'newest':
      list.sort((a, b) => {
        const ida = typeof a.id === 'number' ? a.id : Number(String(a.id).replace(/\D/g, ''))
        const idb = typeof b.id === 'number' ? b.id : Number(String(b.id).replace(/\D/g, ''))
        return idb - ida
      })
      break
    case 'meta':
    case 'installment':
    case 'best_selling':
    default:
      // Sort by sold count
      list.sort((a, b) => (b.sold || 0) - (a.sold || 0))
      break
  }
  
  return list
})

if (categories.value.length === 0) {
  fetchCategories()
}

useSeoMeta({
  title: () => `${currentCategory.value} | Tuấn Minh`,
  description: () => `Danh sách các sản phẩm thuộc nhóm ${currentCategory.value} chính hãng tại Tuấn Minh.`,
})
</script>

<style scoped>
.homepage-page {
  min-height: 100vh;
  background: #f7f7f7;
  padding-bottom: 40px;
}

.breadcrumb {
  padding: 15px 0;
  font-size: 14px;
}

.breadcrumb a {
  color: #1a73e8;
  text-decoration: none;
}

.breadcrumb .separator {
  margin: 0 8px;
  color: #666;
}

.breadcrumb .current {
  color: #333;
}

.category-layout {
  display: flex;
  gap: 20px;
}

.sidebar-col {
  width: 250px;
  flex-shrink: 0;
}

.main-col {
  flex: 1;
  min-width: 0;
}

.subcat-image-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  background: #fff;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.subcat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  text-decoration: none;
  color: #333;
}

.subcat-box:hover .subcat-img {
  border-color: #1a73e8;
}

.subcat-img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  overflow: hidden;
  transition: all 0.2s;
  background: #fff;
}

.subcat-img img {
  width: 80%;
  height: 80%;
  object-fit: contain;
}

.subcat-name {
  font-size: 13px;
  line-height: 1.3;
}

.top-filters {
  background: #fff;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  margin-bottom: 20px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  background: #fff;
  border-radius: 8px;
  color: #666;
  border: 1px solid #eee;
}

@media (max-width: 1200px) {
  .subcat-image-grid { grid-template-columns: repeat(4, 1fr); }
  .products-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 992px) {
  .category-layout {
    flex-direction: column;
  }
  .sidebar-col {
    width: 100%;
  }
  .products-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .subcat-image-grid { grid-template-columns: repeat(3, 1fr); }
  .products-grid { grid-template-columns: repeat(2, 1fr); }
  .breadcrumb { padding: 10px 15px; }
}
</style>
