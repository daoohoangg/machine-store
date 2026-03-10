<template>
  <div class="oshima-main">
    <HomeHeroBanner />
    <HomeCategoryGrid />
    <HomeTopSellingRow />
    <ProductSection />
    <HomeBrandInfoSection />
  </div>
</template>

<script setup>
import ProductSection from '~/components/product/ProductSection.vue'
</script>

<style scoped>
.oshima-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
