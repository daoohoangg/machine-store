<template>
  <article class="product-card">
    <div v-if="isOutletShop && discountPercent" class="discount-ribbon">{{ discountPercent }}</div>

    <NuxtLink v-if="detailPath" :to="detailPath" class="card-link" :aria-label="product.title">
      <div class="thumb-wrap">
        <img
          v-if="product.image"
          class="product-img"
          :src="product.image"
          :alt="product.title"
          loading="lazy"
          @error="handleImageError"
        />
        <div v-else class="product-img placeholder"></div>
      </div>

      <div class="card-info">
        <h4 class="product-title">{{ product.title }}</h4>
        <div class="brand-wrapper">
          <img v-if="getBrandImage(productBrand)" :src="getBrandImage(productBrand)" :alt="productBrand" class="brand-name-img" />
          <p class="brand-name">{{ productBrand }}</p>
        </div>

        <div class="price-rating-row">
          <div class="price-col">
            <span class="current-price">{{ formatPriceObj(membershipPrice) }} đ</span>
            <span class="old-price" v-if="showOriginalPrice">{{ formatPriceObj(basePrice) }} đ</span>
          </div>
          <div class="rating-col">
            <div class="stars">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="star-icon" v-for="i in 5" :key="i"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>
            </div>
            <span class="review-count">({{ reviewCount }})</span>
          </div>
        </div>
      </div>
    </NuxtLink>

    <div v-else class="card-link">
      <div class="thumb-wrap">
        <img
          v-if="product.image"
          class="product-img"
          :src="product.image"
          :alt="product.title"
          loading="lazy"
          @error="handleImageError"
        />
        <div v-else class="product-img placeholder"></div>
      </div>

      <div class="card-info">
        <h4 class="product-title">{{ product.title }}</h4>
        <div class="brand-wrapper">
          <img v-if="getBrandImage(productBrand)" :src="getBrandImage(productBrand)" :alt="productBrand" class="brand-name-img" />
          <p class="brand-name">{{ productBrand }}</p>
        </div>

        <div class="price-rating-row">
          <div class="price-col">
            <span class="current-price">{{ formatPriceObj(membershipPrice) }} đ</span>
            <span class="old-price" v-if="showOriginalPrice">{{ formatPriceObj(basePrice) }} đ</span>
          </div>
          <div class="rating-col">
            <div class="stars">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" class="star-icon" v-for="i in 5" :key="i"><path d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>
            </div>
            <span class="review-count">({{ reviewCount }})</span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useImageGuard } from '~/composables/useImageGuard'
import { useAdminAuth } from '~/composables/useAdminAuth'

const props = withDefaults(defineProps<{
  product: {
    id?: string | number
    slug?: string
    title: string
    price: number | string
    oldPrice?: number | string
    sold?: number
    soldPercent?: number
    discount?: string | null
    image?: string
    specs?: string[]
    brand?: string
    reviews?: number
  }
  isOutletShop?: boolean
}>(), {
  isOutletShop: false
})

const emit = defineEmits(['image-error'])
const { markImageAsFailed } = useImageGuard()
const { isUser, isAdmin } = useAdminAuth()

const handleImageError = () => {
  if (props.product.image) {
    markImageAsFailed(props.product.image)
    emit('image-error', props.product.image)
  }
}

const detailPath = computed(() => {
  if (!props.product.slug) return ''
  return `/san-pham/${props.product.slug}`
})

const deterministicDiscount = computed(() => {
  const idStr = String(props.product.id || props.product.title.length + '-' + props.product.title.charCodeAt(0))
  const hash = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return (hash % 21) + 10 // Random between 10 and 30
})

const numericDiscount = computed(() => {
  if (props.product.discount) {
    const match = String(props.product.discount).match(/\d+/)
    if (match) return Number(match[0])
  }
  return deterministicDiscount.value
})

const discountPercent = computed(() => {
  return `-${numericDiscount.value}%`
})

const productBrand = computed(() => {
  return props.product.brand || 'OEM'
})

// Load all images from the logo directory dynamically
const brandImages = import.meta.glob('~/assets/img/brand/logo h\u00e3ng/*.{png,jpg,jpeg,svg}', { eager: true, import: 'default' })

const getBrandImage = (brand: string) => {
  if (!brand || brand === 'OEM') return null;
  const normalized = brand.toLowerCase();
  for (const path in brandImages) {
    if (path.toLowerCase().includes(`/${normalized}.`)) {
      return brandImages[path] as string;
    }
  }
  return null;
}

