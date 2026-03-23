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
          <NuxtLink to="/admin/baiviet" class="btn-outline back-btn"><i class="fa-solid fa-arrow-left"></i> Trở về</NuxtLink>
          <h1>{{ isEdit ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới' }}</h1>
        </div>
        <div class="header-actions">
          <button class="btn-outline" @click="cancel">Hủy bỏ</button>
          <button class="btn-primary" @click="saveForm">Lưu bài viết</button>
        </div>
      </div>
      
      <div class="edit-form-section">
        <div class="form-row">
          <div class="form-group flex-2">
            <label>Tiêu đề bài viết</label>
            <input type="text" v-model="formData.title" placeholder="Nhập tiêu đề nổi bật..." />
          </div>
          <div class="form-group flex-1">
            <label>Thẻ Tag</label>
            <input type="text" v-model="formData.tag" placeholder="Ví dụ: TIN TỨC" />
          </div>
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
          <textarea v-model="formData.description" rows="3" placeholder="Nhập tóm tắt nội dung để hiển thị trên thẻ bài viết..."></textarea>
        </div>

        <div class="form-group quill-wrapper">
          <label>Nội dung chi tiết (Rich Text)</label>
          <ClientOnly fallback-tag="div" fallback="Đang tải trình soạn thảo...">
            <QuillEditor 
              v-if="dataReady"
              :key="'editor-' + editId"
              theme="snow" 
              toolbar="full"
              v-model:content="formData.content" 
              contentType="html" 
              placeholder="Nhập nội dung đầy đủ của bài viết..." 
            />
            <div v-else style="padding: 40px; text-align: center; color: #888; border: 1px solid #ddd; border-radius: 6px;">
              <i class="fa-solid fa-spinner fa-spin"></i> Đang tải nội dung bài viết...
            </div>
          </ClientOnly>
        </div>

        <div class="form-group">
          <label>Đường dẫn tĩnh (Slug) hoặc Link ngoài</label>
          <input type="text" v-model="formData.link" placeholder="Mặc định: dẫn vào trang chi tiết tự động" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNews } from '~/composables/useNews'
import { useAdminAuth } from '~/composables/useAdminAuth'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

useHead({ title: 'Soạn thảo Bài viết - Admin' })

const router = useRouter()
const route = useRoute()
const { newsList, loadNews, addNews, updateNews } = useNews()
const { isAdmin, initAuth } = useAdminAuth()

const editId = ref(-1)
const dataReady = ref(false)
const isEdit = computed(() => editId.value >= 0)

const formData = ref({
  title: '',
  tag: '',
  image: '',
  description: '',
  content: '',
  link: '#'
})

const fillForm = () => {
  const id = editId.value
  if (id >= 0 && newsList.value[id]) {
    formData.value = JSON.parse(JSON.stringify(newsList.value[id]))
  }
  dataReady.value = true
}

onMounted(async () => {
  initAuth()
  loadNews()

  if (route.query.id !== undefined) {
    const id = parseInt(route.query.id)
    if (!isNaN(id)) {
      editId.value = id
    }
  }

  // If list already loaded, fill fast
  await nextTick()
  if (newsList.value.length > 0) {
    fillForm()
  } else {
    // Wait until newsList is populated
    const stop = watch(newsList, (val) => {
      if (val.length > 0) {
        fillForm()
        stop()
      }
    })
    // Fallback: show editor empty after 1.5s if list never loads
    setTimeout(() => {
      if (!dataReady.value) dataReady.value = true
    }, 1500)
  }
})

const saveForm = async () => {
  if (!formData.value.title) {
    alert('Vui lòng nhập phần tiêu đề!')
    return
  }
  
  if (isEdit.value) {
    await updateNews(editId.value, formData.value)
  } else {
    await addNews(formData.value)
  }
  router.push('/admin/baiviet')
}

const cancel = () => {
  router.push('/admin/baiviet')
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

.header-actions {
  display: flex;
  gap: 10px;
}

.edit-form-section {
  background: #fff;
  border-radius: 8px;
  padding: 25px 30px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.form-row {
  display: flex;
  gap: 20px;
}
.flex-2 { flex: 2; }
.flex-1 { flex: 1; }

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 15px;
}

.form-group input, 
.form-group textarea {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #0066cc;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0,102,204,0.1);
}

.quill-wrapper :deep(.ql-container) {
  min-height: 400px;
  font-family: inherit;
  font-size: 16px;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 6px;
}

.quill-wrapper :deep(.ql-toolbar) {
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  background: #fafafa;
}

.quill-wrapper :deep(.ql-editor) {
  min-height: 400px;
  line-height: 1.6;
}

.img-preview {
  margin-top: 10px;
  max-width: 300px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #eee;
}

.img-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.btn-primary {
  padding: 10px 24px;
  background: #e31b1b;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #cc1515;
}

.btn-outline {
  padding: 10px 24px;
  background: transparent;
  color: #555;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-outline:hover {
  background: #f5f5f5;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }
}
</style>
