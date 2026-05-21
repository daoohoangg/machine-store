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
      <p class="subtitle font-size-14">Thiết lập mức giảm giá khi khách hàng mua số lượng lớn.</p>

      <!-- Wholesale Navigation Tabs -->
      <div class="ws-tabs">
        <button 
          class="ws-tab-btn" 
          :class="{ active: activeWsTab === 'global' }" 
          @click="activeWsTab = 'global'"
        >
          <i class="fa-solid fa-globe"></i> Áp dụng chung (Toàn hệ thống)
        </button>
        <button 
          class="ws-tab-btn" 
          :class="{ active: activeWsTab === 'product' }" 
          @click="activeWsTab = 'product'"
        >
          <i class="fa-solid fa-box"></i> Cấu hình riêng theo từng Sản phẩm
        </button>
      </div>

      <!-- Tab 1: Global Wholesale Tiers -->
      <div v-show="activeWsTab === 'global'">
        <div class="wholesale-tier-list">
          <div v-for="(tier, index) in localWholesaleTiers" :key="'ws-'+index" class="wholesale-tier-item">
            <div class="ws-field">
              <span class="tier-label">Số lượng sản phẩm từ</span>
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
            <span v-else>Cập nhật giá sỉ chung</span>
          </button>
        </div>

        <div v-if="wholesaleStatusMsg" :class="['status-msg', isWholesaleError ? 'error' : 'success']">
          <i :class="isWholesaleError ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'"></i>
          {{ wholesaleStatusMsg }}
        </div>

        <div class="price-preview-zone ws-preview" v-if="localWholesaleTiers.length > 0">
          <h3>💡 Xem trước giá sỉ chung (Giá gốc: 1.000.000đ):</h3>
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

      <!-- Tab 2: Product Specific Wholesale Pricing -->
      <div v-show="activeWsTab === 'product'" class="product-ws-container">
        <div class="product-ws-layout">
          <!-- Left: Product List Searcher -->
          <div class="prod-search-sidebar">
            <div class="ws-search-box">
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Tìm kiếm sản phẩm..." 
                class="ws-search-input"
              />
              <i v-if="!searchPending && !isTyping" class="fa-solid fa-magnifying-glass search-icon"></i>
              <i v-else class="fa-solid fa-spinner fa-spin search-icon"></i>
            </div>
            
            <div v-if="searchPending && searchResults.length === 0" class="ws-loading">
              Đang tải sản phẩm...
            </div>
            <div v-else-if="searchResults.length === 0" class="ws-empty">
              Không tìm thấy sản phẩm nào.
            </div>
            <div v-else class="prod-selector-list">
              <div 
                v-for="p in searchResults" 
                :key="p.id" 
                class="prod-selector-item"
                :class="{ active: selectedProduct?.id === p.id }"
                @click="selectProduct(p)"
              >
                <img :src="p.image" :alt="p.title" class="prod-thumb" />
                <div class="prod-info">
                  <div class="prod-title">{{ p.title }}</div>
                  <div class="prod-meta">
                    <span class="prod-price">{{ formatPrice(p.price) }}đ</span>
                    <span v-if="hasCustomTiers(p.id)" class="custom-badge"><i class="fa-solid fa-star"></i> Sỉ riêng</span>
                  </div>
                </div>
              </div>

              <div v-if="searchResults.length > 0 && searchResults.length % 100 === 0" class="load-more-results">
                <button class="btn-load-more" :disabled="isLoadingMore" @click="handleLoadMore">
                  <i v-if="isLoadingMore" class="fa-solid fa-spinner fa-spin"></i>
                  {{ isLoadingMore ? 'Đang tải thêm...' : 'Tải thêm sản phẩm' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Custom Tiers Editor -->
          <div class="prod-tiers-editor">
            <div v-if="!selectedProduct" class="no-selection-state">
              <i class="fa-solid fa-hand-pointer"></i>
              <p>Chọn một sản phẩm từ danh sách bên trái để bắt đầu cấu hình giá sỉ riêng.</p>
            </div>
            <div v-else class="editor-active-state">
              <div class="editor-header-prod">
                <img :src="selectedProduct.image" :alt="selectedProduct.title" class="editor-thumb" />
                <div class="editor-title-box">
                  <h3>{{ selectedProduct.title }}</h3>
                  <div class="editor-price-info">
                    Giá gốc (NPP): <strong>{{ formatPrice(selectedProduct.price) }}đ</strong>
                  </div>
                </div>
              </div>

              <div class="custom-status-indicator" :class="hasCustomTiers(selectedProduct.id) ? 'custom-active' : 'custom-inactive'">
                <i :class="hasCustomTiers(selectedProduct.id) ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-info'"></i>
                <span>
                  {{ hasCustomTiers(selectedProduct.id) 
                    ? 'Sản phẩm này đang áp dụng cấu hình sỉ riêng biệt.' 
                    : 'Sản phẩm này chưa cấu hình sỉ riêng, đang áp dụng sỉ chung toàn shop.' }}
                </span>
              </div>

              <!-- Product specific tiers list -->
              <h4 class="editor-sub-title">📦 Các mức số lượng sỉ riêng biệt:</h4>
              
              <div class="wholesale-tier-list">
                <div v-for="(tier, index) in localProductTiers" :key="'pws-'+index" class="wholesale-tier-item">
                  <div class="ws-field">
                    <span class="tier-label">Số lượng sản phẩm từ</span>
                    <input v-model.number="tier.min_quantity" type="number" min="1" placeholder="Số lượng" class="ws-input" />
                  </div>
                  <div class="ws-field">
                    <span class="tier-label">Mức giảm (%)</span>
                    <input v-model.number="tier.discount_percent" type="number" step="0.1" min="0" max="100" placeholder="Mức giảm" class="ws-input" />
                  </div>
                  <div class="ws-actions">
                    <button class="ws-btn-remove" @click="removeProductTier(index)" title="Xóa mức này">
                      <i class="fa-solid fa-circle-minus"></i>
                    </button>
                    <button class="ws-btn-add" @click="addProductTier(index)" title="Thêm mức mới">
                      <i class="fa-solid fa-circle-plus"></i>
                    </button>
                  </div>
                </div>

                <div v-if="localProductTiers.length === 0" class="wholesale-tier-item ws-empty">
                  <div class="ws-field">
                    <span class="tier-label">Số lượng sản phẩm</span>
                    <input type="number" disabled placeholder="Không sỉ riêng" class="ws-input" />
                  </div>
                  <div class="ws-field">
                    <span class="tier-label">Mức giảm (%)</span>
                    <input type="number" disabled placeholder="Không sỉ riêng" class="ws-input" />
                  </div>
                  <div class="ws-actions">
                    <button class="ws-btn-add" @click="addProductTier(-1)" title="Thêm mức sỉ riêng mới">
                      <i class="fa-solid fa-circle-plus"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Product Editor Actions -->
              <div class="editor-actions-row">
                <button 
                  v-if="hasCustomTiers(selectedProduct.id)" 
                  class="btn-danger-outline" 
                  @click="handleDeleteProductTiers"
                  :disabled="isSavingProductTiers"
                >
                  <i class="fa-solid fa-trash-can"></i> Xóa sỉ riêng
                </button>
                <button 
                  class="btn-primary" 
                  @click="handleSaveProductTiers" 
                  :disabled="isSavingProductTiers"
                >
                  <span v-if="isSavingProductTiers"><i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...</span>
                  <span v-else><i class="fa-solid fa-floppy-disk"></i> Lưu sỉ riêng sản phẩm</span>
                </button>
              </div>

              <!-- Status Message -->
              <div v-if="productTiersStatusMsg" :class="['status-msg', isProductTiersError ? 'error' : 'success']">
                <i :class="isProductTiersError ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'"></i>
                {{ productTiersStatusMsg }}
              </div>

              <!-- Real-time Preview Calculation for Selected Product -->
              <div class="price-preview-zone ws-preview" v-if="localProductTiers.length > 0">
                <h3>💡 Xem trước giá sỉ riêng sản phẩm (Giá gốc: {{ formatPrice(selectedProduct.price) }}đ):</h3>
                <div class="preview-grid">
                  <div class="preview-item header">Số lượng</div>
                  <div class="preview-item header">Giảm</div>
                  <div class="preview-item header">Đơn giá sỉ riêng</div>
                  
                  <template v-for="row in productPreviewRows" :key="'pwsp-'+row.label">
                    <div class="preview-item">{{ row.label }}</div>
                    <div class="preview-item">{{ row.discount }}%</div>
                    <div class="preview-item highlighted">{{ formatPrice(row.unitPrice) }}đ</div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMembershipPrices, type TierAdjustment } from '~/composables/useMembershipPrices'
import { useWholesalePricing, type WholesaleTier } from '~/composables/useWholesalePricing'
import { useAdminAuth } from '~/composables/useAdminAuth'
import { useHomeProducts, normalizeText } from '~/composables/useHomeProducts'

const { isAdmin } = useAdminAuth()
const { tiers, saveTiers, loadTiers } = useMembershipPrices()

const localTiers = ref<TierAdjustment[]>([])
const isSaving = ref(false)
const statusMsg = ref('')
const isError = ref(false)

onMounted(async () => {
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
  const adjusted = base * (1 - percent / 100)
  return Math.round(adjusted / 1000) * 1000
}

const formatPrice = (p: number) => {
  return p ? p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '0'
}

// ── Wholesale Pricing Setup ──
const { 
  tiers: wholesaleTiers, 
  loadWholesaleTiers, 
  saveWholesaleTiers, 
  getWholesalePriceTable,
  productTiersMap,
  loadProductWholesaleTiers,
  saveProductWholesaleTiers,
  deleteProductWholesaleTiers
} = useWholesalePricing()

const activeWsTab = ref('global') // 'global' or 'product'

// Global wholesale setup variables
const localWholesaleTiers = ref<WholesaleTier[]>([])
const isSavingWholesale = ref(false)
const wholesaleStatusMsg = ref('')
const isWholesaleError = ref(false)

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

// ── Product Specific Wholesale Setup ──
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const isTyping = ref(false)
let searchTimer: any = null

watch(searchQuery, (q) => {
  isTyping.value = true
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedSearchQuery.value = q
    isTyping.value = false
  }, 300)
})

