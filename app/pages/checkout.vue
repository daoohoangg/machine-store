<template>
  <div class="checkout-page">
    <section class="checkout-form-card">
      <h3 class="card-title">📍 Địa chỉ nhận hàng</h3>

      <div class="input-row two-col">
        <label>
          <span>Họ và Tên <em>*</em></span>
          <input v-model="form.fullName" type="text" placeholder="Họ và tên" />
        </label>
        <label>
          <span>Số điện thoại <em>*</em></span>
          <input v-model="form.phone" type="text" placeholder="Nhập số điện thoại" />
        </label>
      </div>

      <div class="input-row">
        <span class="label-title">Địa chỉ <em>*</em></span>
        <div class="three-col">
          <label>
            <select v-model="form.city">
              <option value="">Tỉnh/Thành phố</option>
              <option>Hà Nội</option>
              <option>TP.HCM</option>
              <option>Đà Nẵng</option>
            </select>
          </label>
          <label>
            <select v-model="form.district">
              <option value="">Quận/Huyện/Thị Xã</option>
            </select>
          </label>
          <label>
            <select v-model="form.ward">
              <option value="">Phường/Xã/Thị trấn</option>
            </select>
          </label>
        </div>
      </div>

      <div class="input-row">
        <input v-model="form.address" type="text" placeholder="Số nhà, tên đường, thôn, xóm, khóm, ấp..." />
      </div>

      <label class="check-row"><input v-model="form.otherReceiver" type="checkbox" /> Gọi người khác nhận hàng (nếu có)</label>

      <h3 class="card-title">🧾 Hình thức thanh toán (Nhấn để chọn) <em>*</em></h3>

      <div class="payment-box">
        <label class="radio-row"><input v-model="form.payment" type="radio" value="cod" /> Giao hàng và thu tiền tại nhà (COD)</label>
        <label class="radio-row"><input v-model="form.payment" type="radio" value="bank" /> Chuyển khoản qua Ngân hàng, quét mã QR</label>
        <label class="radio-row"><input v-model="form.payment" type="radio" value="online" /> Thanh toán trực tuyến</label>
        <label class="radio-row"><input v-model="form.payment" type="radio" value="bnpl" /> Mua trước trả sau - BNPL</label>
      </div>

      <label class="check-row"><input v-model="form.needInvoice" type="checkbox" /> Yêu cầu Tuấn Minh xuất hóa đơn</label>
      <label class="check-row"><input v-model="form.needEmail" type="checkbox" /> Nhập email để theo dõi đơn hàng</label>

      <textarea v-model="form.note" rows="2" placeholder="Để lại lời nhắn cho Tuấn Minh (nếu có)"></textarea>

      <button class="submit-btn" :disabled="selectedItems.length === 0" @click="submitOrder">🛒 Gửi đơn hàng</button>
    </section>

    <section class="checkout-cart-card">
      <h3 class="card-title">🛒 Danh sách sản phẩm</h3>

      <label class="check-row select-all"><input type="checkbox" v-model="isAllSelected" /> Chọn tất cả</label>

      <div v-if="cart.length === 0" class="empty">Giỏ hàng đang trống.</div>

      <div v-else class="items">
        <div v-for="item in cart" :key="item.id" class="item-row">
          <input type="checkbox" :checked="item.selected" @change="toggleSelection(item.id)" />

          <img :src="item.image" :alt="item.title" class="thumb" />

          <div class="item-main">
            <p class="name">{{ item.title }}</p>
            <p class="gift" v-if="item.gift">🎁 Tặng áo thun (cho miền Nam)</p>
          </div>

          <div class="item-price">
            <p>{{ formatPrice(item.price) }}đ</p>
            <p v-if="item.oldPrice" class="old">{{ formatPrice(item.oldPrice) }}đ</p>
          </div>

          <div class="qty">
            <button @click="updateQuantity(item.id, item.quantity - 1)" :disabled="item.quantity <= 1">-</button>
            <span>{{ item.quantity }}</span>
            <button @click="updateQuantity(item.id, item.quantity + 1)">+</button>
          </div>

          <button class="remove" @click="removeFromCart(item.id)">🗑 Xóa</button>
        </div>
      </div>

      <div class="summary" v-if="cart.length > 0">
        <p><span>Tiền hàng:</span> <strong>{{ formatPrice(totalPrice) }}đ</strong></p>
        <p><span>Vận chuyển:</span> <strong>Chưa rõ</strong></p>
        <p class="total"><span>Tổng tiền:</span> <strong>{{ formatPrice(totalPrice) }}đ</strong></p>
        <a class="coupon" href="#">🏷 Mã khuyến mại</a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useCart } from '~/composables/useCart'