const displayOldPrice = computed(() => {
  if (props.product.oldPrice && props.product.oldPrice > props.product.price) return props.product.oldPrice;
  const priceNum = typeof props.product.price === 'number' ? props.product.price : Number(String(props.product.price).replace(/[^\d]/g, ''))
  if (priceNum > 0) {
    const factor = 1 - (numericDiscount.value / 100)
    // Round to nearest 1000
    return Math.round((priceNum / factor) / 1000) * 1000;
  }
  return null;
})

// Giá hiển thị chính (đã được tính đúng từ useHomeProducts/useManualGroups)
// - Chưa đăng nhập: = apiPrice (giá bán lẻ)
// - Đã đăng nhập  : = calculateAdjustedPrice(apiDiscount, userTier)
const membershipPrice = computed(() => {
  const priceNum = typeof props.product.price === 'number'
    ? props.product.price
    : Number(String(props.product.price).replace(/[^\d]/g, ''))
  return priceNum
})

// Giá gốc để gạch ngang (rawPrice = giá NPP trước khi apply tier)
// Chỉ hiển thị khi đã đăng nhập và có sự khác biệt giá
const basePrice = computed(() => {
  const p = props.product as any
  const raw = p.rawPrice || p.oldPrice || null
  if (!raw) return membershipPrice.value
  const rawNum = typeof raw === 'number' ? raw : Number(String(raw).replace(/[^\d]/g, ''))
  return rawNum > 0 ? rawNum : membershipPrice.value
})

// Hiển thị giá gạch khi giá hiện tại (discount/ưu đãi) thấp hơn giá gốc (rawPrice/originalPrice)
// Đã đăng nhập: price=apiDiscount, basePrice=rawPrice=apiPrice → hiển nếu có chênh lệch
// Chưa đăng nhập: price=apiPrice, basePrice=rawPrice=apiPrice → bằng nhau → không hiển
const showOriginalPrice = computed(() => {
  return basePrice.value > membershipPrice.value && membershipPrice.value > 0
})

const reviewCount = computed(() => {
  if (props.product.reviews !== undefined) return props.product.reviews
  const idStr = String(props.product.id || props.product.title.length)
  const hash = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return (hash % 20) + 5
})

const formatPriceObj = (value: number | string) => {
  if (typeof value === 'number') {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const digits = value.toString().replace(/[^\d]/g, '')
  if (!digits) return '0'
  return Number(digits).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
</script>

<style scoped>
.product-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.2s, border-color 0.2s;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-color: #ddd;
}

.discount-ribbon {
  position: absolute;
  top: 10px;
  right: -24px;
  background: #da251d;
  color: #fff;
  padding: 2px 24px;
  font-size: 10px;
  font-weight: 600;
  transform: rotate(45deg);
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  text-align: center;
  width: 90px;
}

.card-link {
  display: flex;
  flex-direction: column;
  color: inherit;
  text-decoration: none;
  height: 100%;
}

.thumb-wrap {
  height: 180px;
  padding: 10px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.product-img.placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #f9f9f9, #ececec);
}

.card-info {
  padding: 0 10px 10px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-title {
  margin: 0 0 6px;
  color: #333;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
  height: 39.2px; /* 2 lines of text */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.brand-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: auto 0 12px;
}

.brand-name {
  color: #0073e6;
  font-size: 13px;
  margin: 0;
}

.brand-name-img {
  height: 20px;
  width: auto;
  object-fit: contain;
  object-position: left center;
  display: block;
}

.price-rating-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top: auto;
}

.price-col {
  display: flex;
  flex-direction: column;
}

.current-price {
  color: #da251d;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.2;
}

.old-price {
  color: #888;
  font-size: 11px;
  text-decoration: line-through;
  margin-top: 2px;
}

.rating-col {
  display: flex;
  align-items: center;
  gap: 3px;
  padding-top: 2px;
}

.stars {
  display: flex;
  color: #fca311;
  gap: 1px;
}

.star-icon {
  width: 11px;
  height: 11px;
  fill: currentColor;
}

.review-count {
  font-size: 12px;
  color: #888;
}

@media (max-width: 1200px) {
  .current-price {
    font-size: 14px;
  }
  .thumb-wrap {
    height: 150px;
  }
}

@media (max-width: 600px) {
  .price-rating-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .current-price {
    white-space: nowrap;
    font-size: 14px;
  }
  
  .old-price {
    white-space: nowrap;
  }

  .rating-col {
    padding-top: 0;
  }
}
</style>
