<template>
  <div class="vouchers-page">
    <div class="vouchers-card">
      <div class="header-back">
        <button class="back-btn" @click="$router.push('/auth/profile')">
          <i class="fa-solid fa-arrow-left"></i> Trang cá nhân
        </button>
        <h1>Voucher của tôi</h1>
      </div>
      
      <p class="subtitle">Quản lý và kiểm tra các mã giảm giá dành riêng cho bạn</p>

      <!-- Check Voucher Section -->
      <div class="check-section">
        <div class="check-box">
          <input 
            type="text" 
            v-model="voucherCode" 
            placeholder="Nhập mã voucher tại đây..." 
            @keyup.enter="checkVoucher"
          />
          <button @click="checkVoucher" :disabled="isChecking">
            <span v-if="isChecking"><i class="fa-solid fa-spinner fa-spin"></i></span>
            <span v-else>Kiểm tra</span>
          </button>
        </div>

        <transition name="slide-fade">
          <div v-if="checkResult" :class="['result-msg', checkResult.success ? 'success' : 'error']">
            <div class="result-header">
              <i :class="checkResult.success ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark'"></i>
              <span>{{ checkResult.message }}</span>
            </div>
            <p v-if="checkResult.details">{{ checkResult.details }}</p>
            
            <div v-if="checkResult.voucher" class="mini-voucher shadow-sm border rounded p-3 mt-3 bg-white">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="v-type">{{ checkResult.voucher.type }}</div>
                  <div class="v-name">{{ checkResult.voucher.name }}</div>
                  <div class="v-expiry">HSD: {{ checkResult.voucher.expiry }}</div>
                </div>
                <div class="v-value text-danger font-weight-bold">{{ checkResult.voucher.discount }}</div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Voucher List Section -->
      <div class="list-section">
        <h3>📍 Voucher dành cho bạn</h3>
        
        <div v-if="isLoading" class="loading-state py-5 text-center">
          <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
          <p class="mt-2 text-muted">Đang tải danh sách voucher...</p>
        </div>

        <div v-else-if="vouchers.length === 0" class="empty-state py-5 text-center">
          <i class="fa-solid fa-ticket-simple fa-4x text-muted mb-3 opacity-25"></i>
          <p class="text-muted">Hiện tại không có voucher nào khả dụng.</p>
        </div>

        <div v-else class="voucher-grid">
          <div v-for="voucher in vouchers" :key="voucher.id" class="voucher-card-item">
            <div class="voucher-inner">
              <div class="voucher-side bg-danger text-white">
                <i class="fa-solid fa-gift fa-lg mb-2"></i>
                <div class="small font-weight-bold">ABAHA</div>
              </div>
              <div class="voucher-main p-3">
                <div class="d-flex justify-content-between mb-1">
                  <h6 class="mb-0 font-weight-bold text-dark">{{ voucher.name }}</h6>
                  <span class="text-danger font-weight-bold">{{ voucher.discount }}</span>
                </div>
                <p class="voucher-desc small text-muted mb-2">{{ voucher.description }}</p>
                <div class="voucher-footer d-flex justify-content-between align-items-center border-top pt-2 mt-auto">
                  <span class="expiry-text extra-small text-muted"><i class="fa-regular fa-clock mr-1"></i>HSD: {{ voucher.expiry }}</span>
                  <button class="btn-copy" @click="copyCode(voucher.code)">Lấy mã</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAbahaApi } from '~/composables/useAbahaApi'

useHead({
  title: 'Voucher của tôi | Tuấn Minh'
})

const { request } = useAbahaApi()

const voucherCode = ref('')
const isChecking = ref(false)
const checkResult = ref(null)
const isLoading = ref(true)
const vouchers = ref([])

const fetchVouchers = async () => {
  try {
    isLoading.value = true

    // 1. Fetch from local DB (Supabase)
    let dbItems = []
    try {
      const dbRes = await $fetch('/api/vouchers/list')
      if (dbRes.success) {
        dbItems = dbRes.data.map(v => ({
          id: `db-${v.id}`,
          name: v.title,
          description: v.description,
          discount: v.type === 'percent' ? `-${v.value}%` : `-${new Intl.NumberFormat('vi-VN').format(v.value)}đ`,
          expiry: v.expiryDate,
          code: v.code
        }))
      }
    } catch (dbErr) {
      console.warn('[Voucher] Local DB error:', dbErr)
    }

    // 2. Fetch from Abaha API
    let abahaItems = []
    try {
      const res = await request('voucher_campaign/index', { method: 'POST', body: {} })
      const rawData = res?.data?.data || res?.data || res || []
      const items = Array.isArray(rawData) ? rawData : []
      abahaItems = items.map(v => ({
        id: `abaha-${v.id}`,
        name: v.name || 'Mã giảm giá',
        description: v.description || 'Áp dụng cho đơn hàng thỏa điều kiện.',
        discount: v.value ? `-${new Intl.NumberFormat('vi-VN').format(v.value)}đ` : 'GIẢM GIÁ',
        expiry: v.end_time ? new Date(v.end_time * 1000).toLocaleDateString('vi-VN') : (v.end_date || 'Không giới hạn'),
        code: v.code || ''
      }))
    } catch (apiErr) {
      console.warn('[Voucher] Abaha API error:', apiErr)
    }

    // Merge: local DB first, then Abaha
    vouchers.value = [...dbItems, ...abahaItems]
  } finally {
    isLoading.value = false
  }
}


