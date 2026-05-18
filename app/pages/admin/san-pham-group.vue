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

      <!-- Section Visibility Toggles -->
      <div class="visibility-section">
        <div class="visibility-header">
          <i class="fa-solid fa-eye"></i>
          <span>Hiển thị trang chủ</span>
          <span class="visibility-hint">Bật/tắt hiển thị các khu vực trên trang chủ</span>
        </div>
        <div class="visibility-cards">
          <div class="visibility-card" :class="{ hidden: !sectionVisibility.showOutletShop }">
            <div class="vis-card-icon outlet">
              <i class="fa-solid fa-tag"></i>
            </div>
            <div class="vis-card-info">
              <div class="vis-card-name">OUTLET SHOP</div>
              <div class="vis-card-desc">Khu vực khuyến mãi đặc biệt trên trang chủ</div>
            </div>
            <button 
              class="toggle-btn" 
              :class="{ active: sectionVisibility.showOutletShop }"
              @click="toggleSection('showOutletShop')"
              :title="sectionVisibility.showOutletShop ? 'Đang hiển thị - Nhấn để ẩn' : 'Đang ẩn - Nhấn để hiển thị'"
            >
              <i class="fa-solid" :class="sectionVisibility.showOutletShop ? 'fa-eye' : 'fa-eye-slash'"></i>
              {{ sectionVisibility.showOutletShop ? 'Đang hiện' : 'Đang ẩn' }}
            </button>
          </div>

          <div class="visibility-card" :class="{ hidden: !sectionVisibility.showNewProducts }">
            <div class="vis-card-icon new-product">
              <i class="fa-solid fa-star"></i>
            </div>
            <div class="vis-card-info">
              <div class="vis-card-name">Sản phẩm mới</div>
              <div class="vis-card-desc">Khu vực sản phẩm mới nhất trên trang chủ</div>
            </div>
            <button 
              class="toggle-btn" 
              :class="{ active: sectionVisibility.showNewProducts }"
              @click="toggleSection('showNewProducts')"
              :title="sectionVisibility.showNewProducts ? 'Đang hiển thị - Nhấn để ẩn' : 'Đang ẩn - Nhấn để hiển thị'"
            >
              <i class="fa-solid" :class="sectionVisibility.showNewProducts ? 'fa-eye' : 'fa-eye-slash'"></i>
              {{ sectionVisibility.showNewProducts ? 'Đang hiện' : 'Đang ẩn' }}
            </button>
          </div>
        </div>

        <div class="visibility-actions">
          <button class="btn-save-visibility" @click="handleSaveVisibility" :disabled="isSavingVisibility">
            <i class="fa-solid" :class="isSavingVisibility ? 'fa-spinner fa-spin' : 'fa-floppy-disk'"></i>
            {{ isSavingVisibility ? 'Đang lưu...' : 'Lưu cài đặt hiển thị' }}
          </button>
          <transition name="fade">
            <span v-if="showVisibilitySuccess" class="vis-success-msg">
              <i class="fa-solid fa-circle-check"></i> Đã lưu!
            </span>
          </transition>
        </div>
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
            <button v-if="groupSearchQuery" class="clear-btn" @click="groupSearchQuery = ''" title="Xóa tìm kiếm">
              <i class="fa-solid fa-xmark"></i>
            </button>
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
          <h3>Thêm sản phẩm mới ({{ searchResults.length }})</h3>

          <!-- Category Filter -->
          <div class="category-filter-row">
            <label class="category-filter-label"><i class="fa-solid fa-list"></i> Danh mục:</label>
            <div class="category-select-wrapper">
              <select v-model="selectedCategoryId" class="category-select" :disabled="categoriesLoading">
                <option :value="null">— Tất cả danh mục —</option>
                <template v-for="cat in categories" :key="cat.id">
                  <option :value="cat.id">{{ cat.name }}</option>
                  <option v-for="child in cat.children" :key="child.id" :value="child.id">&nbsp;&nbsp;↳ {{ child.name }}</option>
                </template>
              </select>
              <i v-if="categoriesLoading" class="fa-solid fa-spinner fa-spin cat-spinner"></i>
              <i v-else class="fa-solid fa-chevron-down cat-chevron"></i>
            </div>
            <button v-if="selectedCategoryId" class="btn-reset-cat" @click="selectedCategoryId = null" title="Bỏ lọc danh mục">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Tìm kiếm sản phẩm..." 
            />
            <i v-if="!searchPending && !isTyping" class="fa-solid fa-magnifying-glass search-icon"></i>
            <i v-else class="fa-solid fa-spinner fa-spin search-icon"></i>
            <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''" title="Xóa tìm kiếm">
              <i class="fa-solid fa-xmark"></i>
            </button>
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
          <div v-if="searchResults.length > 0 && searchResults.length % 100 === 0" class="load-more-results">
            <button class="btn-load-more" :disabled="isLoadingMore" @click="handleLoadMore">
              <i v-if="isLoadingMore" class="fa-solid fa-spinner fa-spin"></i>
              {{ isLoadingMore ? 'Đang tải thêm...' : 'Tải thêm sản phẩm' }}
            </button>
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
import { useHomeProducts, normalizeText } from '~/composables/useHomeProducts'
import { useCategories } from '~/composables/useCategories'
import { useSectionVisibility } from '~/composables/useSectionVisibility'

