<template>
  <div class="verify-page">
    <div class="verify-card">
      <div class="card-head">
        <button class="back" @click="goBack">‹</button>
        <h1>Xác thực đơn hàng</h1>
      </div>

      <p>
        Để giúp Tuấn Minh xử lý đơn hàng nhanh nhất, Quý khách vui lòng nhập mã xác thực gồm 6 số
        đã được gửi đến <strong>{{ maskedPhone }}</strong> (vui lòng kiểm tra tin nhắn hoặc Zalo trên điện thoại)
      </p>

      <label>
        <span>Nhập mã xác thực</span>
        <input v-model="otp" type="text" maxlength="6" placeholder="______" @keyup.enter="confirmOrder" />
      </label>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

      <button class="confirm" :disabled="isVerifying" @click="confirmOrder">
        {{ isVerifying ? 'ĐANG XÁC THỰC...' : 'XÁC THỰC' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useOrder } from '~/composables/useOrder'

definePageMeta({
  layout: 'checkout'
})

const router = useRouter()
const otp = ref('')
const isVerifying = ref(false)
const errorMsg = ref('')

const { currentOrder, submitOrderToBackend } = useOrder()
const { clearCart } = useCart()

const maskedPhone = computed(() => {
  const phone = currentOrder.value?.receiver.phone || ''
  if (!phone || phone.length < 4) return '...'

  const head = phone.slice(0, 3)
  const tail = phone.slice(-3)
  return `${head}****${tail}`
})

const confirmOrder = async () => {
  if (!otp.value || otp.value.length < 6) {
    errorMsg.value = 'Vui lòng nhập mã xác thực 6 số'
    return
  }

  if (!currentOrder.value) {
    router.push('/checkout')
    return
  }

  isVerifying.value = true
  errorMsg.value = ''

  try {
    // 1. Verify OTP
    await $fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: { 
        phone: currentOrder.value.receiver.phone,
        otp: otp.value
      }
    })

    // 2. Submit order to Abaha
    await submitOrderToBackend()

    // 3. Clear cart and Success
    clearCart()
    router.push('/order/success')
  } catch (err: any) {
    console.error('Order verify error:', err)
    errorMsg.value = err.statusMessage || 'Mã xác thực không đúng hoặc có lỗi xảy ra.'
  } finally {
    isVerifying.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.verify-page {
  min-height: calc(100vh - 220px);
  background: #f3f3f3;
  display: grid;
  place-items: center;
  padding: 20px 16px 30px;
}

.verify-card {
  width: min(450px, 100%);
  background: #fff;
  border: 1px solid #d5d5d5;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  padding: 20px;
}

.card-head {
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: center;
  margin-bottom: 10px;
}

.back {
  border: none;
  background: none;
  font-size: 38px;
  line-height: 1;
  color: #184a82;
  cursor: pointer;
}

h1 {
  font-size: 38px;
  margin: 0;
  text-align: center;
  font-weight: 500;
}

p {
  margin: 8px 0 14px;
  font-size: 16px;
  line-height: 1.55;
}

label span {
  display: inline-block;
  padding: 0 8px;
  color: #6a6a6a;
  margin-left: 10px;
  transform: translateY(8px);
  background: #fff;
}

input {
  width: 100%;
  border: 1px solid #bbb;
  border-radius: 4px;
  height: 50px;
  font-size: 20px;
  padding: 0 12px;
}

.confirm {
  width: 100%;
  margin-top: 16px;
  border: none;
  background: #e31c1c;
  color: #fff;
  border-radius: 6px;
  height: 56px;
  font-size: 34px;
  cursor: pointer;
}

.confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  color: #e31c1c;
  margin-top: 10px;
  font-weight: 500;
  text-align: center;
}

@media (max-width: 1200px) {
  h1 {
    font-size: 30px;
  }

  .confirm {
    font-size: 24px;
    height: 48px;
  }

  p,
  input {
    font-size: 14px;
  }
}
</style>
