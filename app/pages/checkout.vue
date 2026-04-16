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
        <div v-if="paymentMethods.length === 0" class="loading-payments">
          <i class="fa-solid fa-spinner fa-spin"></i> Đang tải hình thức thanh toán...
        </div>
        <label v-for="method in paymentMethods" :key="method.key" class="radio-row">
          <input v-model="form.payment" type="radio" :value="method.key" /> 
          <i :class="'fa-solid ' + (method.icon || 'fa-credit-card')"></i> {{ method.title }}
          <span v-if="method.description" class="method-desc">({{ method.description }})</span>
        </label>
      </div>

      <textarea v-model="form.note" rows="2" placeholder="Để lại lời nhắn cho Tuấn Minh (nếu có)"></textarea>



      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

      <ClientOnly>
        <button class="submit-btn" :disabled="selectedItems.length === 0 || isSendingOtp" @click="submitOrder">
          <span v-if="isSendingOtp">Đang xử lý...</span>
          <span v-else><i class="fa-solid fa-cart-shopping"></i> Gửi đơn hàng</span>
        </button>
      </ClientOnly>
    </section>

    <section class="checkout-cart-card">
      <h3 class="card-title"><i class="fa-solid fa-cart-shopping"></i> Danh sách sản phẩm</h3>

      <ClientOnly>
        <template #fallback>
          <div class="loading-state-cart">
            <i class="fa-solid fa-spinner fa-spin"></i> Đang tải giỏ hàng...
          </div>
        </template>

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
          <div class="voucher-input-group">
            <input v-model="voucherCode" type="text" placeholder="Nhập mã giảm giá..." :disabled="isApplyingVoucher" @keyup.enter="applyVoucher" />
            <button @click="applyVoucher" :disabled="isApplyingVoucher || !voucherCode">
              <i class="fa-solid fa-ticket"></i> Áp dụng
            </button>
          </div>
          <p v-if="voucherStatus" :class="['voucher-status', voucherStatus.type]">{{ voucherStatus.text }}</p>

          <p><span>Tiền hàng:</span> <strong>{{ formatPrice(totalPrice) }}đ</strong></p>
          <p v-if="discountValue > 0" class="discount-row">
            <span>Giảm giá ({{ appliedVoucher?.code }}):</span> 
            <strong>-{{ formatPrice(discountValue) }}đ</strong>
            <button class="remove-voucher" title="Gỡ mã" @click="resetVoucher">✕</button>
          </p>
          <p><span>Vận chuyển:</span> <strong>Chưa rõ</strong></p>
          <p class="total"><span>Tổng thanh toán:</span> <strong>{{ formatPrice(finalTotal) }}đ</strong></p>
        </div>
      </ClientOnly>
    </section>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref, watch } from 'vue'
import { useCart } from '~/composables/useCart'
import { useOrder } from '~/composables/useOrder'
import { useLocations } from '~/composables/useLocations'
import { useAdminAuth } from '~/composables/useAdminAuth'
import { useAbahaApi } from '~/composables/useAbahaApi'

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
const { isUser, isAdmin, userName, userPhone, initAuth, setUser } = useAdminAuth()
const { request } = useAbahaApi()
const router = useRouter()
const route = useRoute()

const selectedProvinceCode = ref('')
const selectedDistrictCode = ref('')
const selectedWardCode = ref('')

const paymentMethods = ref<any[]>([])

const normalizeLocation = (val: string) => {
  if (!val) return ''
  return val.toLowerCase()
    .replace(/^(tỉnh\s+|thành\s*phố\s+|tp\.\s*|quận\s+|huyện\s+|thị\s*xã\s+|phường\s+|xã\s+|thị\s*trấn\s+)/gi, '')
    .trim()
}

