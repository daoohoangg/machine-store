<template>
  <section class="flash-sale">
    <div class="flash-head">
      <h3>⚡ GIỜ VÀNG</h3>
      <a href="#">Xem tất cả ›</a>
    </div>

    <div class="flash-grid">
      <article v-for="item in items" :key="item.title" class="flash-card">
        <div class="thumb">
          <img v-if="item.image" :src="item.image" :alt="item.title" loading="lazy" />
          <div v-else class="thumb-placeholder"></div>
        </div>

        <p class="title">{{ item.title }}</p>
        <p class="brand">{{ item.brand || 'Cửa hàng META' }}</p>

        <div class="price-box">
          <strong>{{ formatPrice(item.price) }}đ</strong>
          <small v-if="item.oldPrice">{{ formatPrice(item.oldPrice) }}đ</small>
          <span class="countdown">Kết thúc sau {{ item.endIn }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHomeProducts } from '~/composables/useHomeProducts'

const fallbackItems = [
  { title: 'Tủ lạnh ô tô Alpicool Sword 18 lít', brand: 'Alpicool Việt Nam', price: 3790000, oldPrice: 4460000, endIn: '20 ngày', image: '' },
  { title: 'Tủ lạnh mini Alpicool G22', brand: 'Alpicool Việt Nam', price: 4460000, oldPrice: 4990000, endIn: '20 ngày', image: '' },
  { title: 'Máy hút ẩm Glucklich GLD30 Pro', brand: 'Glucklich', price: 4590000, oldPrice: 4990000, endIn: '3 ngày', image: '' },
  { title: 'Máy phun xịt rửa áp lực cao Bosch Easy AQT', brand: 'Bosch', price: 1990000, oldPrice: 2190000, endIn: '20 ngày', image: '' },
  { title: 'Máy rửa xe Bosch Easy AQT 100', brand: 'Bosch', price: 1790000, oldPrice: 2160000, endIn: '20 ngày', image: '' },
  { title: 'Máy phun xịt rửa Bosch Easy AQT 1000', brand: 'Bosch', price: 1399000, oldPrice: 1990000, endIn: '20 ngày', image: '' }
]

const { products } = useHomeProducts()

const hasDiscount = (discount: string | null) => Boolean(discount && discount.trim())
const discountValue = (discount: string | null, price: number, oldPrice: number | null) => {
  if (oldPrice && oldPrice > price) return oldPrice - price
  if (!discount) return 0
  const number = Number(discount.replace(/[^\d]/g, ''))
  if (Number.isNaN(number) || number <= 0) return 0
  return number
}

const items = computed(() => {
  if (!products.value.length) return fallbackItems

  const mapped = products.value
    .filter((item) => hasDiscount(item.discount) || (item.oldPrice || 0) > item.price)
    .sort((a, b) => discountValue(b.discount, b.price, b.oldPrice) - discountValue(a.discount, a.price, a.oldPrice))
    .slice(0, 6)
    .map((item, idx) => ({
      title: item.title,
      brand: item.brand || 'Cửa hàng META',
      price: item.price,
      oldPrice: item.oldPrice,
      endIn: `${Math.max(3, 20 - idx * 2)} ngày`,
      image: item.image
    }))

  return mapped.length ? mapped : fallbackItems
})

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

.flash-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  padding: 0 8px 8px;
}

.flash-card {
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.thumb {
  height: 178px;
  background: #f1f1f1;
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
  font-size: 14px;
  color: #1f1f1f;
  line-height: 1.3;
  margin: 8px 8px 2px;
  min-height: 54px;
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
  .flash-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
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
  .flash-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .thumb {
    height: 130px;
  }
}
</style>