useHead({ title: 'Quản lý Nhóm Sản phẩm - Admin' })

const { isAdmin, initAuth } = useAdminAuth()
const { manualGroups, fetchManualGroups, saveManualGroups, addToGroup, removeFromGroup, clearGroup } = useManualGroups()

const groupOptions = [
  { id: 'outlet-shop', name: 'OUTLET SHOP' },
  { id: 'new-products', name: 'Sản phẩm mới' }
]

const activeGroup = ref('outlet-shop')
const searchQuery = ref('')
const groupSearchQuery = ref('')
const selectedCategoryId = ref<number | null>(null)
const isSaving = ref(false)
const showSuccess = ref(false)
const loadingManual = ref(true)
const showConfirmClear = ref(false)

// Categories
const { categories, isLoading: categoriesLoading, fetchCategories } = useCategories()

const debouncedSearchQuery = ref('')
const debouncedGroupSearchQuery = ref('')

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

let groupSearchTimer: any = null
watch(groupSearchQuery, (q) => {
  if (groupSearchTimer) clearTimeout(groupSearchTimer)
  groupSearchTimer = setTimeout(() => {
    debouncedGroupSearchQuery.value = q
  }, 300)
})

// For searching products
const searchOptions = computed(() => {
  const options: Record<string, any> = { limit: 100 }
  if (debouncedSearchQuery.value) {
    options.search = debouncedSearchQuery.value
  }
  if (selectedCategoryId.value) {
    options.categoryId = selectedCategoryId.value
  }
  return options
})

// Reset search when category changes
watch(selectedCategoryId, () => {
  searchQuery.value = ''
  debouncedSearchQuery.value = ''
  currentSearchPage.value = 10
})
const { products: searchResultsRaw, pending: searchPending, loadMore } = useHomeProducts(searchOptions)
const currentSearchPage = ref(10)
const isLoadingMore = ref(false)

watch(debouncedSearchQuery, () => {
  currentSearchPage.value = 10
})

const handleLoadMore = async () => {
  isLoadingMore.value = true
  currentSearchPage.value++
  await loadMore(currentSearchPage.value)
  isLoadingMore.value = false
}

const currentGroupProducts = computed(() => {
  const baseList = manualGroups.value[activeGroup.value] || []
  if (!groupSearchQuery.value) return baseList
  
  const query = normalizeText(groupSearchQuery.value)
  return baseList.filter(p => 
    normalizeText(p.title).includes(query) || 
    p.id?.toString().includes(query) ||
    normalizeText(p.productCode || '').includes(query)
  )
})

// Section Visibility
const { visibility: sectionVisibility, fetchVisibility, saveVisibility, isSaving: isSavingVisibility } = useSectionVisibility()
const showVisibilitySuccess = ref(false)

const toggleSection = (key: 'showOutletShop' | 'showNewProducts') => {
  sectionVisibility.value[key] = !sectionVisibility.value[key]
}

const handleSaveVisibility = async () => {
  try {
    await saveVisibility()
    showVisibilitySuccess.value = true
    setTimeout(() => { showVisibilitySuccess.value = false }, 3000)
  } catch (e: any) {
    alert('Lỗi khi lưu cài đặt hiển thị: ' + e.message)
  }
}