onMounted(async () => {
  await fetchProvinces()
  
  // Fetch dynamic payment methods
  try {
    const pms: any = await $fetch('/api/payment-methods')
    if (Array.isArray(pms)) {
      paymentMethods.value = pms.filter(m => m.is_active)
      if (paymentMethods.value.length > 0 && !form.payment) {
        form.payment = paymentMethods.value[0].key
      }
    }
  } catch (e) {
    console.error('Failed to load payment methods', e)
    // Fallback to defaults if API fails
    paymentMethods.value = [
      { key: 'cod', title: 'Nhận hàng thanh toán tại nhà', icon: 'fa-truck-fast', description: 'Khách chịu phí ship' },
      { key: 'bank', title: 'Thanh toán bằng Mã QR', icon: 'fa-qrcode' }
    ]
  }

  const authData: any = await $fetch('/api/auth/me')
  
  if (authData?.authenticated && authData.user) {
    const u = authData.user
    
    // Synchronize global auth state so submitOrder doesn't redirect
    setUser(u.name || u.full_name || u.phone, u.phone, !!u.isAdmin, u.premium_name || '')
    
    form.fullName = u.name || u.full_name || form.fullName
    form.phone = u.phone || form.phone
    
    const rawCity = u.city || ''
    const rawDistrict = u.district || ''
    const rawWard = u.ward || ''
    const rawAddress = u.address || ''

    form.city = rawCity
    form.district = rawDistrict
    form.ward = rawWard
    form.address = rawAddress

    // 1. If components missing but address is full, try parsing
    if (rawAddress && (!rawCity || !rawDistrict || !rawWard)) {
      const parts = rawAddress.split(',').map(p => p.trim()).filter(Boolean)
      if (parts.length >= 3) {
        if (!form.city) form.city = parts[parts.length - 1]
        if (!form.district && parts.length >= 2) form.district = parts[parts.length - 2]
        if (!form.ward && parts.length >= 3) form.ward = parts[parts.length - 3]
      }
    }
    
    // 2. Select dropdowns
    if (form.city) {
      await applyLocationMatching(form.city, form.district, form.ward)
    }

    // 3. Cleanup detail address (remove city/dist/ward names repeating at end)
    if (form.address) {
      let detail = form.address
      // Iteratively strip (City -> Dist -> Ward) and also generically catch corruption
      const genericLocPattern = /,?\s*(Tỉnh|Thành\s*phố|TP\.?|Quận|Huyện|Thị\s*xã|Phường|Xã|Thị\s*trấn)\s*[^,]+$/i
      
      let prev = ''
      while (detail !== prev) {
        prev = detail
        const toRemove = [form.ward, form.district, form.city].filter(Boolean).reverse()
        for (const part of toRemove) {
          const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const regex = new RegExp(`,?\\s*${escaped}\\s*$`, 'i')
          detail = detail.replace(regex, '').trim()
        }
        detail = detail.replace(genericLocPattern, '').trim()
      }
      if (detail.endsWith(',')) detail = detail.slice(0, -1).trim()
      form.address = detail
    }
  }
})

const applyLocationMatching = async (city: string, district: string, ward: string) => {
  if (!city) return

  // 1. Find Province
  const normCity = normalizeLocation(city)
  const p = provinces.value.find(p => {
    const np = normalizeLocation(p.name)
    return np === normCity || np.includes(normCity) || normCity.includes(np)
  })

  if (p) {
    selectedProvinceCode.value = p.code.toString()
    form.city = p.name
    await fetchDistricts(p.code)
    
    // 2. Find District
    if (district) {
      const normDist = normalizeLocation(district)
      const d = districts.value.find(d => {
        const nd = normalizeLocation(d.name)
        return nd === normDist || nd.includes(normDist) || normDist.includes(nd)
      })
      if (d) {
        selectedDistrictCode.value = d.code.toString()
        form.district = d.name
        await fetchWards(d.code)
        
        // 3. Find Ward
        if (ward) {
          const normWard = normalizeLocation(ward)
          const w = wards.value.find(w => {
            const nw = normalizeLocation(w.name)
            return nw === normWard || nw.includes(normWard) || normWard.includes(nw)
          })
          if (w) {
            selectedWardCode.value = w.code.toString()
            form.ward = w.name
          }
        }
      }
    }
  }
}

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


const isSendingOtp = ref(false)
const errorMsg = ref('')

// Voucher logic
const voucherCode = ref('')
const isApplyingVoucher = ref(false)
const appliedVoucher = ref<any>(null)
const voucherStatus = ref<{ type: 'success' | 'error', text: string } | null>(null)

const discountValue = computed(() => {
  if (!appliedVoucher.value) return 0
  if (appliedVoucher.value.type === 'percent') {
    let raw = (totalPrice.value * appliedVoucher.value.value) / 100
    if (appliedVoucher.value.max_discount) {
      raw = Math.min(raw, appliedVoucher.value.max_discount)
    }
    return Math.floor(raw)
  }
  return appliedVoucher.value.value
})

const finalTotal = computed(() => {
  return Math.max(0, totalPrice.value - discountValue.value)
})

