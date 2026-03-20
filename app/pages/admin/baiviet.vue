<template>
  <div class="admin-page container">
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
          <h1>Quản lý Bài viết / Tin tức</h1>
        </div>
        <button class="btn-primary" @click="openAddForm"><i class="fa-solid fa-plus"></i> Thêm bài viết mới</button>
      </div>
      
      <div class="news-list-section">
        <div v-if="newsList.length === 0" class="empty-state">
          Chưa có bài viết nào.
        </div>
        <table v-else class="news-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tiêu đề & Tag</th>
              <th>Mô tả ngắn</th>
              <th width="120">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in newsList" :key="index">
              <td>
                <img :src="item.image" :alt="item.title" class="news-thumb" />
              </td>
              <td>
                <div class="news-title">{{ item.title }}</div>
                <div class="news-tag">{{ item.tag }}</div>
              </td>
              <td>
                <div class="news-desc">{{ truncateDesc(item.description) }}</div>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="btn-icon btn-edit" @click="openEditForm(index, item)" title="Sửa"><i class="fa-solid fa-pen"></i></button>
                  <button class="btn-icon btn-delete" @click="confirmDelete(index)" title="Xóa"><i class="fa-solid fa-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Modal form -->
      <div v-if="isFormOpen" class="modal-overlay" @click.self="closeForm">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editIndex >= 0 ? 'Sửa bài viết' : 'Thêm bài viết mới' }}</h3>
            <button class="close-btn" @click="closeForm"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Tiêu đề bài viết</label>
              <input type="text" v-model="formData.title" placeholder="Nhập tiêu đề..." />
            </div>
            <div class="form-group">
              <label>Thẻ Tag (Ví dụ: TIN TỨC, MÁY BƠM)</label>
              <input type="text" v-model="formData.tag" placeholder="Nhập thẻ tag ngắn gọn..." />
            </div>
            <div class="form-group">
              <label>Đường dẫn hình ảnh (URL)</label>
              <input type="text" v-model="formData.image" placeholder="https://..." />
              <div v-if="formData.image" class="img-preview">
                <img :src="formData.image" alt="Preview" @error="handleImageError" />
              </div>
            </div>
            <div class="form-group">
              <label>Mô tả ngắn gọn</label>
              <textarea v-model="formData.description" rows="3" placeholder="Nhập tóm tắt nội dung..."></textarea>
            </div>
            <div class="form-group">
              <label>Nội dung chi tiết (HTML)</label>
              <textarea v-model="formData.content" rows="6" placeholder="Nhập nội dung đầy đủ của bài viết..."></textarea>
            </div>
            <div class="form-group">
              <label>Đường dẫn bài viết (Tùy chọn Link ngoài)</label>
              <input type="text" v-model="formData.link" placeholder="Mặc định: dẫn vào trang chi tiết" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-outline" @click="closeForm">Hủy bỏ</button>
            <button class="btn-primary" @click="saveForm">Lưu bài viết</button>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNews } from '~/composables/useNews'
import { useAdminAuth } from '~/composables/useAdminAuth'

useHead({ title: 'Quản lý Bài viết - Admin' })

const { newsList, loadNews, addNews, updateNews, deleteNews } = useNews()
const { isAdmin, initAuth } = useAdminAuth()

const isFormOpen = ref(false)
const editIndex = ref(-1)
const formData = ref({
  title: '',
  tag: '',
  image: '',
  description: '',
  content: '',
  link: '#'
})

onMounted(() => {
  initAuth()
  loadNews()
})

const truncateDesc = (text) => {
  if (!text) return ''
  return text.length > 80 ? text.substring(0, 80) + '...' : text
}

const openAddForm = () => {
  editIndex.value = -1
  formData.value = {
    title: '',
    tag: '',
    image: '',
    description: '',
    content: '',
    link: '#'
  }
  isFormOpen.value = true
}

const openEditForm = (index, item) => {
  editIndex.value = index
  formData.value = { ...item }
  isFormOpen.value = true
}

const closeForm = () => {
  isFormOpen.value = false
}

const saveForm = () => {
  if (!formData.value.title) {
    alert('Vui lòng nhập phần tiêu đề!')
    return
  }
  
  if (editIndex.value >= 0) {
    updateNews(editIndex.value, formData.value)
  } else {
    addNews(formData.value)
  }
  closeForm()
}

const confirmDelete = (index) => {
  if (confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.')) {
    deleteNews(index)
  }
}

const handleImageError = (e) => {
  e.target.style.display = 'none'
}
</script>

<style scoped>
.admin-page {
  padding: 40px 15px;
  min-height: 70vh;
}

.login-wrapper {
  max-width: 400px;
  margin: 40px auto;
  text-align: center;
}

.login-box {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  border: 1px solid #eee;
}

.admin-dashboard {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.d-flex {
  display: flex;
}
.align-items-center {
  align-items: center;
}
.gap-15 {
  gap: 15px;
}

.back-btn {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.admin-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.news-list-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #eee;
  overflow: hidden;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #888;
  font-size: 16px;
}

.news-table {
  width: 100%;
  border-collapse: collapse;
}

.news-table th, .news-table td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.news-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #444;
}

.news-thumb {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  background: #f0f0f0;
}

.news-title {
  font-weight: 600;
  color: #222;
  margin-bottom: 6px;
  font-size: 15px;
}

.news-tag {
  display: inline-block;
  font-size: 11px;
  background: #e6f0fa;
  color: #0066cc;
  padding: 3px 8px;
  border-radius: 12px;
  font-weight: 600;
}

.news-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 34px;
  height: 34px;
  border-radius: 4px;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: #e6f0fa;
  color: #0066cc;
}

.btn-edit:hover {
  background: #cce0f5;
}

.btn-delete {
  background: #fae6e6;
  color: #e31b1b;
}

.btn-delete:hover {
  background: #f5cccc;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-content {
  background: #fff;
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
  box-shadow: 0 5px 25px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  color: #888;
  cursor: pointer;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.modal-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 14px;
}

.form-group input, 
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 15px;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #0066cc;
  outline: none;
}

.img-preview {
  margin-top: 10px;
  max-width: 200px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #eee;
}

.img-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.btn-primary {
  padding: 10px 20px;
  background: #e31b1b;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #cc1515;
}

.btn-outline {
  padding: 8px 16px;
  background: transparent;
  color: #555;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-outline:hover {
  background: #f5f5f5;
}
</style>
