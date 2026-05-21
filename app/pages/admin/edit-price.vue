<template>
  <div class="edit-price-page">
    <div class="admin-card">
      <div class="header-back">
        <button class="back-btn" @click="$router.push('/admin')"><i class="fa-solid fa-arrow-left"></i> Trang quản trị</button>
        <h1>Cấu hình chiết khấu (Giảm giá)</h1>
      </div>
      
      <p class="subtitle">Thiết lập tỷ lệ phần trăm chiết khấu trực tiếp trên giá bán dựa trên hạng thành viên của khách hàng.</p>

      <div class="tier-list">
        <div v-for="(tier, index) in localTiers" :key="index" class="tier-item">
          <div class="tier-info">
            <span class="tier-label">Tên hạng (từ CRM):</span>
            <input v-model="tier.name" type="text" placeholder="Ví dụ: Giá NPP + 1%" class="tier-name-input" />
          </div>
          <div class="tier-setting">
            <span class="tier-label">Tỷ lệ chiết khấu (%):</span>
            <div class="input-wrapper">
              <input v-model.number="tier.percent" type="number" step="0.1" class="tier-percent-input" />
              <span class="unit">%</span>
            </div>
            <p class="helper">Nhập số dương (vd: 5) để giảm 5% giá sản phẩm cho hạng này.</p>
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

      <!-- Wholesale Pricing Section -->
      <div class="section-divider"></div>
      
      <h2 class="section-title">📦 Cấu hình giá sỉ theo số lượng</h2>
      <p class="subtitle">Thiết lập mức giảm giá khi khách hàng mua số lượng lớn. Áp dụng cho tất cả sản phẩm.</p>

      <div class="wholesale-tier-list">
        <div v-for="(tier, index) in localWholesaleTiers" :key="'ws-'+index" class="wholesale-tier-item">
          <div class="ws-field">
            <span class="tier-label">Số lượng sản phẩm</span>
            <input v-model.number="tier.min_quantity" type="number" min="1" placeholder="Số lượng sản phẩm" class="ws-input" />
          </div>
          <div class="ws-field">
            <span class="tier-label">Mức giảm (%)</span>
            <input v-model.number="tier.discount_percent" type="number" step="0.1" min="0" max="100" placeholder="Mức giảm" class="ws-input" />
          </div>
          <div class="ws-actions">
            <button class="ws-btn-remove" @click="removeWholesaleTier(index)" title="Xóa mức này">
              <i class="fa-solid fa-circle-minus"></i>
            </button>
            <button class="ws-btn-add" @click="addWholesaleTier(index)" title="Thêm mức mới">
              <i class="fa-solid fa-circle-plus"></i>
            </button>
          </div>
        </div>
        
        <!-- Empty state: show add button when no tiers -->
        <div v-if="localWholesaleTiers.length === 0" class="wholesale-tier-item ws-empty">
          <div class="ws-field">
            <span class="tier-label">Số lượng sản phẩm</span>
            <input type="number" disabled placeholder="Số lượng sản phẩm" class="ws-input" />
          </div>
          <div class="ws-field">
            <span class="tier-label">Mức giảm (%)</span>
            <input type="number" disabled placeholder="Mức giảm" class="ws-input" />
          </div>
          <div class="ws-actions">
            <button class="ws-btn-add" @click="addWholesaleTier(-1)" title="Thêm mức mới">
              <i class="fa-solid fa-circle-plus"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="ws-save-area">
        <button class="btn-primary" @click="handleSaveWholesale" :disabled="isSavingWholesale">
          <span v-if="isSavingWholesale"><i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...</span>
          <span v-else>Cập nhật giá sỉ</span>
        </button>
      </div>

      <div v-if="wholesaleStatusMsg" :class="['status-msg', isWholesaleError ? 'error' : 'success']">
        <i :class="isWholesaleError ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'"></i>
        {{ wholesaleStatusMsg }}
      </div>

      <div class="price-preview-zone ws-preview" v-if="localWholesaleTiers.length > 0">
        <h3>💡 Xem trước giá sỉ (Giá gốc: 1.000.000đ):</h3>
        <div class="preview-grid">
          <div class="preview-item header">Số lượng</div>
          <div class="preview-item header">Giảm</div>
          <div class="preview-item header">Đơn giá</div>
          
          <template v-for="row in wholesalePreviewRows" :key="'wsp-'+row.label">
            <div class="preview-item">{{ row.label }}</div>
            <div class="preview-item">{{ row.discount }}%</div>
            <div class="preview-item highlighted">{{ formatPrice(row.unitPrice) }}đ</div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMembershipPrices, type TierAdjustment } from '~/composables/useMembershipPrices'
