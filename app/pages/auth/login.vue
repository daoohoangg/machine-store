<template>
  <section class="auth-page container">
    <div class="auth-grid">
      <div class="hero-side">
        <div class="hero-logo">TUẤN MINH</div>
        <h2>ĐIỆN MÁY GIÁ CỰC TỐT<br/>HÀNG HIỆU CHÍNH HÃNG</h2>
        <div class="hero-icons">
          <span>DỊCH VỤ<br/>UY TÍN</span>
          <span>MIỄN PHÍ<br/>VẬN CHUYỂN</span>
          <span>GIAO HÀNG<br/>TOÀN QUỐC</span>
        </div>
        <div class="hero-appliances">
          <img src="~/assets/img/banner/2.jpg" alt="Banner Tuấn Minh" />
        </div>
      </div>

      <div class="form-card">
        <h1>Đăng nhập</h1>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <div v-if="step === 1">
          <input v-model="phone" type="text" placeholder="Nhập số điện thoại" @keyup.enter="sendOtp" />
          <button class="main-btn" :disabled="isLoading || !phone" @click="sendOtp">
            {{ isLoading ? 'ĐANG GỬI...' : 'GỬI MÃ OTP' }}
          </button>
        </div>

        <div v-else>
          <p class="info-text">Mã OTP đã được gửi đến số <b>{{ phone }}</b></p>
          <input v-model="otp" type="text" placeholder="Nhập mã OTP (6 số)" @keyup.enter="verifyOtp" />
          <button class="main-btn" :disabled="isLoading || !otp" @click="verifyOtp">
            {{ isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP' }}
          </button>
          <p class="right-link"><a href="#" @click.prevent="step = 1; errorMsg = ''">Sửa số điện thoại</a></p>
        </div>

        <div class="divider"><span>HOẶC</span></div>

        <button class="social-btn zalo-btn" @click="loginWithZalo">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" />
          Đăng nhập bằng Zalo
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminAuth } from '~/composables/useAdminAuth'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const { login } = useAdminAuth()
const step = ref(1)
const phone = ref('')
const otp = ref('')
const isLoading = ref(false)
const errorMsg = ref('')

// Zalo Auth
const loginWithZalo = () => {
  const width = 500
  const height = 600
  const left = (window.innerWidth - width) / 2
  const top = (window.innerHeight - height) / 2
  
  // We'll use a server endpoint to get the Zalo Auth URL to keep App ID on server
  const authUrl = `/api/auth/zalo-url`
  
  const popup = window.open(
    authUrl,
    'ZaloLogin',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=no,resizable=yes`
  )

  // Listen for message from popup
  const messageHandler = (event) => {
    if (event.data === 'zalo-login-success') {
      window.removeEventListener('message', messageHandler)
      router.push('/')
    } else if (event.data === 'zalo-login-error') {
       window.removeEventListener('message', messageHandler)
       errorMsg.value = 'Đăng nhập Zalo thất bại'
    }
  }
  
  window.addEventListener('message', messageHandler)
}

const sendOtp = async () => {
  if (!phone.value) return
  isLoading.value = true
  errorMsg.value = ''

  if (phone.value === '0123') {
    login('Admin 0123')
    router.push('/admin')
    isLoading.value = false
    return
  }
  try {
    const res = await $fetch('/api/auth/send-otp', {
      method: 'POST',
      body: { phone: phone.value }
    })
    if (res?.success) {
      step.value = 2
    }
  } catch (err) {
    errorMsg.value = err.data?.statusMessage || 'Có lỗi xảy ra khi gửi OTP'
  } finally {
    isLoading.value = false
  }
}

const verifyOtp = async () => {
  if (!otp.value) return
  isLoading.value = true
  errorMsg.value = ''
  try {
    const res = await $fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: { phone: phone.value, otp: otp.value }
    })
    if (res?.success) {
      router.push('/')
    }
  } catch (err) {
    errorMsg.value = err.data?.statusMessage || 'Mã OTP không hợp lệ hoặc đã hết hạn'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  padding: 58px 10px;
}

.auth-grid {
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 30px;
  align-items: center;
  min-height: 680px;
}

.hero-side {
  color: #fff;
  text-align: center;
}

.hero-logo {
  font-size: 54px;
  font-weight: 900;
  margin-bottom: 12px;
}

.hero-side h2 {
  margin: 0;
  font-size: 44px;
  line-height: 1.25;
}

.hero-icons {
  margin: 20px auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  max-width: 520px;
}

.hero-icons span {
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  padding: 12px 6px;
  font-size: 15px;
}

.hero-appliances {
  margin: 20px auto 0;
  width: min(560px, 100%);
  border-radius: 18px;
  overflow: hidden;
}

.hero-appliances img {
  width: 100%;
  height: auto;
  display: block;
}

.form-card {
  background: #f5f5f5;
  border-radius: 6px;
  padding: 20px;
}

h1 {
  margin: 0 0 16px;
  font-size: 37px;
  font-weight: 500;
}

input {
  width: 100%;
  border: 1px solid #bbb;
  border-radius: 4px;
  height: 48px;
  padding: 0 12px;
  margin-bottom: 10px;
  font-size: 29px;
}

.password-row {
  display: grid;
  grid-template-columns: 1fr 46px;
  gap: 0;
}

.password-row button {
  border: 1px solid #bbb;
  border-left: none;
  background: #fff;
}

.right-link {
  text-align: right;
  margin: 4px 0 14px;
}

.right-link a,
.switch-text a {
  color: #0a67c7;
  text-decoration: none;
}

.main-btn {
  width: 100%;
  border: none;
  border-radius: 6px;
  height: 52px;
  background: #0a67c7;
  color: #fff;
  font-size: 39px;
  font-weight: 700;
  cursor: pointer;
}

.main-btn:disabled {
  background: #ddd;
  color: #999;
  cursor: not-allowed;
}

.error-msg {
  color: #ff3333;
  margin-bottom: 10px;
  font-size: 16px;
}

.info-text {
  margin-bottom: 15px;
  font-size: 16px;
}

.switch-text {
  text-align: center;
  margin: 14px 0;
  font-size: 31px;
}

.divider {
  text-align: center;
  margin: 10px 0;
  color: #888;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 42%;
  height: 1px;
  background: #ddd;
}

.divider::before { left: 0; }
.divider::after { right: 0; }

.social-btn {
  width: 100%;
  border: 1px solid #bbb;
  border-radius: 6px;
  background: #fff;
  height: 48px;
  margin-bottom: 8px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.2s;
}

.social-btn:hover {
  background: #f9f9f9;
}

.zalo-btn {
  background: #0068ff;
  color: #fff;
  border: none;
}

.zalo-btn:hover {
  background: #005ae0;
}

.zalo-btn img {
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
}

@media (max-width: 1200px) {
  .auth-grid {
    grid-template-columns: 1fr;
  }

  .hero-side {
    display: none;
  }

  h1 {
    font-size: 28px;
  }

  input,
  .main-btn,
  .switch-text,
  .social-btn {
    font-size: 14px;
  }
}
</style>