const searchOptions = computed(() => {
  const options: Record<string, any> = { limit: 100 }
  if (debouncedSearchQuery.value) {
    options.search = debouncedSearchQuery.value
  }
  return options
})

const { products: searchResultsRaw, pending: searchPending, loadMore: searchLoadMore } = useHomeProducts(searchOptions)
const currentSearchPage = ref(10)
const isLoadingMore = ref(false)

const searchResults = computed(() => {
  let raw = searchResultsRaw.value || []
  if (!searchQuery.value) return raw
  const q = normalizeText(searchQuery.value)
  return raw.filter(p =>
    normalizeText(p.title).includes(q) ||
    normalizeText(p.productCode || '').includes(q) ||
    p.id?.toString().includes(q)
  )
})

const handleLoadMore = async () => {
  isLoadingMore.value = true
  currentSearchPage.value++
  await searchLoadMore(currentSearchPage.value)
  isLoadingMore.value = false
}

// Product specific editor states
const selectedProduct = ref<any>(null)
const localProductTiers = ref<WholesaleTier[]>([])
const isSavingProductTiers = ref(false)
const productTiersStatusMsg = ref('')
const isProductTiersError = ref(false)

const selectProduct = async (prod: any) => {
  selectedProduct.value = prod
  productTiersStatusMsg.value = ''
  
  // Load custom tiers from database
  await loadProductWholesaleTiers(prod.id)
  
  // Clone tiers into local state
  localProductTiers.value = JSON.parse(JSON.stringify(productTiersMap.value[prod.id] || []))
}

