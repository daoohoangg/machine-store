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
}

.home-top {
  min-width: 0;
}

.home-bleed-left {
  width: calc(100% + var(--sidebar-w));
  margin-left: calc(0px - var(--sidebar-w));
}

@media (max-width: 1024px) {
  .home-bleed-left {
    width: 100%;
    margin-left: 0;
  }
}
</style>
