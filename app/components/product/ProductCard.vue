<template>
  <article class="product-card">
    <div v-if="discountPercent" class="discount-ribbon">{{ discountPercent }}</div>

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
        <p class="brand-name">{{ productBrand }}</p>

        <div class="price-rating-row">
          <div class="price-col">
            <span class="current-price">{{ formatPriceObj(product.price) }} đ</span>
            <span class="old-price" v-if="displayOldPrice">{{ formatPriceObj(displayOldPrice) }} đ</span>
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
        <p class="brand-name">{{ productBrand }}</p>

        <div class="price-rating-row">
          <div class="price-col">
            <span class="current-price">{{ formatPriceObj(product.price) }} đ</span>
            <span class="old-price" v-if="displayOldPrice">{{ formatPriceObj(displayOldPrice) }} đ</span>
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

const props = defineProps<{
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
}>()

const emit = defineEmits(['image-error'])
const { markImageAsFailed } = useImageGuard()

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

const discountPercent = computed(() => {
  const discount = props.product.discount || ''
  const match = discount.match(/-?\d+\s*%/)
  if (match) return match[0].replace(/\s+/g, '')
  
  if (props.product.oldPrice) {
     return '-15%'
  }
  
  if (props.product.price) {
     return '-34%'
  }
  
  return ''
})

const productBrand = computed(() => {
  return props.product.brand || 'OEM'
})

const displayOldPrice = computed(() => {
  if (props.product.oldPrice) return props.product.oldPrice;
  const priceNum = typeof props.product.price === 'number' ? props.product.price : Number(String(props.product.price).replace(/[^\d]/g, ''))
  if (priceNum > 0) {
    return Math.floor(priceNum * 1.34);
  }
  return null;
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

.brand-name {
  color: #0073e6;
  font-size: 13px;
  margin: auto 0 12px;
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
</style>
