<template>
  <section class="top-selling-row">
    <article v-for="item in quickDeals" :key="item.name" class="deal-item">
      <div class="deal-icon" :style="{ background: item.color }">{{ item.icon }}</div>
      <p>{{ item.name }}</p>
      <strong>{{ item.price }}</strong>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHomeProducts } from '~/composables/useHomeProducts'

const fallbackDeals = [
  { icon: '📺', name: 'Mua Tivi chỉ từ', price: '2.590.000đ', color: '#5b2cd5' },
  { icon: '🧊', name: 'Tủ lạnh giá chỉ từ', price: '2.450.000đ', color: '#2f6ca7' },
  { icon: '🧺', name: 'Máy giặt chỉ từ', price: '3.290.000đ', color: '#2b73bf' },
  { icon: '🫧', name: 'Máy lọc không khí giá từ', price: '1.290.000đ', color: '#7dc7ea' },
  { icon: '🚰', name: 'Cây nước nóng lạnh giá từ', price: '990.000đ', color: '#7fdce9' },
  { icon: '🧹', name: 'Máy hút bụi giảm tới', price: '40%', color: '#f4b263' },
  { icon: '☕', name: 'Máy pha cà phê giá từ', price: '899.000đ', color: '#cdc389' },
  { icon: '💧', name: 'Bình nóng lạnh giá từ', price: '1.490.000đ', color: '#e7d772' }
]

const colors = ['#5b2cd5', '#2f6ca7', '#2b73bf', '#7dc7ea', '#7fdce9', '#f4b263', '#cdc389', '#e7d772']

const iconByName = (name: string) => {
  const key = name.toLowerCase()
  if (key.includes('tivi')) return '📺'
  if (key.includes('tủ') || key.includes('tu')) return '🧊'
  if (key.includes('giặt') || key.includes('giat')) return '🧺'
  if (key.includes('lọc') || key.includes('loc')) return '🫧'
  if (key.includes('nóng') || key.includes('nuoc')) return '🚰'
  if (key.includes('bụi') || key.includes('bui')) return '🧹'
  if (key.includes('cà phê') || key.includes('ca phe') || key.includes('coffee') || key.includes('pha')) return '☕'
  return '🛍️'
}

const formatPrice = (price: number) => `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ`

const { products } = useHomeProducts()

const quickDeals = computed(() => {
  if (!products.value.length) return fallbackDeals

  const grouped = new Map<string, { minPrice: number; sold: number }>()

  for (const item of products.value) {
    const name = item.category || 'Sản phẩm nổi bật'
    const current = grouped.get(name)

    if (!current) {
      grouped.set(name, { minPrice: item.price, sold: item.sold || 0 })
      continue
    }

    grouped.set(name, {
      minPrice: Math.min(current.minPrice, item.price),
      sold: current.sold + (item.sold || 0)
    })
  }

  const mapped = Array.from(grouped.entries())
    .sort((a, b) => b[1].sold - a[1].sold)
    .slice(0, 8)
    .map(([name, data], idx) => ({
      icon: iconByName(name),
      name: `${name} giá từ`,
      price: formatPrice(data.minPrice),
      color: colors[idx % colors.length]
    }))

  return mapped.length ? mapped : fallbackDeals
})
</script>

<style scoped>
.top-selling-row {
  background: #fff;
  border: 1px solid #d9d9d9;
  border-top: none;
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 4px;
  padding: 20px 14px;
}

.deal-item {
  text-align: center;
}

.deal-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 30px;
}

.deal-item p {
  font-size: 14px;
  line-height: 1.25;
  color: #1f1f1f;
  margin: 0;
}

.deal-item strong {
  display: block;
  margin-top: 3px;
  color: #1d1d1d;
  font-size: 20px;
}

@media (max-width: 1200px) {
  .top-selling-row {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    row-gap: 14px;
  }

  .deal-item strong {
    font-size: 16px;
  }

  .deal-item p {
    font-size: 12px;
  }
}

@media (max-width: 640px) {
  .top-selling-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
