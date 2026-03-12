<template>
  <article class="product-card">
    <NuxtLink v-if="detailPath" :to="detailPath" class="card-link" :aria-label="product.title">
      <span v-if="product.discount" class="discount-badge">{{ product.discount }}</span>

      <div v-if="product.specs?.length" class="spec-row">
        <span v-for="(spec, idx) in product.specs" :key="`${spec}-${idx}`">{{ spec }}</span>
      </div>

      <div class="thumb-wrap">
        <img
          v-if="product.image"
          class="product-img"
          :src="product.image"
          :alt="product.title"
          loading="lazy"
        />
        <div v-else class="product-img placeholder"></div>
      </div>

      <h4 class="product-title">{{ product.title }}</h4>
      <p class="price">{{ formatPrice(product.price) }} đ</p>

      <div class="sold-bar">
        <span class="sold-fill" :style="{ width: `${soldPercent}%` }"></span>
        <small>Đã bán {{ product.sold || 0 }}</small>
      </div>
    </NuxtLink>

    <div v-else class="card-link">
      <span v-if="product.discount" class="discount-badge">{{ product.discount }}</span>

      <div v-if="product.specs?.length" class="spec-row">
        <span v-for="(spec, idx) in product.specs" :key="`${spec}-${idx}`">{{ spec }}</span>
      </div>

      <div class="thumb-wrap">
        <img
          v-if="product.image"
          class="product-img"
          :src="product.image"
          :alt="product.title"
          loading="lazy"
        />
        <div v-else class="product-img placeholder"></div>
      </div>

      <h4 class="product-title">{{ product.title }}</h4>
      <p class="price">{{ formatPrice(product.price) }} đ</p>

      <div class="sold-bar">
        <span class="sold-fill" :style="{ width: `${soldPercent}%` }"></span>
        <small>Đã bán {{ product.sold || 0 }}</small>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  product: {
    id?: string
    slug?: string
    title: string
    price: number | string
    sold?: number
    soldPercent?: number
    discount?: string | null
    image?: string
    specs?: string[]
  }
}>()

const detailPath = computed(() => {
  if (!props.product.slug) return ''
  return `/san-pham/${props.product.slug}`
})

const soldPercent = computed(() => {
  const raw = Number(props.product.soldPercent || 0)
  if (Number.isNaN(raw)) return 0
  return Math.min(100, Math.max(6, raw))
})

const formatPrice = (value: number | string) => {
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
  border: 1px solid #d8d8d8;
  border-radius: 6px;
  position: relative;
}

.card-link {
  display: block;
  position: relative;
  color: inherit;
  padding: 8px;
}

.discount-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ff9800;
  color: #fff;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 10px;
  z-index: 2;
}

.spec-row {
  display: flex;
  gap: 12px;
  color: #999;
  font-size: 11px;
  margin-bottom: 6px;
}

.thumb-wrap {
  height: 150px;
  border-radius: 4px;
  overflow: hidden;
  background: #f3f3f3;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.product-img.placeholder {
  background: linear-gradient(145deg, #f1f1f1, #d6d6d6);
}

.product-title {
  margin: 10px 0 8px;
  color: #1d1d1d;
  font-size: 14px;
  line-height: 1.35;
  min-height: 56px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price {
  margin: 0 0 8px;
  color: #df1f12;
  font-size: 34px;
  font-weight: 800;
  line-height: 1;
}

.sold-bar {
  position: relative;
  height: 16px;
  border-radius: 999px;
  background: #cfcfcf;
  overflow: hidden;
}

.sold-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: #ff9100;
}

.sold-bar small {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

@media (max-width: 1200px) {
  .price {
    font-size: 18px;
  }

  .thumb-wrap {
    height: 130px;
  }
}
</style>
