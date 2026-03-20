<template>
  <div class="home-main">
    <div class="container">
      <div class="page-wrapper home-page-wrapper">
        <AppSidebar />
        <main class="main-content">
          <div class="home-top">
            <HomeHeroBanner />
          </div>
          <HomeTopSellingRow style="width: 100%; margin-left: 0; flex: 1;" class="mt-section" />
          <HomePromoRow class="hide-on-desktop" />
        </main>
      </div>
    </div>

    <div class="full-width-section">
      <HomePromoRow class="hide-on-mobile" />
      <div class="container">
        <OrderFlashSaleStrip class="mt-section" />
        <HomeCategoryRow class="mt-section" />
        <ProductSuggestion />
        
        <!-- Top 3 Categories Blocks -->
        <CategoryGroupBlock 
          v-for="cat in top3Categories" 
          :key="cat.id" 
          :category="cat" 
          :all-products="products"
        />

        <!-- Featured Brands -->
        <FeaturedBrands />
        
        <!-- Voucher -->
        <HomeVoucher class="mt-section" />
        
        <!-- Tin tức hoạt động -->
        <HomeNews />
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProductSuggestion from '~/components/product/ProductSuggestion.vue'
import CategoryGroupBlock from '~/components/home/CategoryGroupBlock.vue'
import FeaturedBrands from '~/components/home/FeaturedBrands.vue'
import HomeVoucher from '~/components/home/HomeVoucher.vue'
import HomeNews from '~/components/home/HomeNews.vue'
import { computed } from 'vue'

const { categories } = useCategories()
const { products } = useHomeProducts()

const top3Categories = computed(() => {
  return categories.value?.slice(0, 3) || []
})

const SITE_URL = 'https://huspanda.vn'

useSeoMeta({
  title: 'Tuấn Minh - Hệ thống phân phối máy nông nghiệp chính hãng',
  description: 'Tuấn Minh chuyên phân phối máy nông nghiệp, máy xây dựng, máy công nghiệp chính hãng Oshima, Kasei, Honda. Giao hàng toàn quốc, bảo hành uy tín, giá tốt nhất.',
  ogTitle: 'Tuấn Minh - Hệ thống phân phối máy nông nghiệp chính hãng',
  ogDescription: 'Chuyên cung cấp máy nông nghiệp, máy xây dựng chính hãng. Giao hàng toàn quốc, bảo hành uy tín.',
  ogUrl: SITE_URL,
  ogImage: `${SITE_URL}/logo.png`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Tuấn Minh - Máy Nông Nghiệp Chính Hãng',
  twitterDescription: 'Hệ thống phân phối máy nông nghiệp, máy xây dựng chính hãng. Giao hàng toàn quốc.',
})

useHead({
  link: [{ rel: 'canonical', href: SITE_URL }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Tuấn Minh - Máy Nông Nghiệp',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        description: 'Hệ thống phân phối máy nông nghiệp, máy xây dựng, máy công nghiệp chính hãng toàn quốc.',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+84-xxx-xxx-xxx',
          contactType: 'customer service',
          availableLanguage: 'Vietnamese'
        },
        sameAs: [
          'https://www.facebook.com/tuanminh'
        ]
      })
    }
  ]
})
</script>

<style scoped>
.home-main {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: 20px;
}

.home-top {
  min-width: 0;
}

.full-width-section {
  width: 100%;
}

.home-page-wrapper {
  margin-top: 10px;
}

.mt-section {
  margin-top: 20px;
}

@media (min-width: 769px) {
  .hide-on-desktop {
    display: none !important;
  }
}

@media (max-width: 768px) {
  .hide-on-mobile {
    display: none !important;
  }
  
  .home-main {
    padding-top: 0 !important;
  }
  .home-page-wrapper {
    margin: 0 !important;
    padding: 0 !important;
    border-bottom: none !important;
  }
  .full-width-section {
    margin-top: 0 !important;
    padding-top: 0 !important;
  }
  .mt-section {
    margin-top: 8px !important;
  }
  /* Remove padding from the first container on mobile */
  .home-main > .container {
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
  }
}
</style>
