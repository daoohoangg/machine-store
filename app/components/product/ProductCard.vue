<template>
  <div class="product-card" :class="{ 'list-view': isListView }">
    <div class="product-img-wrapper">
      <div class="product-img"></div>
      <div class="discount-badge" v-if="product.discount">{{ product.discount }}</div>
      <div class="gift-badge" v-if="product.gift">🎁 TẶNG QUÀ</div>
    </div>
    
    <div class="product-info">
      <h4 class="product-title">{{ product.title }}</h4>
      <p class="product-desc" v-if="isListView && product.desc">{{ product.desc }}</p>
      
      <div class="rating" v-if="product.ratingCount">
        <span class="stars">★★★★★</span>
        <span class="count">({{ product.ratingCount }})</span>
      </div>
      <div class="price-row">
        <span class="current-price">{{ product.price }} đ</span>
        <span class="old-price" v-if="product.oldPrice">{{ product.oldPrice }} đ</span>
      </div>
    </div>
    
    <div class="action-row">
      <button class="buy-btn" @click.stop="handleAddToCart">MUA NGAY</button>
    </div>
  </div>
</template>

<script setup>
import { useCart } from '~/composables/useCart'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  isListView: {
    type: Boolean,
    default: false
  }
})

const { addToCart } = useCart()
const router = useRouter()

const handleAddToCart = () => {
  addToCart(props.product)
  router.push('/checkout')
}
</script>

<style scoped>
.product-card {
  border-right: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 15px;
  position: relative;
  display: flex;
  flex-direction: column;
  background: #fff;
  transition: box-shadow 0.2s;
  height: 100%;
}
.product-card:hover {
  box-shadow: 0 0 10px rgba(0,0,0,0.15);
  z-index: 1;
}

/* List View Styles */
.product-card.list-view {
  flex-direction: row;
  height: auto;
  gap: 20px;
  padding: 20px;
}
.product-card.list-view .product-img-wrapper {
  width: 200px;
  height: 200px;
  margin-bottom: 0;
  flex-shrink: 0;
}
.product-card.list-view .product-info {
  flex-direction: column;
  justify-content: flex-start;
}
.product-card.list-view .product-title {
  height: auto;
  font-size: 15px;
  font-weight: bold;
  -webkit-line-clamp: unset;
  margin-bottom: 10px;
}
.product-card.list-view .product-desc {
  font-size: 13px;
  color: #666;
  margin-top: 10px;
  line-height: 1.5;
}
.product-card.list-view .price-row {
  margin-top: auto;
  margin-bottom: 5px;
  order: 2; /* Move below rating if needed */
}
.product-card.list-view .rating {
  order: 1; /* Move above price */
  margin-bottom: 5px;
}
.product-card.list-view .action-row {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 150px;
  margin-top: 0;
}

/* Grid View Styles (Default) */
.product-img-wrapper {
  position: relative;
  width: 100%;
  height: 180px;
  margin-bottom: 10px;
}
.product-img {
  width: 100%;
  height: 100%;
  background: #f1f1f1;
  border-radius: 4px;
}
.discount-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #ff9800;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 3px 8px;
  border-radius: 12px;
}
.gift-badge {
  position: absolute;
  bottom: 5px;
  left: 5px;
  background: #d4161c;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 3px 6px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 3px;
}
.product-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.product-title {
  font-size: 13px;
  font-weight: normal;
  color: #333;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 36px;
}
.rating {
  font-size: 11px;
  color: #f5a623;
  margin-bottom: 6px;
}
.rating .count {
  color: #999;
  margin-left: 5px;
}
.price-row {
  margin-bottom: 15px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.current-price {
  color: #d4161c;
  font-weight: bold;
  font-size: 15px;
}
.old-price {
  color: #999;
  text-decoration: line-through;
  font-size: 12px;
}
.action-row {
  margin-top: auto;
}
.buy-btn {
  width: 100%;
  background: transparent;
  color: #0066cc;
  border: 1px solid #0066cc;
  padding: 8px;
  text-align: center;
  border-radius: 4px;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}
.buy-btn:hover {
  background: #0066cc;
  color: white;
}
</style>
