<template>
  <div class="admin-payment-methods">
    <div class="admin-header">
      <div class="header-left">
        <NuxtLink to="/admin" class="btn-back">
          <i class="fa-solid fa-arrow-left"></i> Quay lại
        </NuxtLink>
        <h1>Quản lý Phương thức thanh toán</h1>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="addMethod">
          <i class="fa-solid fa-plus"></i> Thêm phương thức
        </button>
        <button class="btn-success" @click="saveAll" :disabled="isSaving">
          <i class="fa-solid fa-save"></i> {{ isSaving ? 'Đang lưu...' : 'Lưu tất cả' }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <i class="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu...
    </div>

    <div v-else class="methods-list" ref="listContainer">
      <draggable 
        v-model="methods" 
        item-key="temp_id" 
        handle=".drag-handle"
        class="draggable-container"
      >
        <template #item="{ element, index }">
          <div class="method-card" :class="{ inactive: !element.is_active }">
            <div class="card-header">
              <div class="drag-handle" title="Kéo để sắp xếp">
                <i class="fa-solid fa-grip-vertical"></i>
              </div>
              <div class="method-info">
                <h3>{{ element.title || '(Chưa có tiêu đề)' }}</h3>
                <code>{{ element.key }}</code>
              </div>
              <div class="method-toggles">
                <label class="switch-row">
                  <span>Hoạt động</span>
                  <input type="checkbox" v-model="element.is_active" />
                </label>
                <button class="btn-remove" @click="removeMethod(index)" title="Xóa">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
            
            <div class="card-body">
              <div class="form-grid">
                <div class="form-group">
                  <label>Tiêu đề hiển thị</label>
                  <input type="text" v-model="element.title" placeholder="VD: Nhận hàng thanh toán (COD)" />
                </div>
                <div class="form-group">
                  <label>Mã (Key) - Duy nhất</label>
                  <input type="text" v-model="element.key" placeholder="VD: cod, bank, momo" />
                </div>
                <div class="form-group">
                  <label>Icon (FontAwesome)</label>
                  <div class="icon-input">
                    <i :class="'fa-solid ' + element.icon"></i>
                    <input type="text" v-model="element.icon" placeholder="VD: fa-truck-fast" />
                  </div>
                </div>
                <div class="form-group full-width">
                  <label>Mô tả chi tiết</label>
                  <textarea v-model="element.description" placeholder="Mô tả ngắn gọn về hình thức này..."></textarea>
                </div>
              </div>
            </div>
          </div>
        </template>
      </draggable>
      
      <div v-if="methods.length === 0" class="empty-state">
        <p>Chưa có phương thức thanh toán nào. Nhấn "Thêm phương thức" để bắt đầu.</p>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showSuccess" class="toast success">
        <i class="fa-solid fa-check-circle"></i> Đã lưu thành công!
      </div>
    </transition>
    <transition name="fade">
      <div v-if="errorMsg" class="toast error">
        <i class="fa-solid fa-exclamation-circle"></i> {{ errorMsg }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { useAdminAuth } from '~/composables/useAdminAuth'

useHead({ title: 'Quản lý Thanh toán | Admin' })

const { isAdmin, initAuth } = useAdminAuth()
const router = useRouter()

const methods = ref([])
const isLoading = ref(true)
const isSaving = ref(false)
const showSuccess = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  initAuth()
  if (!isAdmin.value) {
    // We wait a bit for initAuth
    setTimeout(() => {
      if (!isAdmin.value) router.push('/admin')
    }, 500)
  }
  await fetchMethods()
})

const fetchMethods = async () => {
  isLoading.value = true
  try {
    const data = await $fetch('/api/payment-methods')
    if (data.error) throw new Error(data.error)
    // Add temp_id for vuedraggable
    methods.value = (data || []).map(m => ({ ...m, temp_id: Math.random() }))
  } catch (e) {
    console.error(e)
    errorMsg.value = 'Lỗi khi tải dữ liệu. Bạn đã chạy SQL chưa?'
  } finally {
    isLoading.value = false
  }
}

const addMethod = () => {
  methods.value.push({
    temp_id: Math.random(),
    key: '',
    title: '',
    description: '',
    icon: 'fa-credit-card',
    is_active: true,
    order: methods.value.length
  })
}

const removeMethod = (index) => {
  if (confirm('Bạn có chắc muốn xóa phương thức này?')) {
    methods.value.splice(index, 1)
  }
}

const saveAll = async () => {
  // Validate unique keys
  const keys = methods.value.map(m => m.key).filter(k => k)
  if (new Set(keys).size !== keys.length) {
    errorMsg.value = 'Lỗi: Các mã (Key) phải là duy nhất!'
    return
  }

  isSaving.value = true
  errorMsg.value = ''
  
  try {
    // Assign order based on current list order
    const payload = methods.value.map((m, index) => ({
      ...m,
      order: index
    }))

    const res = await $fetch('/api/payment-methods', {
      method: 'POST',
      body: payload
    })

    if (res.success) {
      showSuccess.value = true
      setTimeout(() => showSuccess.value = false, 3000)
      await fetchMethods()
    } else {
      throw new Error(res.error || 'Lỗi không xác định')
    }
  } catch (e) {
    errorMsg.value = 'Lỗi khi lưu: ' + e.message
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.admin-payment-methods {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 15px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
  padding-bottom: 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-back {
  text-decoration: none;
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
}

.btn-back:hover {
  background: #f5f5f5;
}

.admin-header h1 {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  padding: 10px 20px;
  background: #0066cc;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.btn-success {
  padding: 10px 20px;
  background: #28a745;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 50px;
  background: #fff;
  border-radius: 8px;
  border: 1px dashed #ccc;
  color: #666;
}

.method-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  transition: opacity 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.method-card.inactive {
  opacity: 0.7;
}

.card-header {
  padding: 12px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 15px;
}

.drag-handle {
  cursor: grab;
  color: #aaa;
  padding: 5px;
}

.method-info {
  flex: 1;
}

.method-info h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.method-info code {
  font-size: 12px;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 3px;
  color: #d63384;
}

.method-toggles {
  display: flex;
  align-items: center;
  gap: 20px;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  cursor: pointer;
}

.btn-remove {
  padding: 8px;
  background: #fff;
  color: #dc3545;
  border: 1px solid #dc3545;
  border-radius: 4px;
  cursor: pointer;
}

.btn-remove:hover {
  background: #dc3545;
  color: #fff;
}

.card-body {
  padding: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.form-group input, .form-group textarea {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.icon-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon-input i {
  width: 40px;
  height: 40px;
  background: #333;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.icon-input input {
  flex: 1;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 25px;
  border-radius: 4px;
  color: #fff;
  font-weight: 600;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.toast.success { background: #28a745; }
.toast.error { background: #dc3545; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