const checkVoucher = async () => {
  const code = voucherCode.value.trim()
  if (!code) return
  
  isChecking.value = true
  checkResult.value = null
  
  try {
    const res = await request(`voucher/get_by_code/${code}`, {
      method: 'GET'
    })
    
    if (res && res.success !== false && (res.data || res.id)) {
      const data = res.data || res
      checkResult.value = {
        success: true,
        message: 'Mã voucher hợp lệ!',
        details: 'Bạn có thể sử dụng mã này cho lần mua hàng tới.',
        voucher: {
          name: data.name || 'Voucher ưu đãi',
          discount: data.value ? `-${new Intl.NumberFormat('vi-VN').format(data.value)}đ` : 'GIẢM GIÁ',
          expiry: data.end_time ? new Date(data.end_time * 1000).toLocaleDateString('vi-VN') : (data.end_date || 'N/A'),
          code: data.code || code,
          type: data.type_name || 'Ưu đãi'
        }
      }
    } else {
      checkResult.value = { success: false, message: 'Mã voucher không hợp lệ', details: 'Vui lòng kiểm tra lại mã hoặc liên hệ bộ phận hỗ trợ.' }
    }
  } catch (error) {
    checkResult.value = { success: false, message: 'Không tìm thấy voucher', details: 'Mã voucher này có thể đã hết hạn hoặc không tồn tại.' }
  } finally {
    isChecking.value = false
  }
}

const copyCode = (code) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code)
      .then(() => alert(`Đã sao chép mã: ${code}`))
      .catch(() => alert(`Mã giảm giá: ${code}`))
  } else {
    alert(`Mã giảm giá: ${code}`)
  }
}

onMounted(() => {
  fetchVouchers()
})
</script>

<style scoped>
.vouchers-page {
  padding: 40px 15px;
  background: #f8f9fa;
  min-height: 80vh;
}

.vouchers-card {
  width: 100%;
  max-width: 850px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 30px;
}

.header-back {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 5px;
}

.back-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.back-btn:hover { color: #000; }

h1 { margin: 0; font-size: 28px; color: #333; }
.subtitle { color: #888; margin-bottom: 30px; }

/* Check Section */
.check-section {
  background: #fdfdfd;
  border: 1px solid #eee;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 40px;
}

.check-box {
  display: flex;
  gap: 10px;
}

.check-box input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;
}

.check-box input:focus { border-color: #007bff; box-shadow: 0 0 0 3px rgba(0,123,255,0.1); }

.check-box button {
  padding: 0 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.check-box button:hover { background: #218838; transform: translateY(-1px); }
.check-box button:disabled { background: #94d3a2; cursor: not-allowed; }

.result-msg {
  margin-top: 20px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid transparent;
}

.result-msg.success { background: #e8f5e9; color: #2e7d32; border-color: #c8e6c9; }
.result-msg.error { background: #ffebee; color: #c62828; border-color: #ffcdd2; }

.result-header { display: flex; align-items: center; gap: 8px; font-weight: 700; margin-bottom: 4px; }
.result-msg p { margin: 0; font-size: 14px; opacity: 0.9; }

.v-type { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.7; }
.v-name { font-weight: 700; color: #333; margin-bottom: 2px; }
.v-expiry { font-size: 12px; color: #888; font-style: italic; }
.v-value { font-size: 18px; }

/* List Section */
.list-section h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
  border-left: 4px solid #d4161c;
  padding-left: 12px;
}

.voucher-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.voucher-card-item {
  border: 1px solid #eee;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  background: white;
}

.voucher-card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  border-color: #d4161c44;
}

.voucher-inner {
  display: flex;
  min-height: 110px;
}

.voucher-side {
  width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  position: relative;
}

.voucher-side::after {
  content: "";
  position: absolute;
  right: -5px;
  top: 0;
  bottom: 0;
  width: 10px;
  background-image: radial-gradient(circle, transparent 50%, white 50%);
  background-size: 10px 10px;
}

.voucher-main { display: flex; flex-direction: column; flex: 1; }
.voucher-desc { line-height: 1.4; color: #666; }

.btn-copy {
  background: #d4161c;
  color: white;
  border: none;
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy:hover { background: #b30500; transform: scale(1.05); }

.extra-small { font-size: 11px; }

/* Transitions */
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1); }
.slide-fade-enter-from, .slide-fade-leave-to { transform: translateY(-10px); opacity: 0; }

@media (max-width: 600px) {
  .vouchers-card { padding: 20px; }
  h1 { font-size: 24px; }
  .voucher-side { width: 70px; }
  .check-box { flex-direction: column; }
  .check-box button { height: 45px; }
}
</style>