const addProductTier = (afterIndex: number) => {
  const newTier: WholesaleTier = { min_quantity: 0, discount_percent: 0 }
  if (afterIndex < 0 || localProductTiers.value.length === 0) {
    localProductTiers.value.push(newTier)
  } else {
    localProductTiers.value.splice(afterIndex + 1, 0, newTier)
  }
}

const removeProductTier = (index: number) => {
  localProductTiers.value.splice(index, 1)
}

const handleSaveProductTiers = async () => {
  if (!selectedProduct.value) return
  isSavingProductTiers.value = true
  productTiersStatusMsg.value = ''
  
  try {
    const validTiers = localProductTiers.value.filter(t => t.min_quantity > 0 && t.discount_percent > 0)
    await saveProductWholesaleTiers(selectedProduct.value.id, validTiers)
    localProductTiers.value = JSON.parse(JSON.stringify(validTiers))
    
    isProductTiersError.value = false
    productTiersStatusMsg.value = 'Lưu cấu hình giá sỉ cho sản phẩm thành công!'
    
    setTimeout(() => {
      productTiersStatusMsg.value = ''
    }, 3000)
  } catch (e: any) {
    isProductTiersError.value = true
    productTiersStatusMsg.value = e.statusMessage || 'Có lỗi xảy ra khi lưu cấu hình sỉ'
  } finally {
    isSavingProductTiers.value = false
  }
}

