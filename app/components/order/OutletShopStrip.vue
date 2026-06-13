<template>
  <section class="outlet-shop">
    <div class="outlet-head">
      <h3>OUTLET SHOP</h3>
      <div class="head-actions">
        <div class="nav-buttons" v-if="items.length > 4">
          <button class="nav-btn prev" @click="scroll('left')" aria-label="Previous">&lsaquo;</button>
          <button class="nav-btn next" @click="scroll('right')" aria-label="Next">&rsaquo;</button>
        </div>
        <NuxtLink to="/nhom-san-pham/outlet-shop">Xem tat ca &rsaquo;</NuxtLink>
      </div>
    </div>

    <div class="outlet-grid-wrapper">
      <div class="outlet-grid" ref="scrollContainer">
        <div v-for="item in items" :key="item.id" class="outlet-card-wrapper">
          <NuxtLink :to="`/san-pham/${item.slug}`" class="outlet-card">
            <div v-if="item.discountPercent" class="discount-ribbon">{{ item.discountPercent }}</div>

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

            <div class="card-info">
              <p class="title">{{ item.title }}</p>
              <p class="brand">{{ item.brand || 'Sunhouse' }}</p>
            </div>

            <div class="price-box">
              <div class="price-col">
                <strong class="current-price">{{ formatPrice(item.membershipPrice) }}d</strong>
                <small v-if="item.showOriginalPrice" class="old-price">{{ formatPrice(item.basePrice) }}d</small>
              </div>
              <div class="countdown-col">
                <span class="countdown-label">Ket thuc sau</span>
                <span class="countdown-val">{{ item.endIn }}</span>
                <span class="stock-val">Con <strong>{{ item.stock }}</strong></span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useImageGuard } from '~/composables/useImageGuard'
import { useOutletShopProducts } from '~/composables/useOutletShopProducts'
import { useAdminAuth } from '~/composables/useAdminAuth'

const { isImageFailed, markImageAsFailed } = useImageGuard()
const scrollContainer = ref<HTMLElement | null>(null)

const { products, fetchOutletShopProducts } = useOutletShopProducts()
const { isUser, isAdmin } = useAdminAuth()
const isLoggedIn = computed(() => isUser.value || isAdmin.value)

onMounted(() => {
  fetchOutletShopProducts()
})

const getDeterministicDiscount = (item: any) => {
  const idStr = String(item.id || item.title.length + '-' + item.title.charCodeAt(0))
  const hash = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return (hash % 21) + 10
}

const getNumericDiscount = (item: any) => {
  if (item.discountText) {
    const match = String(item.discountText).match(/\d+/)
    if (match) return Number(match[0])
  }
  return getDeterministicDiscount(item)
}

const getDiscountPercent = (item: any) => {
  if (item.discountText) return item.discountText
  return `-${getNumericDiscount(item)}%`
}

const items = computed(() => {
  if (!products.value || !products.value.length) return []

  return products.value
    .filter((item) => !isImageFailed(item.image))
    .slice(0, 10)
    .map((item, idx) => {
      // Products từ useOutletShopProducts đã được tính giá đúng
      const membershipPrice = item.price
      const basePrice = item.rawPrice
      const showOriginalPrice = basePrice > membershipPrice && membershipPrice > 0

      return {
        id: item.id,
        slug: item.slug,
        title: item.title,
        brand: item.brand || 'Sunhouse',
        image: item.image,
        membershipPrice: membershipPrice,
        basePrice: basePrice,
        showOriginalPrice: showOriginalPrice,
        discountPercent: isLoggedIn.value ? getDiscountPercent({ ...item, discountText: item.discount }) : null,
        endIn: `${Math.max(3, 20 - idx * 2)} ngay`,
        stock: Math.max(2, 18 - idx * 2)
      }
    })
})

const scroll = (direction: 'left' | 'right') => {
  if (!scrollContainer.value) return
  const scrollAmount = 600
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
.outlet-shop {
  margin-top: 12px;
  background: #4d90e0;
  border-radius: 4px;
}

.outlet-head {
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
}

.outlet-head h3 {
  margin: 0;
  font-size: 24px;
  color: #fff;
}

.outlet-head a {
  color: #fff;
  text-decoration: none;
  font-weight: 500;
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
  background: #fff;
  border: 1px solid #ddd;
  color: #333;
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
  background: #f1f1f1;
}

.outlet-grid-wrapper {
  position: relative;
  width: 100%;
}

.outlet-grid {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 12px;
  padding: 0 4px 8px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.outlet-grid::-webkit-scrollbar {
  display: none;
}

.outlet-card-wrapper {
  flex: 0 0 calc(20% - 9.6px);
  min-width: 200px;
}

.outlet-card {
  background: #fff;
  border: 2px solid #3b82f6;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.outlet-card:hover {
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.discount-ribbon {
  position: absolute;
  top: 10px;
  right: -24px;
  background: #da251d;
  color: #fff;
  padding: 2px 24px;
  font-size: 12px;
  font-weight: 600;
  transform: rotate(45deg);
  z-index: 2;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
  text-align: center;
  width: 90px;
}

.thumb {
  height: 200px;
  background: #fff;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.thumb-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #f4f4f4, #cdcdcd);
}

.card-info {
  padding: 0 10px 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 14px;
  color: #da251d;
  line-height: 1.4;
  height: 39.2px;
  margin: 0 0 6px;
  font-weight: 400;
}

.brand {
  color: #0073e6;
  font-size: 13px;
  margin: auto 0 8px;
}

.price-box {
  background: #da251d;
  color: #fff;
  padding: 8px 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin: 0 4px 4px;
  border-radius: 2px;
}

.price-col {
  display: flex;
  flex-direction: column;
}

.current-price {
  display: block;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}

.old-price {
  display: block;
  font-size: 11px;
  text-decoration: line-through;
  opacity: 0.9;
  margin-top: 2px;
}

.countdown-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  line-height: 1.3;
}

.countdown-label {
  font-size: 11px;
}

.countdown-val {
  font-size: 12px;
  font-weight: 500;
}

.stock-val {
  font-size: 11px;
  margin-top: 2px;
}

.stock-val strong {
  font-size: 12px;
  font-weight: 700;
}

@media (max-width: 1200px) {
  .outlet-card-wrapper {
    flex: 0 0 calc(25% - 9px);
  }

  .thumb {
    height: 160px;
  }
}

@media (max-width: 768px) {
  .outlet-card-wrapper {
    flex: 0 0 calc(60% - 6px);
    min-width: 180px;
  }

  .nav-buttons {
    display: none;
  }

  .current-price {
    font-size: 14px;
  }
}
</style>