<template>
  <section class="flash-sale">
    <div class="flash-head">
      <h3>⚡ FLASH SALE</h3>
      <div class="head-actions">
        <div class="nav-buttons" v-if="items.length > 4">
          <button class="nav-btn prev" @click="scroll('left')" aria-label="Previous">‹</button>
          <button class="nav-btn next" @click="scroll('right')" aria-label="Next">›</button>
        </div>
        <a href="#">Xem tất cả ›</a>
      </div>
    </div>

    <div class="flash-grid-wrapper">
      <div class="flash-grid" ref="scrollContainer">
        <article v-for="item in items" :key="item.title" class="flash-card">
          <div class="thumb">
            <img
              v-if="item.image"
              :src="item.image"
              :alt="item.title"
              loading="lazy"
              @error="markImageAsFailed(item.image)"
            />
            <div v-else class="thumb-placeholder"></div>
          </div>

          <p class="title">{{ item.title }}</p>
          <p class="brand">{{ item.brand || 'Tuấn Minh' }}</p>

          <div class="price-box">
            <strong>{{ formatPrice(item.price) }}đ</strong>
            <small v-if="item.oldPrice">{{ formatPrice(item.oldPrice) }}đ</small>
            <span class="countdown">Kết thúc sau {{ item.endIn }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHomeProducts } from '~/composables/useHomeProducts'
import { useImageGuard } from '~/composables/useImageGuard'

const { products } = useHomeProducts()
const { isImageFailed, markImageAsFailed } = useImageGuard()
const scrollContainer = ref<HTMLElement | null>(null)

const hasDiscount = (discount: string | null) => Boolean(discount && discount.trim())
const discountValue = (discount: string | null, price: number, oldPrice: number | null) => {
  if (oldPrice && oldPrice > price) return oldPrice - price
  if (!discount) return 0
  const number = Number(discount.replace(/[^\d]/g, ''))
  if (Number.isNaN(number) || number <= 0) return 0
  return number
}

const items = computed(() => {
  if (!products.value.length) return []

  return products.value
    .filter((item) => (hasDiscount(item.discount) || (item.oldPrice || 0) > item.price) && !isImageFailed(item.image))
    .sort((a, b) => discountValue(b.discount, b.price, b.oldPrice) - discountValue(a.discount, a.price, a.oldPrice))
    .slice(0, 10)
    .map((item, idx) => ({
      title: item.title,
      brand: item.brand || 'Tuấn Minh',
      price: item.price,
      oldPrice: item.oldPrice,
      endIn: `${Math.max(3, 20 - idx * 2)} ngày`,
      image: item.image
    }))
})

const scroll = (direction: 'left' | 'right') => {
  if (!scrollContainer.value) return
  const scrollAmount = 600 // Scroll by approximately 3-4 cards
  const currentScroll = scrollContainer.value.scrollLeft
  scrollContainer.value.scroll({
    left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
    behavior: 'smooth'
  })
}

const formatPrice = (value: number | null) => {
  if (!value || value <= 0) return ''
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
</script>

<style scoped>
.flash-sale {
  margin-top: 12px;
  border: 1px solid #4f8edb;
  background: #4f8edb;
}

.flash-head {
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
}

.flash-head h3 {
  margin: 0;
  font-size: 24px;
}

.flash-head a {
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  font-size: 15px;
}

.head-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-buttons {
  display: flex;
  gap: 8px;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  transition: all 0.2s;
  padding-bottom: 3px;
}

.nav-btn:hover {
  background: #fff;
  color: #4f8edb;
}

.flash-grid-wrapper {
  position: relative;
  width: 100%;
}

.flash-grid {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 8px;
  padding: 0 8px 8px;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

/* Hide scrollbar for Chrome, Safari and Opera */
.flash-grid::-webkit-scrollbar {
  display: none;
}

.flash-card {
  flex: 0 0 calc(16.666% - 6.66px); /* 6 items per view */
  min-width: 160px;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.thumb {
  height: 178px;
  background: #fff;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #f4f4f4, #cdcdcd);
}

.title {
  min-height: 38px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  color: #1f1f1f;
  line-height: 1.35;
  margin: 8px 8px 2px;
}

.brand {
  color: #1e7dd7;
  font-size: 13px;
  margin: 0 8px 8px;
}

.price-box {
  background: #df1d1d;
  color: #fff;
  padding: 8px;
}

.price-box strong {
  display: block;
  font-size: 20px;
  font-weight: 800;
}

.price-box small {
  display: block;
  font-size: 12px;
  text-decoration: line-through;
  opacity: 0.9;
}

.countdown {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  text-align: right;
}

@media (max-width: 1200px) {
  .flash-card {
    flex: 0 0 calc(33.333% - 5.33px); /* 3 items per view */
  }

  .flash-head h3 {
    font-size: 22px;
  }

  .flash-head a {
    font-size: 16px;
  }

  .title {
    font-size: 14px;
    min-height: 48px;
  }

  .brand {
    font-size: 13px;
  }

  .price-box strong {
    font-size: 18px;
  }

  .price-box small {
    font-size: 12px;
  }

  .countdown {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .flash-card {
    flex: 0 0 calc(80% - 4px); /* Show 1 full item and part of the next */
    min-width: 240px;
  }

  .nav-buttons {
    display: none;
  }

  .thumb {
    height: 130px;
  }
}
</style>
