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
        
        <!-- SEO keyword content block -->
        <div class="seo-intro" aria-label="Giới thiệu Điện Máy Tuấn Minh">
          <h2>Điện Máy Tuấn Minh - Phân phối máy nông nghiệp & công nghiệp chính hãng</h2>
          <p>
            <strong>Tuấn Minh Điện Máy</strong> là hệ thống phân phối <strong>điện máy chính hãng</strong> hàng đầu tại Việt Nam, chuyên cung cấp
            <strong>máy nông nghiệp</strong>, <strong>máy bơm nước</strong>, <strong>máy phát điện</strong>, <strong>máy nén khí</strong>, 
            <strong>máy cắt cỏ</strong>, <strong>máy xới đất</strong> của các thương hiệu uy tín như Yamaha, Honda, Kasei, Huspanda.
            Với hơn 10 năm kinh nghiệm trong ngành <em>điện máy</em>, chúng tôi cam kết cung cấp sản phẩm chất lượng, 
            giá tốt nhất thị trường, bảo hành toàn quốc và giao hàng nhanh chóng trên toàn quốc.
          </p>
          <p>
            Mua <strong>điện máy Tuấn Minh</strong> — quý khách hàng được hưởng chế độ <strong>bảo hành chính hãng</strong>,
            hỗ trợ kỹ thuật tận nơi và đội ngũ tư vấn chuyên nghiệp. Hotline mua hàng: <a href="tel:0995556969"><strong>0995.556.969</strong></a>.
            Kỹ thuật: <a href="tel:19005068"><strong>1900 5068</strong></a>.
          </p>
        </div>
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
  title: 'Tuấn Minh Điện Máy - Chuyên phân phối máy nông nghiệp, công nghiệp chính hãng',
  description: 'Tuấn Minh Điện Máy - Hệ thống phân phối điện máy chính hãng tại Việt Nam. Chuyên các loại máy bơm nước, máy phát điện, máy nén khí, máy nông nghiệp Yamaha, Honda, Kasei. Giao hàng toàn quốc, bảo hành uy tín, giá tốt nhất.',
  ogTitle: 'Tuấn Minh Điện Máy - Phân phối máy nông nghiệp & máy công nghiệp chính hãng',
  ogDescription: 'Chuyên cung cấp điện máy chính hãng: máy bơm nước, máy phát điện, máy nông nghiệp Yamaha, Honda. Giá tốt, bảo hành toàn quốc.',
  ogUrl: SITE_URL,
  ogImage: `${SITE_URL}/logo.png`,
  twitterCard: 'summary_large_image',
  twitterTitle: 'Tuấn Minh Điện Máy - Máy Nông Nghiệp Chính Hãng',
  twitterDescription: 'Hệ thống phân phối điện máy, máy nông nghiệp, máy công nghiệp chính hãng. Giao hàng toàn quốc.',
})

useHead({
  link: [{ rel: 'canonical', href: SITE_URL }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': SITE_URL,
        name: 'Tuấn Minh Điện Máy',
        alternateName: 'Điện Máy Tuấn Minh',
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        image: `${SITE_URL}/logo.png`,
        description: 'Tuấn Minh Điện Máy - Chuyên phân phối điện máy, máy nông nghiệp, máy công nghiệp chính hãng Yamaha, Honda, Kasei. Giao hàng toàn quốc.',
        telephone: '+84-995-556-969',
        priceRange: '$$',
        servesCuisine: '',
        hasMap: `${SITE_URL}`,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'VN',
          addressRegion: 'Thành phố Hồ Chí Minh'
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            telephone: '+84-995-556-969',
            contactType: 'sales',
            availableLanguage: 'Vietnamese',
            areaServed: 'VN'
          },
          {
            '@type': 'ContactPoint',
            telephone: '1900-5068',
            contactType: 'customer support',
            availableLanguage: 'Vietnamese',
            areaServed: 'VN'
          }
        ],
        sameAs: [
          'https://www.facebook.com/tuanminh'
        ],
        keywords: 'điện máy, điện máy tuấn minh, máy nông nghiệp, máy bơm nước, máy phát điện, Yamaha, Honda, máy nén khí, máy cắt cỏ, máy xới đất'
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

.seo-intro {
  margin-top: 20px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 20px 24px;
  font-size: 14px;
  color: #444;
  line-height: 1.7;
}

.seo-intro h2 {
  font-size: 17px;
  color: #333;
  margin: 0 0 10px;
  font-weight: 700;
}

.seo-intro p {
  margin: 0 0 8px;
}

.seo-intro a {
  color: #c0392b;
  text-decoration: none;
}

.seo-intro a:hover {
  text-decoration: underline;
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
