<template>
  <section class="product-section">
    <div class="section-head">
      <h3>💡 Gợi ý cho bạn</h3>
    </div>

    <div class="product-grid">
      <ProductCard v-for="item in products" :key="item.title" :product="item" />
    </div>

    <div class="section-foot">
      <button class="more-btn">Xem thêm sản phẩm ▼</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProductCard from '~/components/product/ProductCard.vue'
import { useHomeProducts } from '~/composables/useHomeProducts'

const fallbackProducts = [
  { title: 'TV thông minh Coocaa Full HD 43 inch', price: 4190000, discount: '-28%', sold: 679, soldPercent: 72, specs: ['43 inch', 'HD', 'Linux'] },
  { title: 'TV thông minh Coocaa HD 32 inch', price: 2990000, discount: '-23%', sold: 701, soldPercent: 74, specs: ['32 inch', 'HD', 'Linux'] },
  { title: 'Quạt treo tường Vinawind', price: 559000, discount: '-20%', sold: 1667, soldPercent: 82 },
  { title: 'Quạt sàn công nghiệp Ching Hai', price: 590000, discount: '-25%', sold: 499, soldPercent: 46 },
  { title: 'Máy hút ẩm LG Dual Inverter', price: 9990000, discount: '-23%', sold: 133, soldPercent: 28 },
  { title: 'Máy hút ẩm kết hợp lọc khí Electrolux', price: 7790000, discount: '-18%', sold: 185, soldPercent: 36 },
  { title: 'Tủ lạnh LG Inverter 266 lít', price: 5990000, discount: '-33%', sold: 21, soldPercent: 14 },
  { title: 'Tủ lạnh mini Hisense 82 lít', price: 3390000, discount: '-25%', sold: 118, soldPercent: 37 },
  { title: 'Máy giặt Electrolux UltimateCare 300', price: 8490000, discount: '-29%', sold: 20, soldPercent: 12 },
  { title: 'Máy giặt Electrolux UltimateCare 500', price: 8490000, discount: '-29%', sold: 36, soldPercent: 14 },
  { title: 'Máy sấy quần áo 15kg Whirlpool', price: 17490000, discount: '-13%', sold: 226, soldPercent: 40 },
  { title: 'Máy sấy thông hơi Electrolux 9kg', price: 9980000, discount: '-1,0M', sold: 81, soldPercent: 26 },
  { title: 'Điều hòa 1 chiều Funiki Inverter 9000BTU', price: 5590000, discount: '-25%', sold: 267, soldPercent: 44, specs: ['1HP', '<15m²', '1 pha'] },
  { title: 'Điều hòa 2 chiều Funiki 9000BTU', price: 5500000, discount: '-490K', sold: 87, soldPercent: 22, specs: ['1HP', '<15m²', '1 pha'] },
  { title: 'Máy rửa chén bát độc lập Bosch SMS8YCI01E', price: 32590000, discount: '-28%', sold: 17, soldPercent: 11 },
  { title: 'Máy rửa bát độc lập Whirlpool WFE2B19', price: 6790000, discount: '-39%', sold: 21, soldPercent: 12 },
  { title: 'Máy hút bụi Bosch Serie 4', price: 3490000, discount: '-29%', sold: 41, soldPercent: 17 },
  { title: 'Máy hút bụi cầm tay Karcher VCH 2', price: 1090000, discount: '-13%', sold: 86, soldPercent: 24 }
]

const { products: homeProducts } = useHomeProducts()

const products = computed(() => {
  if (!homeProducts.value.length) return fallbackProducts

  return homeProducts.value.slice(0, 18).map((item) => ({
    id: item.id,
    slug: item.slug,
    title: item.title,
    price: item.price,
    discount: item.discount,
    sold: item.sold,
    soldPercent: Math.min(95, Math.max(10, Math.round((item.sold || 20) / 8))),
    image: item.image,
    specs: item.specs || []
  }))
})
</script>

<style scoped>
.product-section {
  margin-top: 12px;
  border: 1px solid #d8d8d8;
  background: #ededed;
  padding: 10px;
}

.section-head {
  margin-bottom: 10px;
}

.section-head h3 {
  margin: 0;
  font-size: 36px;
  color: #222;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.section-foot {
  text-align: center;
  padding: 12px 0 4px;
}

.more-btn {
  border: 1px solid #2a84d8;
  border-radius: 4px;
  background: #fff;
  color: #0869c6;
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .section-head h3 {
    font-size: 26px;
  }

  .product-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .more-btn {
    font-size: 15px;
  }
}

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .section-head h3 {
    font-size: 20px;
  }
}
</style>