const handleDeleteProductTiers = async () => {
  if (!selectedProduct.value) return
  if (!confirm(`Bạn có chắc chắn muốn xóa cấu hình sỉ riêng của sản phẩm "${selectedProduct.value.title}"?`)) return
  
  isSavingProductTiers.value = true
  productTiersStatusMsg.value = ''
  
  try {
    await deleteProductWholesaleTiers(selectedProduct.value.id)
    localProductTiers.value = []
    
    isProductTiersError.value = false
    productTiersStatusMsg.value = 'Đã xóa cấu hình sỉ riêng. Sản phẩm đã quay về sử dụng mức sỉ chung.'
    
    setTimeout(() => {
      productTiersStatusMsg.value = ''
    }, 3000)
  } catch (e: any) {
    isProductTiersError.value = true
    productTiersStatusMsg.value = e.statusMessage || 'Có lỗi xảy ra khi xóa cấu hình sỉ'
  } finally {
    isSavingProductTiers.value = false
  }
}

const productPreviewRows = computed(() => {
  if (!selectedProduct.value) return []
  return getWholesalePriceTable(selectedProduct.value.price, selectedProduct.value.id)
})

const hasCustomTiers = (prodId: string) => {
  return productTiersMap.value[prodId] && productTiersMap.value[prodId].length > 0
}
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

.font-size-14 {
  font-size: 14px;
  margin-bottom: 20px;
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  padding: 12px 25px;
  background: #fff;
  color: #666;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
}

.btn-danger-outline {
  padding: 12px 25px;
  background: #fff;
  color: #dc3545;
  border: 1px solid #dc3545;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-danger-outline:hover {
  background: #fff5f5;
}

.status-msg {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
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

/* ── Wholesale Sub-Navigation Tabs ── */
.ws-tabs {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

.ws-tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: #666;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ws-tab-btn:hover {
  color: #007bff;
}

.ws-tab-btn.active {
  color: #007bff;
  border-bottom-color: #007bff;
}

/* ── Product Specific Wholesale Layout ── */
.product-ws-container {
  margin-top: 10px;
}

.product-ws-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 25px;
  align-items: start;
}

.prod-search-sidebar {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 15px;
  min-height: 450px;
  display: flex;
  flex-direction: column;
}

.ws-search-box {
  position: relative;
  margin-bottom: 15px;
}

.ws-search-input {
  width: 100%;
  padding: 10px 10px 10px 35px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
}

.ws-search-box .search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.ws-loading, .ws-empty {
  text-align: center;
  padding: 30px 10px;
  color: #64748b;
  font-size: 14px;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
  margin-top: 10px;
}

.prod-selector-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 5px;
}

.prod-selector-item {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}

.prod-selector-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.prod-selector-item.active {
  background: #e0f2fe;
  border-color: #38bdf8;
}

.prod-thumb {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 4px;
  background: #fff;
  border: 1px solid #e2e8f0;
}

.prod-info {
  flex: 1;
  min-width: 0;
}

.prod-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
}

.prod-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.prod-price {
  font-size: 12px;
  color: #e11d48;
  font-weight: 700;
}

.custom-badge {
  font-size: 10px;
  background: #fef08a;
  color: #854d0e;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.load-more-results {
  text-align: center;
  margin-top: 10px;
}

.btn-load-more {
  background: #fff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 6px 15px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-load-more:hover {
  background: #f1f5f9;
}

/* ── Custom Tiers Editor Panel ── */
.prod-tiers-editor {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 20px;
  min-height: 450px;
}

.no-selection-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #94a3b8;
  text-align: center;
}

.no-selection-state i {
  font-size: 40px;
  margin-bottom: 15px;
  color: #cbd5e1;
}

.no-selection-state p {
  font-size: 15px;
  max-width: 320px;
}

.editor-header-prod {
  display: flex;
  gap: 15px;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 20px;
}

.editor-thumb {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
}

.editor-title-box h3 {
  margin: 0 0 5px;
  font-size: 18px;
  color: #1e293b;
}

.editor-price-info {
  font-size: 13px;
  color: #64748b;
}

.editor-price-info strong {
  color: #e11d48;
  font-size: 14px;
}

.custom-status-indicator {
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-status-indicator.custom-active {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.custom-status-indicator.custom-inactive {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.editor-sub-title {
  font-size: 15px;
  color: #475569;
  margin: 0 0 15px;
}

.editor-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin: 25px 0 15px;
  padding-top: 15px;
  border-top: 1px solid #f1f5f9;
}

@media (max-width: 1024px) {
  .product-ws-layout {
    grid-template-columns: 1fr;
  }
  .prod-search-sidebar {
    min-height: auto;
  }
}
</style>
