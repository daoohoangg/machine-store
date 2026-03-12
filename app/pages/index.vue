<template>
  <div class="home-main">
    <div class="home-top">
      <HomeHeroBanner />
      <HomeCategoryGrid />
    </div>

    <div class="home-bleed-left">
      <HomeTopSellingRow />
      <OrderFlashSaleStrip />
      <ProductSection />
    </div>
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

.home-top {
  min-width: 0;
}

.home-bleed-left {
  width: calc(100% + var(--sidebar-w));
  margin-left: calc(var(--sidebar-w) * -1);
}

@media (max-width: 1024px) {
  .home-bleed-left {
    width: 100%;
    margin-left: 0;
  }
}
</style>
