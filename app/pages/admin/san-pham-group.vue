<template>
  <div class="admin-page">
    <div v-if="!isAdmin" class="login-wrapper">
      <div class="login-box">
        <h2>Bạn cần đăng nhập quản trị</h2>
        <NuxtLink to="/admin" class="btn-primary" style="display:inline-block; margin-top:15px; text-decoration:none;">Về trang Đăng nhập</NuxtLink>
      </div>
    </div>
    
    <div v-else class="admin-dashboard">
      <div class="admin-header">
        <div class="d-flex align-items-center gap-15">
          <NuxtLink to="/admin" class="btn-outline back-btn"><i class="fa-solid fa-arrow-left"></i> Trở về</NuxtLink>
          <h1>Quản lý Nhóm Sản phẩm</h1>
        </div>
        <button class="btn-primary" @click="handleSave" :disabled="isSaving">
          <i class="fa-solid fa-floppy-disk"></i> {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
        </button>
      </div>

      <div class="group-selector">
        <button 
          v-for="g in groupOptions" 
          :key="g.id"
          class="group-tab"
          :class="{ active: activeGroup === g.id }"
          @click="activeGroup = g.id"
        >
          {{ g.name }}
        </button>
      </div>
      
      <div class="management-layout">
        <div class="current-list-section">
          <div class="section-title-row">
            <h3>Sản phẩm trong nhóm ({{ currentGroupProducts.length }})</h3>
            <div class="clear-all-controls">
              <button v-if="manualGroups[activeGroup]?.length > 0 && !showConfirmClear" class="btn-clear-all" @click="showConfirmClear = true">
                <i class="fa-solid fa-broom"></i> Xóa tất cả
              </button>
              <div v-if="showConfirmClear" class="confirm-box">
                <span>Xác nhận xóa hết?</span>
                <button class="btn-confirm" @click="handleClearAll">Đúng</button>
                <button class="btn-cancel" @click="showConfirmClear = false">Hủy</button>
              </div>
            </div>
          </div>

          <!-- Group Filter -->
          <div class="search-box-mini">
            <input 
              type="text" 
              v-model="groupSearchQuery" 
              placeholder="Lọc sản phẩm trong nhóm theo tên..." 
            />
            <i class="fa-solid fa-filter search-icon"></i>
          </div>

          <div v-if="loadingManual" class="loading">Đang tải...</div>
          <div v-else-if="currentGroupProducts.length === 0" class="empty-state">
            {{ groupSearchQuery ? 'Không tìm thấy sản phẩm nào khớp với từ khóa.' : 'Chưa có sản phẩm nào trong nhóm này.' }}
          </div>
          <div v-else class="product-list-mini">
            <div v-for="p in currentGroupProducts" :key="p.id" class="product-item-mini">
              <img :src="p.image" :alt="p.title" class="p-thumb" />
              <div class="p-info">
                <div class="p-name">{{ p.title }}</div>
                <div class="p-price">{{ formatPrice(p.price) }}đ</div>
              </div>
              <button class="btn-action btn-remove" @click="removeFromActiveGroup(p.id)" title="Gỡ khỏi nhóm">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="search-section">
          <h3>Thêm sản phẩm mới</h3>
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Tìm kiếm sản phẩm toàn hệ thống..." 
            />
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
          </div>

          <div v-if="searchPending" class="loading">
            <div class="spinner"></div> Đang tìm kiếm...
          </div>
          <div v-else-if="searchResults.length === 0 && searchQuery" class="empty-state">
            Không tìm thấy sản phẩm nào.
          </div>
          <div v-else class="search-results">
            <div v-for="p in searchResults" :key="p.id" class="product-item-mini">
              <img :src="p.image" :alt="p.title" class="p-thumb" />
              <div class="p-info">
                <div class="p-name">{{ p.title }}</div>
                <div class="p-price">{{ formatPrice(p.price) }}đ</div>
              </div>
              <button 
                class="btn-action btn-add" 
                @click="addToActiveGroup(p)"
                :disabled="isInActiveGroup(p.id)"
                :title="isInActiveGroup(p.id) ? 'Đã có trong nhóm' : 'Thêm vào nhóm'"
              >
                <i class="fa-solid" :class="isInActiveGroup(p.id) ? 'fa-check-double' : 'fa-plus-circle'"></i>
                <span>{{ isInActiveGroup(p.id) ? 'Đã có' : 'Thêm' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification -->
    <transition name="fade">
      <div v-if="showSuccess" class="notification-toast">
        <i class="fa-solid fa-circle-check"></i> Đã lưu thành công!
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminAuth } from '~/composables/useAdminAuth'
import { useManualGroups } from '~/composables/useManualGroups'
import { useHomeProducts } from '~/composables/useHomeProducts'

useHead({ title: 'Quản lý Nhóm Sản phẩm - Admin' })

const { isAdmin, initAuth } = useAdminAuth()
const { manualGroups, fetchManualGroups, saveManualGroups, addToGroup, removeFromGroup, clearGroup } = useManualGroups()

const groupOptions = [
  { id: 'outlet-shop', name: 'OUTLET SHOP (⚡)' },
  { id: 'new-products', name: 'Sản phẩm mới (🆕)' }
]

const activeGroup = ref('outlet-shop')
const searchQuery = ref('')
const groupSearchQuery = ref('')
const isSaving = ref(false)
const showSuccess = ref(false)
const loadingManual = ref(true)
const showConfirmClear = ref(false)

// For searching products
const searchOptions = computed(() => {
  const options = { limit: 100 } // Fetch more for selection
  if (searchQuery.value) {
    (options as any).search = searchQuery.value
  }
  return options
})
const { products: searchResultsRaw, pending: searchPending } = useHomeProducts(searchOptions)

const currentGroupProducts = computed(() => {
  const baseList = manualGroups.value[activeGroup.value] || []
  if (!groupSearchQuery.value) return baseList
  
  const query = groupSearchQuery.value.toLowerCase()
  return baseList.filter(p => 
    p.title?.toLowerCase().includes(query) || 
    p.id?.toString().includes(query) ||
    p.productCode?.toLowerCase().includes(query)
  )
})

onMounted(async () => {
  initAuth()
  await fetchManualGroups()
  loadingManual.value = false
})

const searchResults = computed(() => {
  return searchResultsRaw.value || []
})

const currentGroupProductsLocal = ref([]) // Not needed anymore as we use computed directly from manualGroups
// However, to keep it simple, let's keep the computed name 'currentGroupProducts' 
// and just map it to the store.

const formatPrice = (p) => p?.toLocaleString('vi-VN') || '0'

const isInActiveGroup = (id) => {
  return manualGroups.value[activeGroup.value].some(p => String(p.id) === String(id))
}

const addToActiveGroup = (product) => {
  addToGroup(activeGroup.value, product)
}

const removeFromActiveGroup = (id) => {
  removeFromGroup(activeGroup.value, String(id))
}

const handleClearAll = async () => {
  if (confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong nhóm này?')) {
    clearGroup(activeGroup.value)
    showConfirmClear.value = false
    // User asked to remember to save to manual-groups file
    await handleSave()
  }
}

const handleSave = async () => {
  isSaving.value = true
  try {
    await saveManualGroups()
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false }, 3000)
  } catch (e) {
    alert('Lỗi khi lưu: ' + e.message)
  } finally {
    isSaving.value = false
  }
}

