<template>
  <section class="home-voucher">
    <div class="voucher-header">
      <div class="vh-left">
        <h2 class="vh-title">Mã giảm giá</h2>
      </div>
      <div class="vh-right">
        <NuxtLink to="/voucher" class="view-all">Xem tất cả <i class="fa-solid fa-chevron-right"></i></NuxtLink>
      </div>
    </div>

    <div class="voucher-body">
      <div v-if="isLoading" class="loading-state">
        <i class="fa-solid fa-spinner fa-spin"></i> Đang tải mã giảm giá...
      </div>

      <div v-else-if="vouchers.length === 0" class="empty-state">
        <p>Hiện chưa có mã giảm giá nào.</p>
      </div>

      <div v-else class="voucher-list">
        <!-- Horizontal scrolling or grid for home page vouchers -->
        <div 
          v-for="voucher in displayVouchers" 
          :key="voucher.id" 
          class="voucher-card"
          :class="{ 'is-saved': voucher.saved }"
        >
          <div class="voucher-left">
            <div class="voucher-icon">
              <i class="fa-solid fa-ticket-simple"></i>
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
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAbahaApi } from '~/composables/useAbahaApi'

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

// Only show top 2 vouchers on home page
const displayVouchers = computed(() => {
  return vouchers.value.slice(0, 4)
})

const fetchVouchers = async () => {
  try {
    isLoading.value = true
    let res = null
    try {
      res = await request<any>('voucher_campaign/index', {
        method: 'POST',
        body: {}
      })
    } catch (apiError) {
      console.warn('API trả về lỗi, sẽ dùng mock data:', apiError)
    }
    
    // Xử lý response theo định dạng API Abaha
    const rawData = res?.data?.data || res?.data || res || []
    let items = Array.isArray(rawData) ? rawData : []
    
    // Mock data always appended for testing
    const mockVouchers = [
      {
        id: 9991,
        name: 'Mã giảm giá 50K',
        description: 'Giảm 50K cho đơn hàng từ 500K.',
        end_date: '31/12/2026',
        code: 'GIAM50K'
      },
      {
        id: 9992,
        name: 'Miễn phí vận chuyển',
        description: 'Giảm tối đa 30K phí vận chuyển.',
        end_date: '31/12/2026',
        code: 'FREESHIP'
      }
    ]
    items = [...mockVouchers, ...items]

    vouchers.value = items.map((v: any, index: number) => {
      // Định dạng ngày hết hạn
      let expiry = 'Không giới hạn'
      if (v.end_time) {
        // Phụ thuộc API trả về timestamp s hay ms
        const ts = String(v.end_time).length === 10 ? v.end_time * 1000 : v.end_time
        expiry = new Date(ts).toLocaleDateString('vi-VN')
      } else if (v.end_date) {
        expiry = String(v.end_date)
      }

      return {
        id: v.id || index,
        title: v.name || v.title || 'Mã giảm giá',
        description: v.description || v.content || 'Áp dụng cho đơn hàng thỏa điều kiện.',
        expiryDate: expiry,
        saved: false,
        code: v.code || ''
      }
    })
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
.home-voucher {
  background: #fff;
  border: 1px solid #e0e0e0;
  margin-top: 20px;
}

.voucher-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vh-title {
  font-size: 22px;
  font-weight: 700;
  text-transform: uppercase;
  margin: 0;
  color: #333;
  border-left: 4px solid #ffcc00;
  padding-left: 10px;
}

.view-all {
  font-size: 14px;
  color: #0066cc;
  text-decoration: none;
  font-weight: 500;
}

.view-all:hover {
  text-decoration: underline;
}

.voucher-body {
  padding: 20px;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* Horizontal scrolling for mobile, grid for desktop */
.voucher-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
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
  width: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  border-right: 2px dashed #e0e0e0;
  position: relative;
  flex-shrink: 0;
}

.voucher-icon {
  font-size: 28px;
}

.cutout {
  position: absolute;
  right: -8px;
  width: 16px;
  height: 16px;
  background: #fff; /* Match background of home-voucher */
  border-radius: 50%;
  border: 1px solid #e0e0e0;
}

.cutout.top {
  top: -8px;
  border-bottom-color: transparent;
  border-left-color: transparent;
  transform: rotate(45deg);
}

.cutout.bottom {
  bottom: -8px;
  border-top-color: transparent;
  border-right-color: transparent;
  transform: rotate(-135deg);
}

.voucher-main {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.voucher-title {
  font-size: 16px;
  font-weight: 700;
  color: #e31b1b;
  margin: 0 0 6px;
}

.voucher-desc {
  font-size: 13px;
  color: #555;
  margin: 0 0 8px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.voucher-expiry {
  font-size: 11px;
  color: #888;
  margin: 0;
  font-style: italic;
}

.voucher-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.btn-save {
  background: #0066cc;
  color: #fff;
  border: none;
  padding: 6px 12px;
  font-size: 13px;
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

@media (max-width: 900px) {
  .voucher-list {
    display: flex;
    overflow-x: auto;
    padding-bottom: 8px;
    scroll-snap-type: x mandatory;
    margin: 0 -20px;
    padding: 0 20px 10px 20px;
  }
  
  .voucher-card {
    min-width: 280px;
    scroll-snap-align: start;
    flex-shrink: 0;
  }
}

@media (max-width: 600px) {
  .vh-title { font-size: 18px; }
  .voucher-left { width: 70px; }
  .voucher-icon { font-size: 20px; }
  .voucher-title { font-size: 14px; margin-bottom: 4px; }
  .voucher-desc { font-size: 12px; margin-bottom: 4px; }
  .btn-save { padding: 5px 10px; font-size: 12px; }
}
</style>
