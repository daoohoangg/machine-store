<template>
  <div class="home-main">
    <div class="container">
      <div class="page-wrapper" style="margin-top: 20px;">
        <AppSidebar />
        <main class="main-content">
          <div class="home-top">
            <HomeHeroBanner />
          </div>
          <HomeTopSellingRow style="width: 100%; margin-left: 0; flex: 1;" />
        </main>
      </div>
    </div>

    <div class="full-width-section">
      <div class="container">
        <HomePromoRow />
        <OrderFlashSaleStrip style="margin-top: 20px;" />
        <ProductSuggestion />
        <ProductSection style="margin-top: 20px;" :limit-to-one-row="true" />
        
        <!-- Top 3 Categories Blocks -->
        <CategoryGroupBlock 
          v-for="cat in top3Categories" 
          :key="cat.id" 
          :category="cat" 
          :all-products="products"
        />

        <!-- Featured Brands -->
        <FeaturedBrands />
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductSection from '~/components/product/ProductSection.vue'
import ProductSuggestion from '~/components/product/ProductSuggestion.vue'
import CategoryGroupBlock from '~/components/home/CategoryGroupBlock.vue'
import FeaturedBrands from '~/components/home/FeaturedBrands.vue'
import { computed } from 'vue'

const { categories } = useCategories()
const { products } = useHomeProducts()

const top3Categories = computed(() => {
  return categories.value?.slice(0, 3) || []
})

useSeoMeta({
  title: 'Tuấn Minh - Hệ thống phân phối máy nông nghiệp chính hãng',
  description: 'Chuyên cung cấp các loại máy nông nghiệp, máy xây dựng, máy công nghiệp chính hãng Oshima, Kasei... Giao hàng toàn quốc, bảo hành uy tín.',
  ogTitle: 'Tuấn Minh - Hệ thống phân phối máy nông nghiệp chính hãng',
  ogDescription: 'Chuyên cung cấp các loại máy nông nghiệp chính hãng. Giao hàng toàn quốc.',
})
</script>

<style scoped>
.home-main {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: 40px;
}

.home-top {
  min-width: 0;
}

.full-width-section {
  width: 100%;
}
</style>