// Watch activeGroup to potentially refresh product details
// refreshGroupProducts() is no longer needed as currentGroupProducts is reactive to manualGroups
watch(activeGroup, () => {
  // refreshGroupProducts()
})
</script>

<style scoped>
.admin-page {
  padding: 40px 15px;
  min-height: 70vh;
}

.admin-dashboard {
  width: 100%;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.admin-header h1 {
  font-size: 24px;
  margin: 0;
}

.d-flex { display: flex; }
.align-items-center { align-items: center; }
.gap-15 { gap: 15px; }

.group-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
}

.group-tab {
  padding: 10px 20px;
  background: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.group-tab.active {
  background: #e31b1b;
  color: #fff;
  border-color: #e31b1b;
}

.management-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: start;
}

h3 {
  font-size: 18px;
  margin-bottom: 0;
  color: #444;
  border-left: 4px solid #e31b1b;
  padding-left: 10px;
}

.section-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-clear-all {
  background: #fff;
  border: 1px solid #dc3545;
  color: #dc3545;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-clear-all:hover {
  background: #dc3545;
  color: #fff;
}

.confirm-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff5f5;
  padding: 4px 8px;
  border: 1px solid #feb2b2;
  border-radius: 6px;
  font-size: 13px;
}

.btn-confirm {
  background: #dc3545;
  color: #fff;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-cancel {
  background: #edf2f7;
  color: #4a5568;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
}

.current-list-section, .search-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  min-height: 400px;
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-box input {
  width: 100%;
  padding: 12px 15px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
}

.search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

.search-box-mini {
  position: relative;
  margin-bottom: 20px;
}

.search-box-mini input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: #fdfdfd;
}

.search-box-mini .search-icon {
  font-size: 14px;
  color: #aaa;
}

.product-list-mini, .search-results {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
}

/* Horizontal layout for search results to use full width */
.search-results {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  max-height: 600px;
}

.product-item-mini {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  gap: 12px;
  transition: background 0.2s;
}

.product-item-mini:hover {
  background: #f9f9f9;
}

.p-thumb {
  width: 50px;
  height: 50px;
  object-fit: contain;
  background: #fff;
  border: 1px solid #eee;
}

.p-info {
  flex: 1;
  min-width: 0;
}

.p-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.p-price {
  font-size: 13px;
  color: #e31b1b;
  font-weight: 700;
}

.btn-action {
  height: 36px;
  padding: 0 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-add {
  background: #28a745;
  color: #fff;
}
.btn-add:hover:not(:disabled) { background: #218838; }
.btn-add:disabled { background: #e0e0e0; color: #888; cursor: not-allowed; }

.btn-remove {
  width: 36px;
  padding: 0;
  background: #dc3545;
  color: #fff;
}
.btn-remove:hover { background: #c82333; }

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-style: italic;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-top: 2px solid #e31b1b;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.notification-toast {
  position: fixed;
  bottom: 30px;
  right: 30px;
  background: #28a745;
  color: #fff;
  padding: 15px 25px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  z-index: 1000;
}

.btn-primary {
  background: #e31b1b;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:disabled { opacity: 0.7; cursor: wait; }

.btn-outline {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  color: #555;
  text-decoration: none;
  font-weight: 600;
}

@media (max-width: 900px) {
  .management-layout { grid-template-columns: 1fr; }
}
</style>