const applyVoucher = async () => {
  if (!voucherCode.value) return
  isApplyingVoucher.value = true
  voucherStatus.value = null
  
  try {
    const res: any = await $fetch('/api/vouchers/validate', {
      method: 'POST',
      body: { code: voucherCode.value, totalValue: totalPrice.value }
    })
    
    if (res.success) {
      appliedVoucher.value = res.data
      voucherStatus.value = { type: 'success', text: `Áp dụng thành công mã ${res.data.code}` }
    }
  } catch (err: any) {
    voucherStatus.value = { type: 'error', text: err.statusMessage || 'Mã giảm giá không hợp lệ' }
    appliedVoucher.value = null
  } finally {
    isApplyingVoucher.value = false
  }
}

const resetVoucher = () => {
  appliedVoucher.value = null
  voucherCode.value = ''
  voucherStatus.value = null
}

// Ensure voucher is still valid if cart total changes
watch(totalPrice, (newVal) => {
  if (appliedVoucher.value && newVal < (appliedVoucher.value.min_order_value || 0)) {
    resetVoucher()
    voucherStatus.value = { type: 'error', text: 'Đơn hàng không còn đủ giá trị tối thiểu cho voucher này' }
  }
})

const submitOrder = async () => {
  console.log('[Checkout] submitOrder called', { cartLength: cart.value.length, selectedCount: selectedItems.value.length, isUser: isUser.value, isAdmin: isAdmin.value })
  if (selectedItems.value.length === 0) {
    errorMsg.value = 'Vui lòng chọn sản phẩm'
    return
  }

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

  if (!form.fullName || !form.phone || !form.address) {
    errorMsg.value = 'Vui lòng nhập đầy đủ thông tin nhận hàng (Họ tên, SĐT và Địa chỉ chi tiết)'
    // Scroll to error
    setTimeout(() => {
      document.querySelector('.error-text')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
    return
  }


  isSendingOtp.value = true
  errorMsg.value = ''

  try {
    // Clean detail address before concatenation to ensure no duplicates
    let detail = form.address
    const genericLocPattern = /,?\s*(Tỉnh|Thành\s*phố|TP\.?|Quận|Huyện|Thị\s*xã|Phường|Xã|Thị\s*trấn)\s*[^,]+$/i
    let prev = ''
    while (detail !== prev) {
      prev = detail
      const toRemove = [form.ward, form.district, form.city].filter(Boolean).reverse()
      for (const part of toRemove) {
        const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`,?\\s*${escaped}\\s*$`, 'i')
        detail = detail.replace(regex, '').trim()
      }
      detail = detail.replace(genericLocPattern, '').trim()
    }
    if (detail.endsWith(',')) detail = detail.slice(0, -1).trim()

    const fullAddress = [detail, form.ward, form.district, form.city].filter(Boolean).join(', ')
    console.log('[Checkout] Final Address for Abaha:', fullAddress)
    
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
      voucherCode: appliedVoucher.value?.code || '',
      discountAmount: discountValue.value,
      note: form.note,
      type: 'normal'
    })

    if (isUser.value || isAdmin.value) {
      // Logged in: Directly submit and go to success
      await submitOrderToBackend({
        discountAmount: discountValue.value,
        voucherCode: appliedVoucher.value?.code || ''
      })
      clearCart()
      router.push('/order/success')
    } else {
      // Should not be reachable due to the check above, but keeping for reference
      await $fetch('/api/auth/send-otp', {
        method: 'POST',
        body: { phone: form.phone }
      })
      router.push('/order/verify')
    }
  } catch (err: any) {
    console.error('Submit order error:', err)
    errorMsg.value = err.statusMessage || err.data?.statusMessage || 'Có lỗi xảy ra khi xử lý đơn hàng.'
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



.error-text {
  color: #e31b1b;
  font-size: 14px;
  margin-bottom: 10px;
  font-weight: 600;
}

.loading-payments {
  font-size: 13px;
  color: #666;
  padding: 5px 0;
}

.method-desc {
  font-weight: normal;
  color: #666;
  margin-left: 5px;
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

.voucher-input-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}

.voucher-input-group input {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 14px;
}

.voucher-input-group button {
  background: #333;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.voucher-status {
  font-size: 13px;
  margin-top: -8px;
  margin-bottom: 10px;
}

.voucher-status.success { color: #2e7d32; }
.voucher-status.error { color: #d32f2f; }

.discount-row {
  color: #d32f2f;
  font-weight: 500;
}

.remove-voucher {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 12px;
  margin-left: 5px;
  padding: 2px;
}

.remove-voucher:hover { color: #333; }

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

.loading-state-cart {
  padding: 30px;
  text-align: center;
  color: #888;
}
</style>
