<template>
  <div v-if="product" class="product-detail-page">
    <nav class="breadcrumb" aria-label="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <template v-if="categoryName">
        <span>/</span>
        <NuxtLink :to="`/homepage?categoryId=${product.category}&categoryName=${categoryName}`">{{ categoryName }}</NuxtLink>
      </template>
      <span>/</span>
      <strong>{{ product.title }}</strong>
    </nav>

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
          <span class="stars">
            <i class="fa-solid fa-star" v-for="i in 5" :key="i"></i>
          </span>
          <a href="#" class="review-link">({{ product.reviews || 60 }} đánh giá)</a>
          <span class="divider">|</span>
          <a href="#" class="compare-link"><i class="fa-solid fa-circle-plus"></i> So sánh</a>
        </div>

        <p class="brand-row">
          <span>Thương hiệu:</span>
          <NuxtLink to="/">{{ product.brand }}</NuxtLink>
          <span class="divider">|</span>
          <NuxtLink to="/">{{ product.category }}</NuxtLink>
        </p>

        <div class="price-box-red">
          <div class="price-main">
            <p class="current-price">{{ formatPrice(product.price) }} đ</p>
            <div class="price-sub">
              <span v-if="product.discount" class="discount-badge">{{ product.discount }}</span>
              <span v-if="product.oldPrice" class="old-price">{{ formatPrice(product.oldPrice) }}đ</span>
              <small>(Đã gồm VAT)</small>
            </div>
          </div>
          <div class="price-meta">
            <p class="stock-status">Trạng thái: <strong>Còn hàng</strong></p>
            <div class="countdown-mock" v-if="product.discount">
              <span class="cd-label">Kết thúc sau</span>
              <div class="cd-timer">
                <span>00</span><i>giờ</i>
                <span>53</span><i>phút</i>
                <span>40</span><i>giây</i>
              </div>
              <div class="cd-stock">Còn <strong>508</strong> Chiếc</div>
            </div>
          </div>
        </div>

        <div class="qty-row">
          <span class="qty-label">Chọn số lượng:</span>
          <div class="qty-control">
            <button type="button" @click="decreaseQty">-</button>
            <input type="text" :value="quantity" readonly />
            <button type="button" @click="increaseQty">+</button>
          </div>
          <button type="button" class="add-cart-text-btn" @click="handleAddToCart">Cho vào giỏ <i class="fa-solid fa-cart-plus"></i></button>
        </div>

        <!-- <div class="promo-box">
          <div class="promo-header">
            <i class="fa-solid fa-gift"></i> ƯU ĐÃI
          </div>
          <ul class="promo-list">
            <li>
              <span class="promo-num">1</span>
              Tặng áo mưa Bosch (cho miền Bắc) hoặc túi đeo Bosch (cho miền Nam)
              <div class="promo-note">Đến khi hết ưu đãi</div>
            </li>
          </ul>
        </div> -->

        <div class="action-buttons">
          <button type="button" class="btn-buy-now" @click="handleBuyNow">
            <i class="fa-solid fa-cart-shopping"></i>
            <div class="btn-text">
              <strong>Đặt mua</strong>
              <span>Giao hàng tận nơi trên toàn quốc</span>
            </div>
          </button>
          <div class="btn-group-half">
            <button type="button" class="btn-consult">
              <i class="fa-solid fa-headset"></i>
              <div class="btn-text">
                <strong>Tư vấn</strong>
                <span>Chúng tôi sẽ gọi lại cho bạn</span>
              </div>
            </button>
            <!-- <button type="button" class="btn-installment">
              <div class="btn-text">
                <strong>Giao nhanh</strong>
                <span>Hỏa tốc trong 3 - 5 ngày</span>
              </div>
            </button> -->
          </div>
        </div>

        <div class="trust-box">
          <div class="trust-item">
            <i class="fa-solid fa-truck-fast"></i>
            <p>Giao hàng hỏa tốc trong 3 - 5 ngày <a href="#">(Xem thêm)</a></p>
          </div>
          <div class="trust-item">
            <i class="fa-solid fa-handshake"></i>
            <p>Được hàng trăm ngàn Doanh nghiệp tại Việt Nam lựa chọn: đầy đủ hóa đơn, hợp đồng, không chi phí ẩn <a href="#">(Xem thêm)</a></p>
          </div>
          <div class="trust-item">
            <i class="fa-solid fa-shield-halved"></i>
            <p>Bảo hành toàn quốc. <a href="#">(Xem trung tâm bảo hành)</a></p>
          </div>
        </div>
        
        <div class="meta-footer">
          <p>Tuấn Minh</p>
          <a href="#">Xem thêm chi tiết <i class="fa-solid fa-chevron-down"></i></a>
        </div>
      </div>
    </section>

    <div class="detail-layout">
      <div class="main-column">
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
          <h2>Thông tin sản phẩm chi tiết</h2>
          
          <div v-if="detailedDescription.isLoading" class="loading-gemini">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Đang tổng hợp thông tin chi tiết từ AI...
            <div class="skeleton-line"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line half"></div>
          </div>
          
          <div v-else-if="detailedDescription.textBlocks.length > 0" class="gemini-content-wrapper" :class="{ 'expanded': isDescriptionExpanded }">
            <div class="gemini-content">
              <template v-for="(block, idx) in detailedDescription.textBlocks" :key="idx">
                <p>{{ block }}</p>
                <!-- Interleave images if not the last text block -->
                <div v-if="idx < detailedDescription.textBlocks.length - 1 && galleryImages.length > 0" class="desc-image">
                  <img :src="galleryImages[idx % galleryImages.length]" :alt="`${product.title} - tính năng ${idx + 1}`" loading="lazy" />
                </div>
              </template>
            </div>
            <div class="desc-fade" v-if="!isDescriptionExpanded"></div>
          </div>
          
          <div v-if="detailedDescription.textBlocks.length > 0 && !detailedDescription.isLoading" class="desc-toggle-wrapper">
            <button type="button" class="btn-toggle-desc" @click="isDescriptionExpanded = !isDescriptionExpanded">
              {{ isDescriptionExpanded ? 'Thu gọn nội dung' : 'Xem thêm nội dung' }}
              <i class="fa-solid" :class="isDescriptionExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
            </button>
          </div>
          
          <div v-else-if="!detailedDescription.isLoading && detailedDescription.textBlocks.length === 0">
            <p>
              {{ product.title }} là dòng thiết bị của
              {{ product.brand }}, được thiết kế để vận hành ổn định.
            </p>

            <h3>Ưu điểm nổi bật</h3>
            <ul>
              <li v-for="(line, idx) in highlightFeatures" :key="`${line}-${idx}`">{{ line }}</li>
            </ul>
          </div>
        </section>

        <section class="reviews-card">
          <div class="reviews-head">
            <h2>Đánh giá từ khách hàng</h2>
            <div class="overall-rating">
              <span class="big-score">4.8</span>
              <span class="stars">
                <i class="fa-solid fa-star" v-for="i in 5" :key="i"></i>
              </span>
              <span class="count">{{ mockReviews.length }} đánh giá</span>
            </div>
          </div>
          
          <div class="review-list">
            <div class="review-item" v-for="review in mockReviews" :key="review.id">
              <div class="review-user">
                <div class="avatar">{{ review.user.charAt(0) }}</div>
                <div class="user-meta">
                  <strong>{{ review.user }}</strong>
                  <span class="date">{{ review.date }}</span>
                </div>
              </div>
              <div class="review-stars">
                <i class="fa-solid fa-star" v-for="i in review.rating" :key="`on-${i}`"></i>
                <i class="fa-regular fa-star" v-for="i in (5 - review.rating)" :key="`off-${i}`" style="color: #ccc;"></i>
              </div>
              <p class="review-content">{{ review.content }}</p>
            </div>
          </div>
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
import { useCategories } from '~/composables/useCategories'
import { useCart } from '~/composables/useCart'
import { useImageGuard } from '~/composables/useImageGuard'
import { useViewedProducts } from '~/composables/useViewedProducts'

