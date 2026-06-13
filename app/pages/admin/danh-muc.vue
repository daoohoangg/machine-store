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
          <h1>Quản lý Hiển thị Danh mục</h1>
        </div>
        <button class="btn-primary" @click="handleSave" :disabled="isSaving">
          <i class="fa-solid" :class="isSaving ? 'fa-spinner fa-spin' : 'fa-floppy-disk'"></i>
          {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
        </button>
      </div>

      <div class="info-banner">
        <i class="fa-solid fa-circle-info"></i>
        <span>
          Cài đặt danh mục nào sẽ được hiển thị trên menu chính và trang chủ. Các danh mục bị ẩn sẽ không xuất hiện với người dùng bình thường.
        </span>
      </div>

      <div class="category-list-container" v-if="categories.length > 0">
        <div class="category-tree">
          <div v-for="cat in categories" :key="cat.id" class="category-node root-node">
            <!-- Root category row -->
            <div class="category-row" :class="{ 'is-hidden': !isCategoryVisible(cat.id) }">
              <div class="cat-info">
                <img v-if="cat.image" :src="cat.image" class="cat-thumb" />
                <div v-else class="cat-thumb-placeholder"><i class="fa-solid fa-folder"></i></div>
                <div class="cat-name-box">
                  <div class="cat-name">{{ cat.name }}</div>
                  <div class="cat-meta">ID: {{ cat.id }} | Sắp xếp: {{ cat.ordering }}</div>
                </div>
              </div>

              <div class="cat-action">
                <button
                  class="toggle-btn"
                  :class="{ active: isCategoryVisible(cat.id) }"
                  @click="toggleVisibility(cat.id)"
                >
                  <i class="fa-solid" :class="isCategoryVisible(cat.id) ? 'fa-eye' : 'fa-eye-slash'"></i>
                  {{ isCategoryVisible(cat.id) ? 'Đang hiển thị' : 'Đang ẩn' }}
                </button>
              </div>
            </div>

            <!-- Children categories -->
            <div v-if="cat.children && cat.children.length > 0" class="children-container">
              <div v-for="child in cat.children" :key="child.id" class="category-row child-row" :class="{ 'is-hidden': !isCategoryVisible(child.id) || !isCategoryVisible(cat.id) }">
                <div class="tree-line"></div>
                <div class="cat-info">
                  <div class="cat-name-box">
                    <div class="cat-name">{{ child.name }}</div>
                    <div class="cat-meta">ID: {{ child.id }} | Sắp xếp: {{ child.ordering }}</div>
                  </div>
                </div>

                <div class="cat-action">
                  <button
                    class="toggle-btn"
                    :class="{ active: isCategoryVisible(child.id) }"
                    @click="toggleVisibility(child.id)"
                    :disabled="!isCategoryVisible(cat.id)"
                    :title="!isCategoryVisible(cat.id) ? 'Danh mục cha đang ẩn' : ''"
                  >
                    <i class="fa-solid" :class="isCategoryVisible(child.id) ? 'fa-eye' : 'fa-eye-slash'"></i>
                    {{ isCategoryVisible(child.id) ? 'Đang hiển thị' : 'Đang ẩn' }}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div v-else-if="isLoading" class="loading-state">
        <i class="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu danh mục...
      </div>

      <div v-else class="empty-state">
        Không tìm thấy danh mục nào từ hệ thống.
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
import { ref, onMounted, computed } from 'vue'
import { useAdminAuth } from '~/composables/useAdminAuth'
import { useCategories } from '~/composables/useCategories'
import { useCategoryVisibility } from '~/composables/useCategoryVisibility'

useHead({ title: 'Quản lý Danh mục - Admin' })

const { isAdmin, initAuth } = useAdminAuth()
const { categories, isLoading, fetchCategories } = useCategories()
const { visibility, isLoaded, fetchVisibility, saveVisibility, isCategoryVisible, toggleCategory, setVisibility } = useCategoryVisibility()

const showSuccess = ref(false)
const isSaving = ref(false)

onMounted(async () => {
  initAuth()
  if (isAdmin.value) {
    await Promise.all([
      fetchCategories(),
      fetchVisibility()
    ])
  }
})

const toggleVisibility = (categoryId: number) => {
  toggleCategory(categoryId)

  // Nếu ẩn danh mục cha, tự động đánh dấu ẩn luôn các danh mục con (mặc dù UI đã xử lý disabled,
  // nhưng nếu muốn data clean thì có thể mở comment đoạn dưới)
  /*
  const cat = findCategory(categoryId)
  if (cat && cat.children && !isCategoryVisible(categoryId)) {
    cat.children.forEach(child => setVisibility(child.id, false))
  }
  */
}

const findCategory = (id: number) => {
  for (const root of categories.value) {
    if (root.id === id) return root
    const child = root.children?.find(c => c.id === id)
    if (child) return child
  }
  return null
}

const handleSave = async () => {
  isSaving.value = true
  try {
    await saveVisibility()
    showSuccess.value = true
    setTimeout(() => { showSuccess.value = false }, 3000)
  } catch (e: any) {
    alert('Lỗi khi lưu cài đặt hiển thị: ' + e.message)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.admin-page {
  padding: 40px 15px;
  min-height: 70vh;
}

.admin-dashboard {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
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

.btn-outline {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  color: #555;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #e31b1b;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.btn-primary:disabled { opacity: 0.7; cursor: wait; }

.info-banner {
  background: #e3f2fd;
  color: #0d47a1;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 25px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
  line-height: 1.5;
}

.info-banner i {
  font-size: 18px;
  margin-top: 2px;
}

.category-list-container {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
  overflow: hidden;
}

.category-tree {
  display: flex;
  flex-direction: column;
}

.category-node {
  border-bottom: 1px solid #f0f0f0;
}
.category-node:last-child {
  border-bottom: none;
}

.category-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  transition: background 0.2s;
}

.category-row:hover {
  background: #f9f9f9;
}

.category-row.is-hidden {
  opacity: 0.6;
  background: #fdfdfd;
}

.child-row {
  padding-left: 50px;
  position: relative;
  background: #fafafa;
  border-top: 1px dashed #f0f0f0;
}

.tree-line {
  position: absolute;
  left: 30px;
  top: -15px;
  bottom: 20px;
  width: 1px;
  border-left: 2px dashed #ddd;
}
.tree-line::after {
  content: '';
  position: absolute;
  left: -2px;
  bottom: 0;
  width: 15px;
  border-bottom: 2px dashed #ddd;
}

.cat-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.cat-thumb {
  width: 45px;
  height: 45px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #eee;
}

.cat-thumb-placeholder {
  width: 45px;
  height: 45px;
  border-radius: 6px;
  background: #f5f5f5;
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.cat-name {
  font-weight: 700;
  font-size: 15px;
  color: #333;
  margin-bottom: 4px;
}

.cat-meta {
  font-size: 12px;
  color: #888;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1.5px solid #ccc;
  background: #fff;
  color: #999;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 130px;
  justify-content: center;
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

.toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 50px;
  color: #666;
  font-size: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
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

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
