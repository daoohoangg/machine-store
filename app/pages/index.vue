<template>
  <div class="home-main">
    <HomeHeroBanner />
    <HomeCategoryGrid />
    <HomeTopSellingRow />
    <OrderFlashSaleStrip />
    <ProductSection />
  </div>
</template>

<script setup lang="ts">
import ProductSection from '~/components/product/ProductSection.vue'
</script>

<style scoped>
.home-main {
  display: flex;
  flex-direction: column;
  gap: 0;
}
</style>