const route = useRoute()
const router = useRouter()
const { products } = useHomeProducts()
const { categories, fetchCategories } = useCategories()
const { addToCart } = useCart()
const { isImageFailed, markImageAsFailed } = useImageGuard()
const { addViewedProduct, viewedProducts: historyProducts } = useViewedProducts()

const activeImageIndex = ref(0)
const quantity = ref(1)
const isDescriptionExpanded = ref(false)

const detailedDescription = ref<{ isLoading: boolean, textBlocks: string[], error: string }>({
  isLoading: false,
  textBlocks: [],
  error: ''
})

const fetchGeminiDescription = async (prod: HomeProduct) => {
  try {
    detailedDescription.value.isLoading = true
    detailedDescription.value.error = ''
    detailedDescription.value.textBlocks = []

    const body = {
      title: prod.title,
      brand: prod.brand,
      category: prod.category,
      specs: prod.fullSpecs?.slice(0, 5).join(', ') || ''
    }

    const { textBlocks } = await $fetch<{ textBlocks: string[] }>('/api/gemini/product-desc', {
      method: 'POST',
      body
    })

    if (textBlocks && textBlocks.length) {
      detailedDescription.value.textBlocks = textBlocks
    }
  } catch (err: any) {
    console.error(err)
    detailedDescription.value.error = 'Không thể tải thêm thông tin lúc này.'
  } finally {
    detailedDescription.value.isLoading = false
  }
}

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

