<template>
  <div class="home-main">
    <div class="container">
      <div class="page-wrapper" style="margin-top: 20px;">
        <AppSidebar />
        <main class="main-content">
          <div class="home-top">
            <HomeHeroBanner />
          </div>
          <HomeTopSellingRow style="width: 100%; margin-left: 0;" />
        </main>
      </div>
    </div>

    <div class="full-width-section">
      <div class="container">
        <HomePromoRow style="margin-top: 20px;" />
        <OrderFlashSaleStrip style="margin-top: 20px;" />
        <ProductSection style="margin-top: 20px;" />
      </div>
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
  padding-bottom: 40px;
}

.home-top {
  min-width: 0;
}

.full-width-section {
  width: 100%;
}
</style>
