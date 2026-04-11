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

      <h3 class="card-title">🧾 Hình thức trả góp: <em>*</em></h3>

      <div class="installment-box">
        <label class="radio-row main-option">
          <input v-model="form.installmentMethod" type="radio" value="company" />
          <span>Qua công ty tài chính (duyệt hồ sơ nhanh chóng)</span>
        </label>

        <p class="installment-note">
          Chỉ cần CCCD, duyệt hồ sơ trong 5 phút,
          <strong>giá trị đơn hàng tối thiểu từ 1.000.000đ.</strong>
        </p>

        <div class="provider-list">
          <button
            v-for="provider in providers"
            :key="provider.id"
            type="button"
            class="provider-btn"
            :class="{ active: form.provider === provider.id }"
            @click="form.provider = provider.id"
          >
            <span>{{ provider.label }}</span>
          </button>
        </div>
      </div>

      <label class="check-row"><input v-model="form.needInvoice" type="checkbox" /> Yêu cầu Tuấn Minh xuất hóa đơn</label>
      <label class="check-row"><input v-model="form.needEmail" type="checkbox" /> Nhập email để theo dõi đơn hàng</label>

      <textarea v-model="form.note" rows="2" placeholder="Để lại lời nhắn cho Tuấn Minh (nếu có)"></textarea>

      <button class="submit-btn" :disabled="selectedItems.length === 0" @click="submitOrder"><i class="fa-solid fa-cart-shopping"></i> Gửi đơn hàng</button>
    </section>

    <section class="checkout-cart-card">
      <h3 class="card-title"><i class="fa-solid fa-cart-shopping"></i> Danh sách sản phẩm</h3>

      <label class="check-row select-all"><input type="checkbox" v-model="isAllSelected" /> Chọn tất cả</label>

      <div v-if="cart.length === 0" class="empty">Giỏ hàng đang trống.</div>

      <div v-else class="items">
        <div v-for="item in cart" :key="item.id" class="item-row">
          <input type="checkbox" :checked="item.selected" @change="toggleSelection(item.id)" />

          <img :src="item.image" :alt="item.title" class="thumb" />

          <div class="item-main">
            <p class="name">{{ item.title }}</p>
            <p class="gift" v-if="item.gift"><i class="fa-solid fa-gift"></i> Tặng áo thun (cho miền Nam)</p>
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

          <button class="remove" @click="removeFromCart(item.id)"><i class="fa-solid fa-trash-can"></i> Xóa</button>
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
import { useAdminAuth } from '~/composables/useAdminAuth'
import { useRoute } from 'vue-router'

definePageMeta({
  layout: 'checkout'
})

const {
  cart,
  totalPrice,
  isAllSelected,
  updateQuantity,
  removeFromCart,
  toggleSelection,
  clearCart
} = useCart()
const { createOrder, submitOrderToBackend } = useOrder()
const { provinces, districts, wards, fetchProvinces, fetchDistricts, fetchWards } = useLocations()
const { isUser, isAdmin, userName, userPhone, initAuth } = useAdminAuth()
const router = useRouter()
const route = useRoute()

const selectedProvinceCode = ref('')
const selectedDistrictCode = ref('')
const selectedWardCode = ref('')

onMounted(async () => {
  await fetchProvinces()
  await initAuth()

  if (isUser.value || isAdmin.value) {
    // 1. Basic pre-fill from session
    form.fullName = userName.value
    form.phone = userPhone.value

    // 2. Fetch detailed profile from server
    try {
      const data: any = await $fetch('/api/auth/me')
      if (data?.authenticated && data.user) {
        const u = data.user
        form.fullName = u.full_name || form.fullName
        form.phone = u.phone || form.phone
        form.address = u.address || ''
        
        // Match names to codes for cascading selects
        if (u.city) {
          const p = provinces.value.find(p => p.name === u.city)
          if (p) {
            selectedProvinceCode.value = p.code.toString()
            await fetchDistricts(p.code)
            form.city = u.city
            
            if (u.district) {
              const d = districts.value.find(d => d.name === u.district)
              if (d) {
                selectedDistrictCode.value = d.code.toString()
                await fetchWards(d.code)
                form.district = u.district
                
                if (u.ward) {
                  const w = wards.value.find(w => w.name === u.ward)
                  if (w) {
                    selectedWardCode.value = w.code.toString()
                    form.ward = u.ward
                  }
                }
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('[Checkout Installment Pre-fill Error]:', e)
    }
  }
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

const providers = [
  { id: 'home-credit', label: 'HOME CREDIT' },
  { id: 'paylater', label: 'Trả sau Home' },
  { id: 'hd-saison', label: 'HD SAISON' },
  { id: 'kredivo', label: 'Kredivo' }
]

const form = reactive({
  fullName: '',
  phone: '',
  city: '',
  district: '',
  ward: '',
  address: '',
  otherReceiver: false,
  installmentMethod: 'company',
  provider: 'home-credit',
  needInvoice: false,
  needEmail: false,
  note: ''
})

const formatPrice = (price: number | null) => {
  if (!price) return '0'
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const submitOrder = async () => {
  if (selectedItems.value.length === 0) return

  // Force login check
  if (!isUser.value && !isAdmin.value) {
    if (confirm('Vui lòng đăng nhập trước khi đặt hàng')) {
      router.push({
        path: '/auth/login',
        query: { redirect: route.fullPath }
      })
    }
    return
  }

  const fullAddress = `${form.address}, ${form.ward || ''}, ${form.district || ''}, ${form.city || ''}`.replace(/, , /g, ', ').trim()

  createOrder({
    receiver: {
      fullName: form.fullName || 'Khách hàng',
      phone: form.phone || '0000000000',
      address: fullAddress || 'Chưa có địa chỉ',
      city: form.city,
      district: form.district,
      ward: form.ward
    },
    items: cart.value,
    paymentMethod: `installment-${form.provider}`,
    note: form.note,
    type: 'installment'
  })

  if (isUser.value || isAdmin.value) {
     // Logged in: Directly submit and go to success
     await submitOrderToBackend()
     clearCart()
     router.push('/order/success')
  } else {
     // Should not be reachable, but redirecting to verify as fallback
     router.push('/order/verify')
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
  line-height: 1.25;
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

.installment-box {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
}

.main-option {
  margin-bottom: 6px;
}

.installment-note {
  margin: 0 0 10px 34px;
  font-size: 13px;
  color: #999;
}

.installment-note strong {
  color: #e60000;
}

.provider-list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.provider-btn {
  height: 66px;
  border: 1px solid #ddd;
  background: #f9f9f9;
  border-radius: 2px;
  color: #333;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
}

.provider-btn.active {
  border-color: #00a0ff;
  box-shadow: 0 0 0 1px rgba(0, 160, 255, 0.2) inset;
  background: #fff;
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
  font-size: 14px;
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
  font-size: 14px;
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
  font-size: 14px;
}

.summary .total,
.summary .total strong {
  color: #d4161c;
}

.coupon {
  color: #0a67c7;
  margin-top: 8px;
  display: inline-block;
  font-size: 14px;
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

  .provider-list {
    grid-template-columns: 1fr 1fr;
  }

  .card-title {
    font-size: 20px;
  }

  input[type='text'],
  select,
  textarea,
  .check-row,
  .radio-row,
  .name,
  .gift,
  .item-price p,
  .summary p,
  .coupon,
  .remove,
  .provider-btn,
  .submit-btn,
  .installment-note {
    font-size: 14px;
  }
}
</style>
