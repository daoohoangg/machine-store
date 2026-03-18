<template>
  <section class="category-block" v-if="category">
    <div class="cb-header">
      <h2 class="cb-title">{{ category.name }}</h2>
      <NuxtLink :to="`/homepage?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`" class="cb-view-all">Xem tất cả ></NuxtLink>
    </div>

    <div class="cb-subcats" v-if="category.children && category.children.length > 0">
      <NuxtLink 
        v-for="sub in category.children" 
        :key="sub.id"
        :to="`/homepage?categoryId=${sub.id}&categoryName=${encodeURIComponent(sub.name)}`"
        class="cb-subcat-item"
      >
        <div class="subcat-img-wrap">
          <img v-if="sub.image" :src="sub.image" :alt="sub.name" />
          <div v-else class="subcat-placeholder"></div>
        </div>
        <span class="subcat-name">{{ sub.name }}</span>
      </NuxtLink>
    </div>

    <!-- Outstanding products header -->
    <div class="cb-product-header">
      <h3 class="cb-subtitle">{{ category.name }} nổi bật</h3>
      <NuxtLink :to="`/homepage?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`" class="cb-product-view-all">Xem tất cả sản phẩm</NuxtLink>
    </div>

    <div class="cb-products" v-if="categoryProducts.length > 0">
      <ProductCard
        v-for="product in categoryProducts"
        :key="product.id"
        :product="product"
      />
    </div>
    <div v-else class="cb-empty">
      Chưa có sản phẩm nổi bật
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProductCard from '~/components/product/ProductCard.vue'

const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  allProducts: {
    type: Array,
    default: () => []
  }
})

const { isImageFailed } = useImageGuard()

const categoryProducts = computed(() => {
  if (!props.category || !props.allProducts.length) return []
  
  const ids: number[] = [props.category.id]
  const gather = (c: any) => {
    if (c.children) {
      c.children.forEach((child: any) => {
        ids.push(child.id)
        gather(child)
      })
    }
  }
  gather(props.category)
  
  const filtered = props.allProducts.filter(p => !isImageFailed(p.image) && p.categoryId && ids.includes(Number(p.categoryId)))
  
  return filtered.slice(0, 5) // Show top 5 products matching the 5 columns layout
})
</script>

<style scoped>
.category-block {
  background: #fff;
  border: 1px solid #e0e0e0;
  margin-top: 20px;
}

.cb-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.cb-title {
  font-size: 16px;
  font-weight: 700;
  text-transform: uppercase;
  margin: 0;
  color: #333;
  border-left: 4px solid #0066cc;
  padding-left: 10px;
}

.cb-view-all {
  font-size: 13px;
  color: #555;
  text-decoration: none;
}
.cb-view-all:hover {
  color: #e31b1b;
}

.cb-subcats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  border-bottom: 1px solid #eee;
}

.cb-subcat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 10px;
  text-align: center;
  color: #333;
  text-decoration: none;
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s;
}

.cb-subcat-item:nth-child(6n) {
  border-right: none;
}

.cb-subcat-item:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transform: translateY(-2px);
  z-index: 1;
}

.subcat-img-wrap {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.subcat-img-wrap img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.subcat-placeholder {
  width: 60px;
  height: 60px;
  background: #f5f5f5;
  border-radius: 50%;
}

.subcat-name {
  font-size: 14px;
  line-height: 1.3;
}

.cb-product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.cb-subtitle {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.cb-product-view-all {
  background: #ff9800;
  color: #fff;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s;
}
.cb-product-view-all:hover {
  background: #f57c00;
}

.cb-products {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  padding: 0 16px 20px;
}

.cb-empty {
  padding: 20px;
  text-align: center;
  color: #888;
  font-style: italic;
}

@media (max-width: 1200px) {
  .cb-subcats { grid-template-columns: repeat(4, 1fr); }
  .cb-products { grid-template-columns: repeat(4, 1fr); }
  .cb-subcat-item:nth-child(6n) { border-right: 1px solid #f0f0f0; }
  .cb-subcat-item:nth-child(4n) { border-right: none; }
}

@media (max-width: 768px) {
  .category-block {
    margin-top: 8px; /* Reduce gap on mobile */
  }
  .cb-subcats { grid-template-columns: repeat(3, 1fr); }
  .cb-products { grid-template-columns: repeat(2, 1fr); }
  
  /* Show only exactly 4 products on mobile (2 cols, 2 rows) */
  .cb-products > *:nth-child(n+5) {
    display: none;
  }

  .cb-subcat-item:nth-child(4n) { border-right: 1px solid #f0f0f0; }
  .cb-subcat-item:nth-child(3n) { border-right: none; }
  .cb-title { font-size: 15px; }
  .cb-subtitle { font-size: 15px; }
}
</style>
