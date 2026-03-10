<template>
  <div class="cart-modal-overlay" @click.self="$emit('close')">
    <div class="cart-modal">
      <!-- Header -->
      <div class="cart-header">
        <div class="cart-title">
          <span class="cart-icon">🛒</span> Giỏ hàng (Có {{ totalItems }} sản phẩm)
        </div>
        <button class="close-btn" @click="$emit('close')">✖ Đóng</button>
      </div>

      <!-- Body -->
      <div class="cart-body" v-if="cart.length > 0">
        <div class="select-all-row">
          <label>
            <input type="checkbox" v-model="isAllSelected" /> Chọn tất cả
          </label>
        </div>

        <div class="cart-items">
          <div v-for="item in cart" :key="item.id" class="cart-item">
            <input 
              type="checkbox" 
              class="item-checkbox"
              :checked="item.selected"
              @change="toggleSelection(item.id)"
            />
            
            <img :src="item.image" :alt="item.title" class="item-img" />
            
            <div class="item-details">
              <h4 class="item-title">{{ item.title }}</h4>
              <div v-if="item.gift" class="item-gift">
                🎁 Tặng áo thun (cho miền Nam)
              </div>
              
              <div class="item-price-row">
                <span class="current-price">{{ formatPrice(item.price) }}đ</span>
                <span v-if="item.oldPrice" class="old-price">{{ formatPrice(item.oldPrice) }}đ</span>
              </div>
            </div>

            <div class="item-actions">
              <div class="qty-controls">
                <button @click="updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">-</button>
                <input type="text" :value="item.quantity" readonly />
                <button @click="updateQuantity(item.id, item.quantity + 1)">+</button>
              </div>
              <button class="remove-btn" @click="removeFromCart(item.id)">
                🗑 Xóa
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="empty-cart" v-else>
        <p>Giỏ hàng của bạn đang trống.</p>
      </div>

      <!-- Footer -->
      <div class="cart-footer" v-if="cart.length > 0">
        <div class="total-row">
          <span class="total-label">Tổng tiền:</span>
          <span class="total-amount">{{ formatPrice(totalPrice) }}đ</span>
        </div>
        
        <button class="checkout-btn" @click="goCheckout">Mua ngay</button>
        
        <div class="installment-btns">
          <button class="installment-btn yellow" @click="goInstallment">
            <strong>Trả góp</strong><br/>
            <small>Duyệt nhanh, Không cần thẻ</small>
          </button>
          <button class="installment-btn yellow" @click="goInstallment">
            <strong>Trả góp qua thẻ</strong><br/>
            <small>Visa, Master, JCB, AMEX</small>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCart } from '~/composables/useCart'

const { 
  cart, 
  totalItems, 
  totalPrice, 
  isAllSelected,
  updateQuantity,
  removeFromCart,
  toggleSelection
} = useCart()

const emit = defineEmits(['close'])
const router = useRouter()

const formatPrice = (price) => {
  if (!price) return '0'
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

const goCheckout = () => {
  emit('close')
  router.push('/checkout')
}

const goInstallment = () => {
  emit('close')
  router.push('/checkout-installment')
}
</script>

<style scoped>
.cart-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.cart-modal {
  background: white;
  width: 600px;
  max-width: 90vw;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  max-height: 90vh; /* Prevent modal from being taller than screen */
}

/* Header */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  background: #f9f9f9;
  border-radius: 8px 8px 0 0;
}
.cart-title {
  font-weight: bold;
  font-size: 16px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}
.close-btn {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #666;
  font-weight: bold;
}

/* Body */
.cart-body {
  padding: 15px 20px;
  overflow-y: auto; /* Allow scrolling if highly populated */
}
.empty-cart {
  padding: 40px;
  text-align: center;
  color: #666;
}
.select-all-row {
  margin-bottom: 15px;
  font-weight: bold;
  font-size: 14px;
}

/* Item Row */
.cart-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px 0;
  border-top: 1px solid #eee;
}
.item-checkbox {
  margin-top: 5px;
}
.item-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border: 1px solid #eee;
}
.item-details {
  flex: 1;
}
.item-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  font-weight: normal;
}
.item-gift {
  color: #d4161c;
  font-size: 12px;
  margin-bottom: 5px;
}
.item-price-row {
  display: flex;
  flex-direction: column;
}
.current-price {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}
.old-price {
  color: #999;
  text-decoration: line-through;
  font-size: 12px;
}

/* Actions */
.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
}
.qty-controls {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}
.qty-controls button {
  background: white;
  border: none;
  width: 25px;
  height: 25px;
  cursor: pointer;
}
.qty-controls button:disabled {
  color: #ccc;
  cursor: not-allowed;
}
.qty-controls input {
  width: 30px;
  height: 25px;
  border: none;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
  text-align: center;
  font-size: 13px;
}
.remove-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 12px;
  cursor: pointer;
}
.remove-btn:hover {
  text-decoration: underline;
}

/* Footer */
.cart-footer {
  padding: 20px;
  background: white;
  border-top: 1px solid #eee;
  border-radius: 0 0 8px 8px;
}
.total-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}
.total-label {
  font-weight: bold;
  color: #d4161c;
  font-size: 14px;
}
.total-amount {
  font-weight: bold;
  color: #d4161c;
  font-size: 18px;
}
.checkout-btn {
  width: 100%;
  background: #009900;
  color: white;
  border: none;
  padding: 12px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}
.checkout-btn:hover {
  background: #008000;
}
.installment-btns {
  display: flex;
  gap: 10px;
}
.installment-btn {
  flex: 1;
  background: #fcd500;
  border: none;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
}
.installment-btn:hover {
  background: #e6c200;
}
.installment-btn strong {
  display: block;
  font-size: 14px;
}
.installment-btn small {
  font-size: 11px;
}
</style>
