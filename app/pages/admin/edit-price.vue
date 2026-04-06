<template>
  <div class="edit-price-page container">
    <div class="admin-card">
      <div class="header-back">
        <button class="back-btn" @click="$router.push('/admin')"><i class="fa-solid fa-arrow-left"></i> Trang quản trị</button>
        <h1>Cấu hình chiết khấu theo hạng</h1>
      </div>
      
      <p class="subtitle">Thiết lập tỷ lệ phần trăm điều chỉnh giá bán dựa trên hạng thành viên của khách hàng.</p>

      <div class="tier-list">
        <div v-for="(tier, index) in localTiers" :key="index" class="tier-item">
          <div class="tier-info">
            <span class="tier-label">Tên hạng (từ CRM):</span>
            <input v-model="tier.name" type="text" placeholder="Ví dụ: Giá NPP + 1%" class="tier-name-input" />
          </div>
          <div class="tier-setting">
            <span class="tier-label">Điều chỉnh (%):</span>
            <div class="input-wrapper">
              <input v-model.number="tier.percent" type="number" step="0.1" class="tier-percent-input" />
              <span class="unit">%</span>
            </div>
            <p class="helper">Dùng số dương (+) để tăng giá, số âm (-) để giảm giá.</p>
          </div>
          <button class="btn-remove" @click="removeTier(index)" title="Xóa hạng này">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>

      <div class="admin-actions">
        <button class="btn-add" @click="addTier">
          <i class="fa-solid fa-plus"></i> Thêm hạng mới
        </button>
        <div class="main-buttons">
          <button class="btn-secondary" @click="resetTiers">Đặt lại mặc định</button>
          <button class="btn-primary" @click="handleSave" :disabled="isSaving">
            <span v-if="isSaving"><i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...</span>
            <span v-else>Lưu cấu hình</span>
          </button>
        </div>
      </div>

      <div v-if="statusMsg" :class="['status-msg', isError ? 'error' : 'success']">
        <i :class="isError ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'"></i>
        {{ statusMsg }}
      </div>

      <div class="price-preview-zone">
        <h3>💡 Xem trước tính toán:</h3>
        <div class="preview-grid">
          <div class="preview-item header">Hạng</div>
          <div class="preview-item header">Giá Gốc (NPP)</div>
          <div class="preview-item header">Giá Sau Điều Chỉnh</div>
          
          <template v-for="tier in localTiers" :key="'preview-'+tier.name">
            <div class="preview-item">{{ tier.name || 'Chưa đặt tên' }}</div>
            <div class="preview-item">1.000.000đ</div>
            <div class="preview-item highlighted">{{ formatPrice(calculatePreview(1000000, tier.percent)) }}đ</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMembershipPrices, type TierAdjustment } from '~/composables/useMembershipPrices'
import { useAdminAuth } from '~/composables/useAdminAuth'

const { isAdmin } = useAdminAuth()
const { tiers, saveTiers, loadTiers } = useMembershipPrices()

const localTiers = ref<TierAdjustment[]>([])
const isSaving = ref(false)
const statusMsg = ref('')
const isError = ref(false)

onMounted(async () => {
  if (!isAdmin.value && process.client) {
    // window.location.href = '/auth/login'
    // return
  }
  await loadTiers()
  localTiers.value = JSON.parse(JSON.stringify(tiers.value))
})

const addTier = () => {
  localTiers.value.push({ name: '', percent: 0 })
}

const removeTier = (index: number) => {
  localTiers.value.splice(index, 1)
}

const resetTiers = () => {
  if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ hạng về mặc định?')) {
    const defaultTiers = [
      { name: 'Giá NPP + 1%', percent: 1 },
      { name: 'Giá NPP + 2%', percent: 2 },
      { name: 'Giá NPP + 3%', percent: 3 },
      { name: 'đại lý cấp 1, 2 ( Giá NPP )', percent: 0 },
      { name: 'đại lý cấp 3 ( +5% giá NPP )', percent: 5 }
    ]
    localTiers.value = JSON.parse(JSON.stringify(defaultTiers))
  }
}

const handleSave = async () => {
  isSaving.value = true
  statusMsg.value = ''
  
  try {
    // Basic validation
    const validTiers = localTiers.value.filter(t => t.name && t.name.trim() !== '')
    await saveTiers(validTiers)
    
    isError.value = false
    statusMsg.value = 'Lưu cấu hình giá lên cơ sở dữ liệu thành công!'
    
    setTimeout(() => {
      statusMsg.value = ''
    }, 3000)
  } catch (e: any) {
    isError.value = true
    statusMsg.value = e.statusMessage || 'Có lỗi xảy ra khi lưu cấu hình'
  } finally {
    isSaving.value = false
  }
}

const calculatePreview = (base: number, percent: number) => {
  const adjusted = base * (1 + percent / 100)
  return Math.round(adjusted / 1000) * 1000
}

const formatPrice = (p: number) => {
  return p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
</script>

<style scoped>
.edit-price-page {
  padding: 40px 10px;
  background: #f4f7f6;
  min-height: 80vh;
}

.admin-card {
  max-width: 850px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 30px;
}

.header-back {
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
  margin-bottom: 20px;
}

h1 {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.subtitle {
  color: #888;
  margin-bottom: 35px;
}

.tier-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.tier-item {
  display: grid;
  grid-template-columns: 1fr 1fr 40px;
  gap: 15px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fdfdfd;
  position: relative;
}

.tier-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
}

.tier-name-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tier-percent-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}

.unit {
  font-weight: 700;
  color: #333;
}

.helper {
  font-size: 11px;
  color: #aaa;
  margin-top: 5px;
}

.btn-remove {
  align-self: center;
  background: none;
  border: none;
  color: #ff5252;
  cursor: pointer;
  font-size: 18px;
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.btn-remove:hover {
  background: #fff0f0;
}

.admin-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  border-top: 1px solid #eee;
  padding-top: 25px;
  margin-top: 10px;
}

.main-buttons {
  display: flex;
  gap: 12px;
}

.btn-add {
  background: #f1f3f4;
  border: 1px dashed #ccc;
  color: #1a73e8;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #e8f0fe;
  border-color: #1a73e8;
}

.btn-primary {
  padding: 12px 25px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  cursor: pointer;
}

.btn-secondary {
  padding: 12px 25px;
  background: #fff;
  color: #666;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
}

.status-msg {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 6px;
}

.status-msg.success { background: #e6ffed; border: 1px solid #b7eb8f; color: #52c41a; }
.status-msg.error { background: #fff1f0; border: 1px solid #ffa39e; color: #f5222d; }

.price-preview-zone {
  margin-top: 40px;
  padding: 20px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
}

.price-preview-zone h3 { font-size: 16px; margin-bottom: 15px; color: #856404; }

.preview-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 1px;
  background: #e8e8e8;
  border: 1px solid #e8e8e8;
}

.preview-item {
  background: #fff;
  padding: 12px;
  font-size: 13px;
}

.preview-item.header {
  background: #fafafa;
  font-weight: 700;
  color: #333;
}

.preview-item.highlighted {
  font-weight: 700;
  color: #d4161c;
}

@media (max-width: 768px) {
  .tier-item { grid-template-columns: 1fr; }
  .btn-remove { position: absolute; top: 10px; right: 10px; }
  .admin-actions { flex-direction: column; align-items: stretch; }
  .main-buttons { flex-direction: column; }
}
</style>
