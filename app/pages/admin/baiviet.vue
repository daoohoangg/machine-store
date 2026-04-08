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
          <h1>Quản lý Bài viết / Tin tức</h1>
        </div>
        <NuxtLink to="/admin/baiviet-form" class="btn-primary" style="text-decoration:none; display:inline-block;"><i class="fa-solid fa-plus"></i> Thêm bài viết mới</NuxtLink>
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
                  <NuxtLink :to="'/admin/baiviet-form?id=' + index" class="btn-icon btn-edit" title="Sửa"><i class="fa-solid fa-pen"></i></NuxtLink>
                  <button class="btn-icon btn-delete" @click="confirmDelete(index)" title="Xóa"><i class="fa-solid fa-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      

      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useNews } from '~/composables/useNews'
import { useAdminAuth } from '~/composables/useAdminAuth'

useHead({ title: 'Quản lý Bài viết - Admin' })

const { newsList, loadNews, deleteNews } = useNews()
const { isAdmin, initAuth } = useAdminAuth()

onMounted(() => {
  initAuth()
  loadNews()
})

const truncateDesc = (text) => {
  if (!text) return ''
  return text.length > 80 ? text.substring(0, 80) + '...' : text
}



const confirmDelete = async (index) => {
  if (confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.')) {
    await deleteNews(index)
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
