<template>
  <div class="homepage-page">
    <div class="category-header">
      <h1>{{ currentCategory || 'Danh mục sản phẩm' }}</h1>
    </div>

    <ClientOnly>
      <!-- Render Subcategories Sequentially if they exist -->
      <template v-if="subCategories.length > 0">
        <template v-for="sub in subCategories" :key="sub.id">
          <div class="subcategory-block">
            <div class="category-subheader container">
              <NuxtLink :to="`/homepage?categoryId=${sub.id}&categoryName=${encodeURIComponent(sub.name)}`">
                <h2>{{ sub.name }} <i class="fa-solid fa-chevron-right" style="font-size: 14px; margin-left: 5px;"></i></h2>
              </NuxtLink>
            </div>
            
            <div class="products-grid container" v-if="getProductsForCategory(sub).length > 0">
              <ProductCard
                v-for="product in getProductsForCategory(sub)"
                :key="product.id"
                :product="product"
              />
            </div>
            <div v-else class="empty-sub container">
              <p>Không có sản phẩm nào trong danh mục này.</p>
            </div>
          </div>
        </template>
      </template>

      <!-- Fallback to Flat Grid if no subcategories exist -->
      <template v-else>
        <div v-if="filteredProducts.length > 0" class="products-grid container">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
          />
        </div>

        <div v-else class="empty-state container">
          <p>Không tìm thấy sản phẩm nào trong danh mục này.</p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHomeProducts } from '~/composables/useHomeProducts'
import { useCategories, type Category } from '~/composables/useCategories'
import ProductCard from '~/components/product/ProductCard.vue'

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

const filteredProducts = computed(() => {
  return products.value.filter(p => !isImageFailed(p.image))
})

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

const getProductsForCategory = (cat: Category) => {
  const ids: number[] = [cat.id]
  const gather = (c: Category) => {
    if (c.children) {
      c.children.forEach(child => {
        ids.push(child.id)
        gather(child)
      })
    }
  }
  gather(cat)
  
  return filteredProducts.value.filter(p => p.categoryId && ids.includes(Number(p.categoryId)))
}

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

.category-header {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  text-align: center;
}

.category-header h1 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.subcategory-block {
  margin-bottom: 40px;
}

.category-subheader {
  margin-bottom: 20px;
  padding: 0 15px;
}

.category-subheader a {
  text-decoration: none;
  color: #333;
  display: inline-block;
}

.category-subheader h2 {
  font-size: 22px;
  margin: 0;
  display: flex;
  align-items: center;
  font-weight: 700;
  text-transform: uppercase;
  color: #de2000;
}

.category-subheader a:hover h2 {
  color: #ff3300;
}

.empty-sub {
  padding: 20px 15px;
  color: #888;
  font-style: italic;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  padding: 0 15px;
}

.empty-state {
  text-align: center;
  padding: 50px 20px;
  background: #fff;
  border-radius: 8px;
  color: #666;
}

@media (max-width: 1200px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 992px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