onMounted(async () => {
  initAuth()
  await Promise.all([
    fetchManualGroups(),
    fetchCategories(),
    fetchVisibility()
  ])
  loadingManual.value = false
})

// Collect all descendant category IDs for a given root ID (for client-side filtering)
const getDescendantIds = (rootId: number): Set<number> => {
  const ids = new Set<number>()
  const walk = (cats: any[]) => {
    for (const c of cats) {
      if (c.id === rootId) {
        // Gather self + all descendants
        const gatherAll = (node: any) => {
          ids.add(node.id)
          node.children?.forEach(gatherAll)
        }
        gatherAll(c)
        return
      }
      if (c.children?.length) walk(c.children)
    }
  }
  walk(categories.value || [])
  return ids
}

const searchResults = computed(() => {
  let raw = searchResultsRaw.value || []

  // Client-side category filter (guards against fallback global fetch leaking other categories)
  if (selectedCategoryId.value) {
    const allowedIds = getDescendantIds(selectedCategoryId.value)
    if (allowedIds.size > 0) {
      raw = raw.filter(p => p.categoryId !== null && allowedIds.has(Number(p.categoryId)))
    }
  }

  if (!searchQuery.value) return raw

  const q = normalizeText(searchQuery.value)
  return raw.filter(p =>
    normalizeText(p.title).includes(q) ||
    normalizeText(p.productCode || '').includes(q) ||
    p.id?.toString().includes(q)
  )
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

/* ---- Section Visibility ---- */
.visibility-section {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.visibility-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-weight: 700;
  font-size: 15px;
  color: #333;
}

.visibility-header i {
  color: #e31b1b;
  font-size: 16px;
}

.visibility-hint {
  font-size: 13px;
  font-weight: 400;
  color: #888;
  margin-left: 4px;
}

.visibility-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.visibility-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1.5px solid #e8e8e8;
  border-radius: 8px;
  background: #fafafa;
  flex: 1;
  min-width: 280px;
  transition: all 0.25s;
}

.visibility-card.hidden {
  opacity: 0.6;
  border-style: dashed;
  background: #f5f5f5;
}

.vis-card-icon {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #fff;
  flex-shrink: 0;
}

.vis-card-icon.outlet {
  background: linear-gradient(135deg, #4d90e0, #2563eb);
}

.vis-card-icon.new-product {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.vis-card-info {
  flex: 1;
  min-width: 0;
}

.vis-card-name {
  font-weight: 700;
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
}

.vis-card-desc {
  font-size: 12px;
  color: #888;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 20px;
  border: 1.5px solid #ccc;
  background: #fff;
  color: #999;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.toggle-btn.active {
  border-color: #28a745;
  background: #f0fff4;
  color: #28a745;
}

.toggle-btn:not(.active) {
  border-color: #dc3545;
  background: #fff5f5;
  color: #dc3545;
}

.toggle-btn:hover {
  filter: brightness(0.93);
}

.visibility-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  border-top: 1px solid #f0f0f0;
  padding-top: 14px;
}

.btn-save-visibility {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px;
  background: #e31b1b;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save-visibility:disabled {
  opacity: 0.7;
  cursor: wait;
}

.btn-save-visibility:hover:not(:disabled) {
  background: #c41515;
}

.vis-success-msg {
  color: #28a745;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* ---- Group Selector ---- */
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

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #aaa;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.clear-btn:hover {
  color: #e31b1b;
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

/* Category filter */
.category-filter-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.category-filter-label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.category-select-wrapper {
  position: relative;
  flex: 1;
  min-width: 180px;
}

.category-select {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
  color: #333;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.2s;
}

.category-select:focus {
  outline: none;
  border-color: #e31b1b;
}

.category-select:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.cat-chevron, .cat-spinner {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 12px;
  pointer-events: none;
}

.btn-reset-cat {
  background: none;
  border: 1px solid #ccc;
  border-radius: 6px;
  color: #888;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-reset-cat:hover {
  border-color: #e31b1b;
  color: #e31b1b;
}

.load-more-results {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px dashed #ddd;
}

.btn-load-more {
  padding: 10px 25px;
  background: #fff;
  color: #e31b1b;
  border: 2px solid #e31b1b;
  border-radius: 30px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.btn-load-more:hover:not(:disabled) {
  background: #e31b1b;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(227, 27, 27, 0.2);
}

.btn-load-more:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

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
