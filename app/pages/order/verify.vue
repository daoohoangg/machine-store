<template>
  <div class="verify-page">
    <div class="verify-card">
      <div class="card-head">
        <button class="back" @click="goBack">‹</button>
        <h1>Xác thực đơn hàng</h1>
      </div>

      <p>
        Để giúp META xử lý đơn hàng nhanh nhất, Quý khách vui lòng nhập mã xác thực gồm 6 số
        đã được gửi đến <strong>{{ maskedPhone }}</strong> (vui lòng kiểm tra tin nhắn hoặc Zalo trên điện thoại)
      </p>

      <label>
        <span>Nhập mã xác thực</span>
        <input v-model="otp" type="text" maxlength="6" />
      </label>

      <button class="confirm" @click="confirmOrder">XÁC THỰC</button>
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

const { currentOrder } = useOrder()

const maskedPhone = computed(() => {
  const phone = currentOrder.value?.receiver.phone || '0373299648'
  if (phone.length < 4) return phone

  const head = phone.slice(0, 3)
  const tail = phone.slice(-3)
  return `${head}****${tail}`
})

const confirmOrder = () => {
  router.push('/order/success')
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