import { useWholesalePricing, type WholesaleTier } from '~/composables/useWholesalePricing'
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
  if (confirm('Bạn có chắc chắn muốn đặt lại toàn bộ hạng về mặc định chiết khấu?')) {
    const defaultTiers = [
      { name: 'Chiết khấu 3%', percent: 3 },
      { name: 'Chiết khấu 5%', percent: 5 },
      { name: 'Chiết khấu 7%', percent: 7 },
      { name: 'Đại lý cấp 1, 2 (Mặc định)', percent: 0 },
      { name: 'Đại lý cấp 3 (Giảm 2%)', percent: 2 }
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
  // Discount: Base * (1 - percent/100)
  const adjusted = base * (1 - percent / 100)
  return Math.round(adjusted / 1000) * 1000
}

const formatPrice = (p: number) => {
  return p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// ── Wholesale Pricing ──
const { tiers: wholesaleTiers, loadWholesaleTiers, saveWholesaleTiers, getWholesalePriceTable } = useWholesalePricing()

const localWholesaleTiers = ref<WholesaleTier[]>([])
const isSavingWholesale = ref(false)
const wholesaleStatusMsg = ref('')
const isWholesaleError = ref(false)

// Load wholesale tiers on mount - add to existing onMounted
const initWholesale = async () => {
  await loadWholesaleTiers()
  localWholesaleTiers.value = JSON.parse(JSON.stringify(wholesaleTiers.value))
}
initWholesale()

const addWholesaleTier = (afterIndex: number) => {
  const newTier: WholesaleTier = { min_quantity: 0, discount_percent: 0 }
  if (afterIndex < 0 || localWholesaleTiers.value.length === 0) {
    localWholesaleTiers.value.push(newTier)
  } else {
    localWholesaleTiers.value.splice(afterIndex + 1, 0, newTier)
  }
}

const removeWholesaleTier = (index: number) => {
  localWholesaleTiers.value.splice(index, 1)
}

const handleSaveWholesale = async () => {
  isSavingWholesale.value = true
  wholesaleStatusMsg.value = ''
  
  try {
    const validTiers = localWholesaleTiers.value.filter(t => t.min_quantity > 0 && t.discount_percent > 0)
    await saveWholesaleTiers(validTiers)
    localWholesaleTiers.value = JSON.parse(JSON.stringify(validTiers))
    
    isWholesaleError.value = false
    wholesaleStatusMsg.value = 'Lưu cấu hình giá sỉ thành công!'
    
    setTimeout(() => {
      wholesaleStatusMsg.value = ''
    }, 3000)
  } catch (e: any) {
    isWholesaleError.value = true
    wholesaleStatusMsg.value = e.statusMessage || 'Có lỗi xảy ra khi lưu cấu hình giá sỉ'
  } finally {
    isSavingWholesale.value = false
  }
}

const wholesalePreviewRows = computed(() => {
  return getWholesalePriceTable(1000000)
})
</script>

<style scoped>
.edit-price-page {
  padding: 40px 10px;
  background: #f4f7f6;
  min-height: 80vh;
}

.admin-card {
  width: 100%;
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

.section-divider {
  border-top: 2px solid #eee;
  margin: 40px 0 30px;
}

.section-title {
  font-size: 24px;
  color: #333;
  margin: 0 0 5px;
}

.wholesale-tier-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.wholesale-tier-item {
  display: grid;
  grid-template-columns: 1fr 1fr 80px;
  gap: 12px;
  align-items: end;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fdfdfd;
}

.wholesale-tier-item.ws-empty {
  opacity: 0.6;
}

.ws-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ws-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.ws-actions {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  padding-bottom: 2px;
}

.ws-btn-remove {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 24px;
  padding: 4px;
  transition: transform 0.15s;
}
.ws-btn-remove:hover { transform: scale(1.15); }

.ws-btn-add {
  background: none;
  border: none;
  color: #28a745;
  cursor: pointer;
  font-size: 24px;
  padding: 4px;
  transition: transform 0.15s;
}
.ws-btn-add:hover { transform: scale(1.15); }

.ws-save-area {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.ws-preview {
  background: #e8f4fd !important;
  border-color: #b3d9f2 !important;
}

.ws-preview h3 {
  color: #0c5460 !important;
}

@media (max-width: 768px) {
  .wholesale-tier-item {
    grid-template-columns: 1fr;
  }
  .ws-actions {
    justify-content: flex-end;
  }
}
</style>