import { useOrder } from '~/composables/useOrder'

definePageMeta({
  layout: 'checkout'
})

const {
  cart,
  totalPrice,
  isAllSelected,
  updateQuantity,
  removeFromCart,
  toggleSelection
} = useCart()
const { createOrder } = useOrder()
const router = useRouter()

const selectedItems = computed(() => cart.value.filter((item) => item.selected))

const form = reactive({
  fullName: '',
  phone: '',
  city: '',
  district: '',
  ward: '',
  address: '',
  otherReceiver: false,
  payment: 'cod',
  needInvoice: false,
  needEmail: false,
  note: ''
})

const formatPrice = (price: number | null) => {
  if (!price) return '0'
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const submitOrder = () => {
  if (selectedItems.value.length === 0) return

  createOrder({
    receiver: {
      fullName: form.fullName || 'Khách hàng',
      phone: form.phone || '0000000000',
      address: form.address || 'Chưa có địa chỉ',
      city: form.city,
      district: form.district,
      ward: form.ward
    },
    items: cart.value,
    paymentMethod: form.payment,
    note: form.note,
    type: 'normal'
  })

  router.push('/order/verify')
}
</script>

<style scoped>
.checkout-page {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  align-items: start;
}

.checkout-form-card,
.checkout-cart-card {
  background: #fff;
  border: 1px solid #ddd;
  padding: 10px;
}

.card-title {
  font-size: 21px;
  margin: 0 0 8px;
}

.card-title em,
.label-title em {
  color: #e60000;
  font-style: normal;
}

.label-title {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
}

.input-row {
  margin-bottom: 10px;
}

.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.three-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

label {
  display: block;
}

label > span {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
}

input[type='text'],
select,
textarea {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 14px;
}

.check-row,
.radio-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.payment-box {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.submit-btn {
  margin-top: 8px;
  background: #0a9a0a;
  border: none;
  color: #fff;
  font-size: 26px;
  font-weight: 700;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.items {
  border-top: 1px solid #eee;
}

.item-row {
  display: grid;
  grid-template-columns: 22px 78px 1fr 120px 100px 70px;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.thumb {
  width: 75px;
  height: 75px;
  border: 1px solid #ddd;
  object-fit: cover;
}

.name {
  margin: 0;
  font-size: 15px;
}

.gift {
  margin: 4px 0 0;
  color: #d4161c;
  font-size: 14px;
}

.item-price p {
  margin: 0;
  text-align: right;
}

.item-price .old {
  text-decoration: line-through;
  color: #888;
}

.qty {
  display: grid;
  grid-template-columns: 30px 34px 30px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.qty button,
.qty span {
  height: 30px;
  border: none;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty span {
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
}

.remove {
  border: none;
  background: none;
  color: #666;
  cursor: pointer;
}

.summary {
  margin-top: 10px;
  width: 300px;
  margin-left: auto;
}

.summary p {
  display: flex;
  justify-content: space-between;
  margin: 4px 0;
}

.summary .total,
.summary .total strong {
  color: #d4161c;
}

.coupon {
  color: #0a67c7;
  margin-top: 8px;
  display: inline-block;
}

.empty {
  padding: 12px 0;
  color: #666;
}

@media (max-width: 1200px) {
  .checkout-page {
    grid-template-columns: 1fr;
  }

  .item-row {
    grid-template-columns: 22px 72px 1fr;
  }

  .item-price,
  .qty,
  .remove {
    grid-column: 3;
    justify-self: start;
  }

  .summary {
    width: 100%;
  }
}
</style>
