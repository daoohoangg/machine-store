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
            <select v-model="selectedProvinceCode" @change="onProvinceChange">
              <option value="">Tỉnh/Thành phố</option>
              <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
            </select>
          </label>
          <label>
            <select v-model="selectedDistrictCode" @change="onDistrictChange" :disabled="!selectedProvinceCode">
              <option value="">Quận/Huyện/Thị Xã</option>
              <option v-for="d in districts" :key="d.code" :value="d.code">{{ d.name }}</option>
            </select>
          </label>
          <label>
            <select v-model="selectedWardCode" @change="onWardChange" :disabled="!selectedDistrictCode">
              <option value="">Phường/Xã/Thị trấn</option>
              <option v-for="w in wards" :key="w.code" :value="w.code">{{ w.name }}</option>
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

      <div class="security-box">
        <NuxtTurnstile v-model="turnstileToken" />
      </div>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

      <button class="submit-btn" :disabled="selectedItems.length === 0 || isSendingOtp" @click="submitOrder">
        <span v-if="isSendingOtp">Đang xử lý...</span>
        <span v-else>🛒 Gửi đơn hàng</span>
      </button>
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
import { reactive, computed, onMounted, ref } from 'vue'
import { useCart } from '~/composables/useCart'
import { useOrder } from '~/composables/useOrder'
import { useLocations } from '~/composables/useLocations'

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
const { provinces, districts, wards, fetchProvinces, fetchDistricts, fetchWards } = useLocations()
const router = useRouter()

const selectedProvinceCode = ref('')
const selectedDistrictCode = ref('')
const selectedWardCode = ref('')

onMounted(async () => {
  await fetchProvinces()
})

const onProvinceChange = async () => {
  form.district = ''
  form.ward = ''
  selectedDistrictCode.value = ''
  selectedWardCode.value = ''
  
  const province = provinces.value.find(p => p.code == selectedProvinceCode.value)
  form.city = province ? province.name : ''
  if (selectedProvinceCode.value) {
    await fetchDistricts(selectedProvinceCode.value)
  }
}

const onDistrictChange = async () => {
  form.ward = ''
  selectedWardCode.value = ''
  
  const district = districts.value.find(d => d.code == selectedDistrictCode.value)
  form.district = district ? district.name : ''
  if (selectedDistrictCode.value) {
    await fetchWards(selectedDistrictCode.value)
  }
}

const onWardChange = () => {
  const ward = wards.value.find(w => w.code == selectedWardCode.value)
  form.ward = ward ? ward.name : ''
}

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

const turnstileToken = ref('')
const isSendingOtp = ref(false)
const errorMsg = ref('')

const submitOrder = async () => {
  if (selectedItems.value.length === 0) {
     errorMsg.value = 'Vui lòng chọn sản phẩm'
     return
  }
  if (!form.fullName || !form.phone || !form.address) {
     errorMsg.value = 'Vui lòng nhập đầy đủ thông tin nhận hàng'
     return
  }
  if (!turnstileToken.value) {
     errorMsg.value = 'Vui lòng xác minh bảo mật (Turnstile)'
     return
  }

  isSendingOtp.value = true
  errorMsg.value = ''

  try {
    // 1. Send OTP via Zalo
    await $fetch('/api/auth/send-otp', {
      method: 'POST',
      body: { 
        phone: form.phone,
        turnstileToken: turnstileToken.value
      }
    })

    // 2. Create local order state
    const fullAddress = `${form.address}, ${form.ward || ''}, ${form.district || ''}, ${form.city || ''}`.replace(/, , /g, ', ').trim()
    
    createOrder({
      receiver: {
        fullName: form.fullName,
        phone: form.phone,
        address: fullAddress,
        city: form.city,
        district: form.district,
        ward: form.ward
      },
      items: cart.value,
      paymentMethod: form.payment,
      note: form.note,
      type: 'normal'
    })

    // 3. Redirect to verify
    router.push('/order/verify')
  } catch (err: any) {
    console.error('Error sending OTP:', err)
    errorMsg.value = err.statusMessage || 'Có lỗi xảy ra khi gửi mã OTP. Vui lòng thử lại.'
  } finally {
    isSendingOtp.value = false
  }
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

.security-box {
  margin: 15px 0;
}

.error-text {
  color: #e31b1b;
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: 600;
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