const categoryName = computed(() => {
  if (!product.value?.category || !categories.value.length) return ''
  // product.category is often the category ID as string from useHomeProducts
  
  // Recursively search nested categories
  let matchedName = ''
  const searchCategory = (cats: any[]) => {
    for (const cat of cats) {
      if (String(cat.id) === product.value?.category || cat.name === product.value?.category) {
        matchedName = cat.name
        return true
      }
      if (cat.children && searchCategory(cat.children)) return true
    }
    return false
  }
  
  searchCategory(categories.value)
  return matchedName || product.value.category // fallback to raw string if not found
})

watch(product, (newProd) => {
  if (newProd) {
    fetchGeminiDescription(newProd)
  }
}, { immediate: true })

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

  const mappedSpecs = (product.value.fullSpecs || [])
    .filter(line => line.length > 2)
    .map((line) => {
      // Look for a realistic key-value separation with a colon or specific keywords
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0 && colonIndex < line.length - 1) {
        return {
          label: line.substring(0, colonIndex).trim(),
          value: line.substring(colonIndex + 1).trim()
        }
      }

      const hyphenIndex = line.indexOf('-')
      if (hyphenIndex > 0 && hyphenIndex < line.length - 1 && line.length < 150) {
        // Only accept hyphen as separator if line is somewhat short, else it's likely just text
        return {
          label: line.substring(0, hyphenIndex).trim(),
          value: line.substring(hyphenIndex + 1).trim()
        }
      }

      // If it contains "bảo hành", use that as label
      if (line.toLowerCase().includes('bảo hành')) {
        return {
          label: 'Bảo hành',
          value: line.trim()
        }
      }

      return {
        label: 'Thông tin thêm',
        value: line.trim()
      }
    })

  const specs = [
    { label: 'Thương hiệu', value: product.value.brand },
    { label: 'Mã sản phẩm', value: product.value.id },
    ...mappedSpecs
  ]

  // Group by label to prevent duplicates like multiple "Bảo hành"
  const groupedSpecs = new Map<string, string[]>()
  specs.forEach(spec => {
    if (!groupedSpecs.has(spec.label)) {
      groupedSpecs.set(spec.label, [])
    }
    groupedSpecs.get(spec.label)!.push(spec.value)
  })

  const finalSpecs: Array<{label: string, value: string}> = []
  groupedSpecs.forEach((values, label) => {
    // deduplicate values within the same label
    const uniqueVals = Array.from(new Set(values))
    finalSpecs.push({
      label,
      value: uniqueVals.join(', ')
    })
  })

  return finalSpecs.slice(0, 30) // Render up to 30 valid spec rows
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
    .slice(0, 4)
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

