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
          
          <div class="turnstile-wrapper">
            <NuxtTurnstile ref="turnstileRef" v-model="turnstileToken" />
          </div>

          <button class="main-btn" :disabled="isLoading || !phone || (phone !== '0123' && !turnstileToken)" @click="sendOtp">
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

        <button class="social-btn zalo-btn" :disabled="isLoadingZalo" @click="loginWithZalo">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" />
          {{ isLoadingZalo ? 'ĐANG XỬ LÝ...' : 'Đăng nhập bằng Zalo' }}
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
const isLoadingZalo = ref(false)
const errorMsg = ref('')

// Turnstile state
const turnstileToken = ref('')
const turnstileRef = ref(null)

// Zalo Auth PKCE Helpers
const generateRandomString = (length) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return result
}

const generateCodeChallenge = async (codeVerifier) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)))
  return base64Digest.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

const loginWithZalo = async () => {
  if (isLoadingZalo.value) return
  isLoadingZalo.value = true
  errorMsg.value = ''

  const config = useRuntimeConfig().public
  const appId = config.zaloAppId
  const redirectUri = config.zaloRedirectUri || `${window.location.origin}/api/auth/zalo-callback`
  
  // PKCE
  const codeVerifier = generateRandomString(43)
  const codeChallenge = await generateCodeChallenge(codeVerifier)
  const state = generateRandomString(10)
  
  // Store verifier and state in cookies for backend to use
  const verifierCookie = useCookie('zalo_code_verifier', { maxAge: 600, sameSite: 'lax' })
  const stateCookie = useCookie('zalo_state', { maxAge: 600, sameSite: 'lax' })
  verifierCookie.value = codeVerifier
  stateCookie.value = state

  const zaloAuthUrl = `https://oauth.zaloapp.com/v4/permission?app_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&code_challenge=${codeChallenge}`
  
  const width = 500
  const height = 600
  const left = (window.innerWidth - width) / 2
  const top = (window.innerHeight - height) / 2
  
  const popup = window.open(
    zaloAuthUrl,
    'ZaloLogin',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=no,resizable=yes`
  )

  // Listen for message from popup
  const messageHandler = async (event) => {
    const { type, detail } = event.data || {}
    
    // Original success/error handling
    if (type === 'zalo-login-success' || event.data === 'zalo-login-success') {
      window.removeEventListener('message', messageHandler)
      isLoadingZalo.value = false
      if (popup) popup.close()
      const { setUser } = useAdminAuth()
      setUser(detail || 'Zalo User', '', false)
      router.push('/')
      return
    } 
    
    if (type === 'zalo-login-error' || event.data === 'zalo-login-error') {
       window.removeEventListener('message', messageHandler)
       isLoadingZalo.value = false
       if (popup) popup.close()
       errorMsg.value = `Đăng nhập Zalo thất bại: ${detail || 'Có lỗi xảy ra'}`
       return
    }

    // New: Handle token received from backend
    if (type === 'zalo-token-received') {
      const accessToken = detail
      console.log('[Zalo Auth Debug] Token received on frontend, fetching profile...')
      
      try {
        // 1. Fetch profile directly from browser (using User's VN IP)
        const profileRes = await fetch(`https://graph.zalo.me/v2.0/me?fields=id,name,picture&access_token=${accessToken}`)
        const profileData = await profileRes.json()
        
        console.log('[Zalo Auth Debug] Profile fetched on frontend:', profileData)
        
        if (!profileData?.id) {
          throw new Error(profileData?.message || 'Không thể lấy thông tin cá nhân từ Zalo')
        }

        // 2. Send profile to backend to finalize session
        const finalizeRes = await $fetch('/api/auth/zalo-finalize', {
          method: 'POST',
          body: profileData
        })

        if (finalizeRes?.success || finalizeRes?.zaloId) {
          window.removeEventListener('message', messageHandler)
          if (popup) popup.close()
          isLoadingZalo.value = false
          // Use name from profile or fallback
          const { setUser } = useAdminAuth()
          setUser(profileData?.name || 'Zalo User', '', false)
          router.push('/')
        } else {
          throw new Error('Không thể hoàn tất đăng nhập trên hệ thống')
        }

      } catch (err) {
        console.error('[Zalo Auth Debug] Frontend flow error:', err)
        errorMsg.value = `Lỗi xử lý Zalo: ${err.message || 'Có lỗi xảy ra'}`
        isLoadingZalo.value = false
      }
    }
  }
  
  window.addEventListener('message', messageHandler)
}

const isValidVietnamesePhone = (p) => {
  return /^(0|84|\+84)[3|5|7|8|9][0-9]{8}$/.test(p)
}

const sendOtp = async () => {
  const formattedPhone = phone.value?.trim()

  if (!formattedPhone || !turnstileToken.value) {
    errorMsg.value = 'Vui lòng xác thực bạn không phải robot.'
    return
  }
  
  isLoading.value = true
  errorMsg.value = ''

  if (!isValidVietnamesePhone(formattedPhone)) {
    errorMsg.value = 'Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng Việt Nam (vd: 0912345678).'
    isLoading.value = false
    return
  }
  try {
    const res = await $fetch('/api/auth/send-otp', {
      method: 'POST',
      body: { 
        phone: phone.value,
        turnstileToken: turnstileToken.value 
      }
    })
    if (res?.success) {
      step.value = 2
    }
  } catch (err) {
    errorMsg.value = err.data?.statusMessage || 'Có lỗi xảy ra khi gửi OTP'
    if (turnstileRef.value) {
      turnstileRef.value.reset()
    }
    turnstileToken.value = ''
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
      // Use setUser to update the local and global state correctly
      const { setUser } = useAdminAuth()
      setUser(res.name || res.phone || phone.value, phone.value, false)
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

.turnstile-wrapper {
  margin-bottom: 12px;
  display: flex;
  justify-content: center;
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
