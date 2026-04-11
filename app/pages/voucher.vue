<template>
  <div class="voucher-page">
    <nav class="breadcrumb" aria-label="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <span>/</span>
      <strong>Mã giảm giá</strong>
    </nav>

    <div class="voucher-container">
      <h1 class="page-title">Mã giảm giá dành cho bạn</h1>
      
      <div v-if="isLoading" class="empty-state">
        <i class="fa-solid fa-spinner fa-spin fa-3x"></i>
        <p>Đang tải mã giảm giá...</p>
      </div>

      <div v-else-if="vouchers.length === 0" class="empty-state">
        <i class="fa-solid fa-ticket fa-3x"></i>
        <p>Hiện chưa có mã giảm giá nào.</p>
      </div>

      <div v-else class="voucher-grid">
        <div 
          v-for="voucher in vouchers" 
          :key="voucher.id" 
          class="voucher-card"
          :class="{ 'is-saved': voucher.saved }"
        >
          <div class="voucher-left">
            <div class="voucher-icon">
              <i class="fa-solid fa-gift"></i>
            </div>
            <div class="cutout top"></div>
            <div class="cutout bottom"></div>
          </div>
          <div class="voucher-main">
            <h3 class="voucher-title">{{ voucher.title }}</h3>
            <p class="voucher-desc">{{ voucher.description }}</p>
            <p class="voucher-expiry">HSD: {{ voucher.expiryDate }}</p>
          </div>
          <div class="voucher-right">
            <button 
              class="btn-save" 
              @click="toggleSave(voucher)"
              :disabled="voucher.saved"
            >
              {{ voucher.saved ? 'Đã lưu' : 'Lưu mã' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAbahaApi } from '~/composables/useAbahaApi'

useHead({
  title: 'Mã giảm giá | Tuấn Minh'
})

interface Voucher {
  id: number
  title: string
  description: string
  expiryDate: string
  saved: boolean
  code?: string
}

const { request } = useAbahaApi()
const isLoading = ref(true)
const vouchers = ref<Voucher[]>([])

const fetchVouchers = async () => {
  try {
    isLoading.value = true
    // 1. Fetch from Abaha API
    let abahaItems = []
    try {
      const res = await request<any>('voucher_campaign/index', {
        method: 'POST',
        body: {}
      })
      const rawData = res?.data?.data || res?.data || res || []
      abahaItems = Array.isArray(rawData) ? rawData : []
    } catch (apiError) {
      console.warn('Abaha API error:', apiError)
    }

    // 2. Fetch from local DB API
    let dbItems = []
    try {
      const dbRes = await $fetch<any>('/api/vouchers/list')
      if (dbRes.success) {
        dbItems = dbRes.data
      }
    } catch (dbError) {
      console.warn('Local DB API error:', dbError)
    }
    
    // Process Abaha items
    const processedAbaha = abahaItems.map((v: any, index: number) => {
      let expiry = 'Không giới hạn'
      if (v.end_time) {
        const ts = String(v.end_time).length === 10 ? v.end_time * 1000 : v.end_time
        expiry = new Date(ts).toLocaleDateString('vi-VN')
      } else if (v.end_date) {
        expiry = String(v.end_date)
      }
      return {
        id: v.id || `abaha-${index}`,
        title: v.name || v.title || 'Mã giảm giá',
        description: v.description || v.content || 'Áp dụng cho đơn hàng thỏa điều kiện.',
        expiryDate: expiry,
        saved: false,
        code: v.code || ''
      }
    })

    // Process DB items
    const processedDb = dbItems.map((v: any) => ({
      id: `db-${v.id}`,
      title: v.title,
      description: v.description,
      expiryDate: v.expiryDate,
      saved: false,
      code: v.code
    }))

    // Merge and set
    vouchers.value = [...processedDb, ...processedAbaha]
  } catch (error) {
    console.error('Failed to fetch vouchers:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchVouchers()
})

const toggleSave = (voucher: Voucher) => {
  voucher.saved = true
  if (voucher.code && navigator.clipboard) {
    navigator.clipboard.writeText(voucher.code)
      .then(() => alert(`Đã lưu và sao chép mã: ${voucher.code}`))
      .catch(() => alert(`Đã lưu mã: ${voucher.code}`))
  } else if (voucher.code) {
    alert(`Đã lưu mã: ${voucher.code}`)
  }
}
</script>

<style scoped>
.voucher-page {
  padding: 15px;
}

.breadcrumb {
  font-size: 13px;
  color: #666;
  margin-bottom: 20px;
  display: flex;
  gap: 6px;
}

.breadcrumb a {
  color: #0066cc;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.page-title {
  font-size: 24px;
  color: #222;
  margin-bottom: 24px;
  text-transform: uppercase;
  font-weight: 700;
  border-left: 4px solid #e31b1b;
  padding-left: 12px;
}

.voucher-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.voucher-card {
  display: flex;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
}

.voucher-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  border-color: #cecece;
}

.voucher-left {
  background: linear-gradient(135deg, #e31b1b, #f65353);
  width: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-right: 2px dashed #e0e0e0;
  position: relative;
  flex-shrink: 0;
}

.voucher-icon {
  font-size: 32px;
}

.cutout {
  position: absolute;
  right: -10px;
  width: 20px;
  height: 20px;
  background: #efefef; /* Page background */
  border-radius: 50%;
  border: 1px solid #e0e0e0;
}

.cutout.top {
  top: -10px;
  border-bottom-color: transparent;
  border-left-color: transparent;
  transform: rotate(45deg);
}

.cutout.bottom {
  bottom: -10px;
  border-top-color: transparent;
  border-right-color: transparent;
  transform: rotate(-135deg);
}

.voucher-main {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.voucher-title {
  font-size: 18px;
  font-weight: 700;
  color: #e31b1b;
  margin: 0 0 8px;
}

.voucher-desc {
  font-size: 13px;
  color: #555;
  margin: 0 0 10px;
  line-height: 1.4;
}

.voucher-expiry {
  font-size: 12px;
  color: #888;
  margin: 0;
  font-style: italic;
}

.voucher-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.btn-save {
  background: #0066cc;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-save:hover:not(:disabled) {
  background: #0052a3;
  transform: scale(1.05);
}

.voucher-card.is-saved .btn-save {
  background: #f0f0f0;
  color: #999;
  cursor: default;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #888;
}

.empty-state i {
  margin-bottom: 16px;
  color: #ddd;
}

@media (max-width: 900px) {
  .voucher-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .voucher-left {
    width: 90px;
  }
  .voucher-icon {
    font-size: 24px;
  }
  .voucher-main {
    padding: 12px;
  }
  .voucher-title {
    font-size: 15px;
    margin-bottom: 6px;
  }
  .voucher-desc {
    font-size: 12px;
    margin-bottom: 6px;
  }
  .voucher-right {
    padding: 12px;
  }
  .btn-save {
    padding: 6px 12px;
    font-size: 13px;
  }
  .page-title {
    font-size: 18px;
    margin-bottom: 16px;
  }
}
</style>
