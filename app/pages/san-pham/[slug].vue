<template>
  <div v-if="product" class="product-detail-page">
    <nav class="breadcrumb" aria-label="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <span>/</span>
      <strong>{{ product.title }}</strong>
    </nav>

    <div class="detail-layout">
      <div class="main-column">
        <section class="hero-card">
          <div class="gallery-col">
            <div class="gallery-main">
              <img :src="activeImage" :alt="product.title" />
            </div>

            <div class="gallery-thumbs">
              <button
                v-for="(img, idx) in galleryImages"
                :key="`${product.id}-${idx}`"
                type="button"
                class="thumb-btn"
                :class="{ active: idx === activeImageIndex }"
                @click="activeImageIndex = idx"
              >
                <img :src="img" :alt="`${product.title} - ảnh ${idx + 1}`" />
              </button>
            </div>
          </div>

          <div class="purchase-col">
            <h1>{{ product.title }}</h1>

            <div class="rating-row">
              <span class="stars">★★★★★</span>
              <span>({{ product.reviews }} đánh giá)</span>
            </div>

            <p class="brand-row">
              <span>Thương hiệu:</span>
              <strong>{{ product.brand }}</strong>
            </p>

            <div class="price-box">
              <p class="current-price">{{ formatPrice(product.price) }} đ</p>
              <p v-if="product.oldPrice" class="old-price">{{ formatPrice(product.oldPrice) }} đ</p>
              <span v-if="product.discount" class="discount-badge">{{ product.discount }}</span>
              <small>(Đã gồm VAT)</small>
            </div>

            <p class="stock-row">Trạng thái: <strong>Còn hàng</strong></p>

            <div class="qty-row">
              <span>Chọn số lượng:</span>
              <div class="qty-control">
                <button type="button" @click="decreaseQty">-</button>
                <input type="text" :value="quantity" readonly />
                <button type="button" @click="increaseQty">+</button>
              </div>
              <button type="button" class="add-cart-btn" @click="handleAddToCart">Cho vào giỏ</button>
            </div>

            <div class="cta-row">
              <button type="button" class="buy-btn" @click="handleBuyNow">Đặt mua</button>
              <button type="button" class="advice-btn">Tư vấn</button>
            </div>

            <ul class="benefits">
              <li>Miễn phí giao hàng trong nội thành Hà Nội và nội thành TP.HCM.</li>
              <li>Được hàng trăm ngàn doanh nghiệp Việt Nam lựa chọn.</li>
              <li>Bảo hành toàn quốc theo chính sách hãng.</li>
            </ul>
          </div>
        </section>

        <section class="spec-card">
          <h2>Thông số kỹ thuật</h2>
          <table>
            <tbody>
              <tr v-for="(row, idx) in specRows" :key="`${row.label}-${idx}`">
                <th>{{ row.label }}</th>
                <td>{{ row.value }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="note-card">
          <h3>Chú ý</h3>
          <p>
            Quý khách vui lòng giữ nguyên bao bì, phụ kiện, giấy tờ đi kèm trong vòng
            <strong>15 ngày</strong> sau khi nhận hàng để xử lý các khiếu nại phát sinh (nếu có).
          </p>
        </section>

        <section class="desc-card">
          <h2>Thông tin sản phẩm</h2>
          <p>
            {{ product.title }} là dòng thiết bị của
            {{ product.brand }}, được thiết kế để vận hành ổn định và tiết kiệm điện trong điều kiện sử dụng gia đình
            hoặc cửa hàng nhỏ.
          </p>

          <h3>Ưu điểm nổi bật</h3>
          <ul>
            <li v-for="(line, idx) in highlightFeatures" :key="`${line}-${idx}`">{{ line }}</li>
          </ul>
        </section>

        <section class="related-card">
          <div class="related-head">
            <h2>Sản phẩm tương tự</h2>
          </div>

          <div class="related-grid">
            <ProductCard
              v-for="item in relatedProducts"
              :key="item.id"
              :product="item"
            />
          </div>
        </section>
      </div>

      <aside class="side-column">
        <section class="viewed-card">
          <h3>Sản phẩm đã xem</h3>

          <NuxtLink
            v-for="item in viewedProducts"
            :key="item.id"
            :to="`/san-pham/${item.slug}`"
            class="viewed-item"
          >
            <div class="thumb">
              <img :src="item.image" :alt="item.title" />
              <span v-if="item.discount" class="mini-discount">{{ item.discount }}</span>
            </div>
            <div class="meta">
              <p class="title">{{ item.title }}</p>
              <p class="price">{{ formatPrice(item.price) }} đ</p>
              <p v-if="item.oldPrice" class="old">{{ formatPrice(item.oldPrice) }} đ</p>
            </div>
          </NuxtLink>
        </section>
      </aside>
    </div>
  </div>

  <section v-else class="not-found">
    <h1>Không tìm thấy sản phẩm</h1>
    <p>Liên kết không hợp lệ hoặc sản phẩm đã được gỡ khỏi hệ thống.</p>
    <NuxtLink class="back-link" to="/homepage">Quay lại danh mục</NuxtLink>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '~/components/product/ProductCard.vue'
import { slugifyProduct, useHomeProducts, type HomeProduct } from '~/composables/useHomeProducts'
import { useCart } from '~/composables/useCart'
import { useImageGuard } from '~/composables/useImageGuard'
import { useViewedProducts } from '~/composables/useViewedProducts'

const route = useRoute()
const router = useRouter()
const { products } = useHomeProducts()
const { addToCart } = useCart()
const { isImageFailed, markImageAsFailed } = useImageGuard()
const { addViewedProduct, viewedProducts: historyProducts } = useViewedProducts()

const activeImageIndex = ref(0)
const quantity = ref(1)

const routeSlug = computed(() => {
  const param = route.params.slug
  return Array.isArray(param) ? param[0] : String(param || '')
})

const product = computed<HomeProduct | null>(() => {
  const slug = routeSlug.value
  if (!slug) return null

  return (
    products.value.find((item) => item.slug === slug)
    || products.value.find((item) => item.id === slug)
    || products.value.find((item) => slugifyProduct(item.title) === slug)
    || null
  )
})

useSeoMeta({
  title: () => product.value ? `${product.value.title} - Tuấn Minh` : 'Sản phẩm | Tuấn Minh',
  ogTitle: () => product.value ? `${product.value.title} - Tuấn Minh` : 'Sản phẩm',
  description: () => product.value ? `Mua ${product.value.title} chính hãng tại Tuấn Minh. ${product.value.category} chất lượng cao, bảo hành toàn quốc.` : '',
  ogDescription: () => product.value ? `Mua ${product.value.title} chính hãng tại Tuấn Minh. ${product.value.category} chất lượng cao, bảo hành toàn quốc.` : '',
  ogImage: () => product.value?.image,
  twitterCard: 'summary_large_image',
})

const galleryImages = computed(() => {
  if (!product.value) return []
  if (product.value.images && product.value.images.length) {
    return product.value.images
  }
  return [product.value.image]
})

const activeImage = computed(() => {
  if (!galleryImages.value.length) return ''
  return galleryImages.value[activeImageIndex.value] || galleryImages.value[0]
})

const specRows = computed(() => {
  if (!product.value) return []

  const mappedSpecs = (product.value.fullSpecs || []).map((line, index) => {
    const parts = line.split(':')
    if (parts.length > 1) {
      return {
        label: parts.shift()?.trim() || `Thông tin ${index + 1}`,
        value: parts.join(':').trim()
      }
    }

    return {
      label: `Thông tin ${index + 1}`,
      value: line
    }
  })

  return [
    { label: 'Thương hiệu', value: product.value.brand },
    { label: 'Mã sản phẩm', value: product.value.id },
    ...mappedSpecs
  ].slice(0, 14)
})

const highlightFeatures = computed(() => {
  if (!product.value) return []

  const base = [
    `Thiết kế gọn gàng, dễ lắp đặt trong nhiều không gian sử dụng.`,
    `Mức giá phù hợp, tối ưu chi phí đầu tư cho hộ gia đình và cửa hàng.`,
    `Thương hiệu ${product.value.brand} được nhiều khách hàng tin dùng.`
  ]

  const bySpecs = (product.value.fullSpecs || []).slice(0, 4)
  return [...bySpecs, ...base].slice(0, 6)
})

const relatedProducts = computed(() => {
  if (!product.value) return []

  const sameCategory = products.value
    .filter((item) => item.id !== product.value?.id && item.category === product.value?.category && !isImageFailed(item.image))
    .slice(0, 6)
    .map((item) => ({
      ...item,
      soldPercent: Math.min(95, Math.max(8, Math.round((item.sold || 20) / 8)))
    }))

  return sameCategory
})

const viewedProducts = computed(() => {
  if (!product.value) return []

  // Filter out current product
  return historyProducts.value
    .filter((item) => item.id !== product.value?.id && !isImageFailed(item.image))
    .slice(0, 5)
})

const formatPrice = (value: number | string) => {
  const digits = String(value || 0).replace(/[^\d]/g, '')
  return Number(digits || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const decreaseQty = () => {
  quantity.value = Math.max(1, quantity.value - 1)
}

const increaseQty = () => {
  quantity.value += 1
}

const pushToViewed = (item: HomeProduct) => {
  addViewedProduct({
    id: item.id,
    slug: item.slug,
    title: item.title,
    price: item.price,
    oldPrice: item.oldPrice,
    image: item.image,
    categoryId: item.categoryId,
    category: item.category
  })
}

const handleAddToCart = () => {
  if (!product.value) return

  for (let i = 0; i < quantity.value; i += 1) {
    addToCart({
      title: product.value.title,
      price: product.value.price,
      oldPrice: product.value.oldPrice,
      image: product.value.image
    })
  }
}

const handleBuyNow = () => {
  handleAddToCart()
  router.push('/checkout')
}

onMounted(() => {
  // Logic handled by composable
})

watch(
  () => product.value,
  (newProd) => {
    activeImageIndex.value = 0
    quantity.value = 1
    if (newProd) pushToViewed(newProd)
  },
  { immediate: true }
)
</script>

<style scoped>
.product-detail-page {
  padding: 10px;
  background: #efefef;
}

.breadcrumb {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.breadcrumb a {
  color: #0e63c7;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 285px;
  gap: 12px;
  align-items: start;
}

.main-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px;
  background: #fff;
  border: 1px solid #d8d8d8;
  padding: 10px;
}

.gallery-main {
  border: 1px solid #ddd;
  background: #fafafa;
  height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  overflow: hidden;
}

.gallery-main img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.gallery-thumbs {
  margin-top: 10px;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}

.thumb-btn {
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  padding: 4px;
  cursor: pointer;
  height: 56px;
}

.thumb-btn.active {
  border-color: #e2261e;
}

.thumb-btn img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.purchase-col h1 {
  margin: 0 0 8px;
  font-size: 34px;
  line-height: 1.25;
  color: #212121;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.stars {
  color: #f9ae06;
  letter-spacing: 1px;
}

.rating-row a {
  color: #0e63c7;
}

.brand-row {
  margin: 0 0 10px;
  font-size: 14px;
}

.brand-row span {
  color: #666;
  margin-right: 6px;
}

.price-box {
  background: #e31b1b;
  color: #fff;
  border-radius: 4px;
  padding: 12px;
  position: relative;
  margin-bottom: 10px;
}

.current-price {
  margin: 0;
  font-size: 46px;
  font-weight: 800;
  line-height: 1;
}

.old-price {
  margin: 4px 0 2px;
  text-decoration: line-through;
  font-size: 15px;
  opacity: 0.85;
}

.price-box small {
  display: block;
  font-size: 13px;
  opacity: 0.9;
}

.discount-badge {
  position: absolute;
  right: 12px;
  top: 12px;
  border-radius: 999px;
  background: #fff;
  color: #d71414;
  font-weight: 700;
  padding: 2px 9px;
  font-size: 12px;
}

.stock-row {
  margin: 0 0 10px;
  font-size: 14px;
  color: #444;
}

.stock-row strong {
  color: #079115;
}

.qty-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.qty-row > span {
  font-size: 14px;
  color: #555;
}

.qty-control {
  display: inline-flex;
  border: 1px solid #cfcfcf;
  border-radius: 4px;
  overflow: hidden;
}

.qty-control button {
  width: 34px;
  height: 34px;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}

.qty-control input {
  width: 40px;
  border: none;
  text-align: center;
  font-weight: 600;
}

.add-cart-btn {
  border: 1px solid #1d76c7;
  background: #fff;
  color: #1d76c7;
  border-radius: 4px;
  height: 34px;
  padding: 0 14px;
  cursor: pointer;
  font-weight: 600;
}

.cta-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 10px;
}

.buy-btn,
.advice-btn {
  border: none;
  border-radius: 4px;
  min-height: 44px;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  cursor: pointer;
}

.buy-btn {
  background: #e11b1a;
}

.advice-btn {
  background: #10a52d;
}

.benefits {
  margin: 0;
  padding-left: 18px;
  color: #555;
  font-size: 14px;
}

.benefits li + li {
  margin-top: 4px;
}

.spec-card,
.note-card,
.desc-card,
.related-card,
.viewed-card {
  background: #fff;
  border: 1px solid #d8d8d8;
}

.spec-card h2,
.desc-card h2 {
  margin: 0;
  padding: 10px 12px;
  font-size: 30px;
  border-bottom: 1px solid #ebebeb;
}

.spec-card table {
  width: 100%;
  border-collapse: collapse;
}

.spec-card th,
.spec-card td {
  border-bottom: 1px solid #eee;
  padding: 9px 12px;
  text-align: left;
  font-size: 14px;
}

.spec-card th {
  width: 35%;
  background: #f7f7f7;
  color: #444;
}

.note-card h3 {
  margin: 0;
  padding: 8px 12px;
  font-size: 29px;
  color: #e86000;
}

.note-card p {
  margin: 0;
  border-top: 1px solid #efefef;
  padding: 8px 12px 10px;
  color: #444;
  font-size: 14px;
}

.desc-card p {
  margin: 0;
  padding: 12px;
  font-size: 15px;
  color: #333;
  line-height: 1.55;
}

.desc-card h3 {
  margin: 0;
  padding: 0 12px;
  font-size: 34px;
}

.desc-card ul {
  margin: 8px 0 12px;
  padding: 0 12px 0 30px;
  color: #333;
}

.desc-card li + li {
  margin-top: 5px;
}

.related-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding: 10px 12px;
}

.related-head h2 {
  margin: 0;
  font-size: 34px;
}

.related-head a {
  color: #0e63c7;
}

.related-grid {
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.side-column {
  position: sticky;
  top: 82px;
}

.viewed-card h3 {
  margin: 0;
  padding: 9px 10px;
  font-size: 30px;
  border-bottom: 1px solid #ececec;
}

.viewed-item {
  display: grid;
  grid-template-columns: 74px minmax(0, 1fr);
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.thumb {
  width: 74px;
  height: 74px;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  background: #f9f9f9;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.mini-discount {
  position: absolute;
  top: 4px;
  left: 4px;
  border-radius: 99px;
  background: #ff9800;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
}

.meta .title {
  margin: 0 0 6px;
  font-size: 13px;
  color: #333;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta .price {
  margin: 0;
  color: #e11e1e;
  font-size: 22px;
  font-weight: 700;
}

.meta .old {
  margin: 2px 0 0;
  font-size: 12px;
  color: #888;
  text-decoration: line-through;
}

.not-found {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: #fff;
}

.not-found h1 {
  margin: 0;
  font-size: 24px;
}

.back-link {
  border: 1px solid #136dc7;
  color: #136dc7;
  padding: 8px 12px;
  border-radius: 4px;
}

@media (max-width: 1200px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .side-column {
    position: static;
  }

  .related-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .purchase-col h1 {
    font-size: 26px;
  }

  .current-price {
    font-size: 28px;
  }

  .buy-btn,
  .advice-btn,
  .related-head h2,
  .viewed-card h3,
  .desc-card h3,
  .spec-card h2,
  .desc-card h2,
  .note-card h3 {
    font-size: 20px;
  }

  .meta .price {
    font-size: 16px;
  }
}

@media (max-width: 880px) {
  .hero-card {
    grid-template-columns: 1fr;
  }

  .gallery-main {
    height: 300px;
  }

  .related-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