const mockReviews = [
  {
    id: 1,
    user: 'Nguyễn Văn A',
    rating: 5,
    date: '10/03/2026',
    content: 'Sản phẩm hoạt động rất tốt, máy êm và mạnh mẽ. Thiết kế chắc chắn, rất đáng tiền!'
  },
  {
    id: 2,
    user: 'Trần Thị B',
    rating: 4,
    date: '02/03/2026',
    content: 'Giao hàng nhanh hỏa tốc như cam kết. Máy chạy ổn định, nhưng dây cắm hơi ngắn so với nhu cầu của mình.'
  },
  {
    id: 3,
    user: 'Lê Hoàng C',
    rating: 5,
    date: '15/02/2026',
    content: 'Đã mua lần thứ hai cho kho xưởng. Rất hài lòng với chế độ bảo hành và chăm sóc khách hàng của shop.'
  }
]

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
  if (categories.value.length === 0) {
    fetchCategories()
  }
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
  grid-template-columns: 55fr 45fr;
  gap: 20px;
  background: #fff;
  border: 1px solid #d8d8d8;
  padding: 15px;
  margin-bottom: 15px;
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
  margin: 0 0 10px;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.35;
  color: #333;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 8px;
}
.stars { color: #f9ae06; font-size: 12px; }
.review-link { color: #007bff; text-decoration: none; }
.compare-link { color: #007bff; text-decoration: none; display: flex; align-items: center; gap: 4px; }
.divider { color: #ccc; margin: 0 2px; }

.brand-row {
  margin: 0 0 15px;
  font-size: 14px;
  color: #555;
}
.brand-row a { color: #007bff; text-decoration: none; }

.price-box-red {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: #de2000;
  color: #fff;
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 15px;
}
.price-main { display: flex; flex-direction: column; }
.current-price {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}
.price-sub {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 13px;
}
.discount-badge {
  font-weight: 700;
}
.old-price {
  text-decoration: line-through;
  opacity: 0.9;
}

.price-meta {
  text-align: right;
  font-size: 12px;
}
.stock-status {
  margin: 0 0 8px;
  color: #fff;
}
.stock-status strong { font-weight: 600; }
.countdown-mock {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.cd-timer {
  display: flex;
  align-items: center;
  gap: 4px;
}
.cd-timer span {
  background: #fff;
  color: #333;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: 700;
}
.cd-timer i {
  font-style: normal;
  opacity: 0.9;
}

/* Quantity */
.qty-row {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}
.qty-label { font-size: 14px; color: #333; }
.qty-control {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}
.qty-control button {
  width: 32px;
  height: 32px;
  border: none;
  background: #f8f8f8;
  cursor: pointer;
  font-size: 18px;
}
.qty-control input {
  width: 40px;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  border-top: none;
  border-bottom: none;
  text-align: center;
  font-weight: 600;
}
.add-cart-text-btn {
  background: transparent;
  border: none;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}
.add-cart-text-btn i { font-size: 18px; color: #007bff; }

/* Promo Box */
.promo-box {
  border: 1px solid #f2cfcf;
  border-radius: 4px;
  margin-bottom: 20px;
}
.promo-header {
  background: white;
  color: #de2000;
  font-weight: 700;
  padding: 8px 12px;
  font-size: 13px;
  border-bottom: 1px solid #f2cfcf;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
}
.promo-list {
  list-style: none;
  margin: 0;
  padding: 12px;
  font-size: 13px;
  color: #333;
}
.promo-list li {
  position: relative;
  padding-left: 24px;
  line-height: 1.4;
}
.promo-num {
  position: absolute;
  left: 0;
  top: 0;
  background: #de2000;
  color: #fff;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
}
.promo-note {
  color: #666;
  font-size: 12px;
  margin-top: 2px;
}

/* Purchase Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
.action-buttons button {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  color: #fff;
  transition: opacity 0.2s;
}
.action-buttons button:hover { opacity: 0.9; }
.btn-text {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.btn-buy-now {
  background: #de2000;
  padding: 12px;
}
.btn-buy-now i { font-size: 32px; }
.btn-buy-now strong { font-size: 18px; text-transform: uppercase; margin-bottom: 2px; }
.btn-buy-now span { font-size: 12px; }

.btn-group-half {
  display: flex;
  gap: 10px;
}
.btn-group-half button {
  flex: 1;
  padding: 10px;
}
.btn-consult { background: #00a600; }
.btn-consult i { font-size: 24px; }
.btn-consult strong { font-size: 16px; margin-bottom: 2px;}
.btn-consult span { font-size: 11px; }

.btn-installment { background: #ffb800; color: #333 !important; }
.btn-installment strong { font-size: 16px; margin-bottom: 2px; }
.btn-installment span { font-size: 11px; }

/* Trust Box */
.trust-box {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 15px;
}
.trust-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13px;
  color: #333;
  line-height: 1.4;
}
.trust-item + .trust-item {
  margin-top: 12px;
}
.trust-item i {
  color: #e57373;
  font-size: 18px;
  margin-top: 2px;
  width: 20px;
  text-align: center;
}
.trust-item p { margin: 0; }
.trust-item a { color: #007bff; text-decoration: none; }

.meta-footer {
  text-align: center;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}
.meta-footer p { margin: 0 0 8px; }
.meta-footer a { color: #007bff; text-decoration: none; }

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

.loading-gemini {
  padding: 15px;
  color: #007bff;
  font-size: 14px;
  font-style: italic;
}
.skeleton-line {
  height: 12px;
  background: #f0f0f0;
  border-radius: 4px;
  margin-top: 10px;
  animation: pulse 1.5s infinite;
}
.skeleton-line.half { width: 50%; }

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.gemini-content-wrapper {
  position: relative;
  overflow: hidden;
  max-height: 500px;
  transition: max-height 0.4s ease;
}
.gemini-content-wrapper.expanded {
  max-height: 10000px;
}
.desc-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  pointer-events: none;
}
.desc-toggle-wrapper {
  text-align: center;
  padding: 10px 0 20px;
  background: #fff;
}
.btn-toggle-desc {
  background: #fff;
  border: 1px solid #007bff;
  color: #007bff;
  padding: 8px 30px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}
.btn-toggle-desc:hover {
  background: #007bff;
  color: #fff;
}

.gemini-content p {
  margin: 0;
  padding: 12px;
  font-size: 15px;
  color: #333;
  line-height: 1.6;
  text-align: justify;
}

.desc-image {
  margin: 15px 0;
  text-align: center;
}
.desc-image img {
  max-width: 80%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.reviews-card {
  background: #fff;
  border: 1px solid #d8d8d8;
  margin-bottom: 20px;
}
.reviews-head {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.reviews-head h2 {
  margin: 0;
  font-size: 24px;
}
.overall-rating {
  display: flex;
  align-items: center;
  gap: 10px;
}
.big-score {
  font-size: 28px;
  font-weight: 700;
  color: #de2000;
}
.overall-rating .count {
  font-size: 14px;
  color: #666;
}

.review-list {
  padding: 0 20px;
}
.review-item {
  padding: 20px 0;
  border-bottom: 1px solid #f5f5f5;
}
.review-item:last-child {
  border-bottom: none;
}
.review-user {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.avatar {
  width: 40px;
  height: 40px;
  background: #eef2f5;
  color: #007bff;
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.user-meta strong {
  display: block;
  font-size: 15px;
  color: #333;
}
.user-meta .date {
  font-size: 12px;
  color: #888;
}
.review-stars {
  color: #f9ae06;
  font-size: 13px;
  margin-bottom: 8px;
}
.review-content {
  margin: 0;
  font-size: 14px;
  color: #444;
  line-height: 1.5;
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
  top: 10px;
  align-self: start;
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
