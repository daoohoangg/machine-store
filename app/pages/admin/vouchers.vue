<template>
  <div class="vouchers-admin">
    <div class="admin-header">
      <div class="title-group">
        <NuxtLink to="/admin" class="back-link"><i class="fa-solid fa-arrow-left"></i> Quay lại Dashboard</NuxtLink>
        <h1>Quản lý Voucher</h1>
      </div>
      <button class="btn-primary" @click="openModal()"><i class="fa-solid fa-plus"></i> Thêm Voucher mới</button>
    </div>

    <div class="search-bar">
      <div class="input-wrapper">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" v-model="searchQuery" placeholder="Tìm kiếm theo mã voucher..." />
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <i class="fa-solid fa-spinner fa-spin"></i>
      <p>Đang tải danh sách voucher...</p>
    </div>

    <div v-else-if="filteredVouchers.length === 0" class="empty-state">
      <i class="fa-solid fa-ticket-simple"></i>
      <p>Không tìm thấy voucher nào!</p>
    </div>

    <div v-else class="vouchers-table-wrapper">
      <table class="vouchers-table">
        <thead>
          <tr>
            <th>Mã Voucher</th>
            <th>Loại</th>
            <th>Giá trị</th>
            <th>Đơn tối thiểu</th>
            <th>Giới hạn</th>
            <th>Thời hạn</th>
            <th>Trạng thái</th>
            <th class="actions">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in filteredVouchers" :key="v.id">
            <td>
              <span class="voucher-code">{{ v.code }}</span>
            </td>
            <td>
              <span :class="['type-badge', v.type]">
                {{ v.type === 'percent' ? 'Giảm %' : 'Giảm tiền' }}
              </span>
            </td>
            <td>
              <span class="value-text">
                {{ v.type === 'percent' ? `-${v.value}%` : `-${formatPrice(v.value)}đ` }}
              </span>
            </td>
            <td>{{ formatPrice(v.min_order_value) }}đ</td>
            <td>
              <div class="limit-info">
                {{ v.used_count || 0 }} / {{ v.usage_limit || '∞' }}
              </div>
            </td>
            <td>
              <div class="date-info">
                <span>{{ formatDate(v.start_date) || 'Bắt đầu ngay' }}</span>
                <i class="fa-solid fa-arrow-right"></i>
                <span>{{ formatDate(v.end_date) || 'Không giới hạn' }}</span>
              </div>
            </td>
            <td>
              <span :class="['status-badge', v.status ? 'active' : 'inactive']">
                {{ v.status ? 'Đang bật' : 'Đã tắt' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-icon edit" title="Sửa" @click="openModal(v)"><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="btn-icon delete" title="Xóa" @click="confirmDelete(v)"><i class="fa-solid fa-trash"></i></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Voucher Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>{{ editingVoucher ? 'Cập nhật Voucher' : 'Thêm Voucher mới' }}</h3>
            <button class="close-btn" @click="closeModal"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Mã Voucher <span class="required">*</span></label>
                <input type="text" v-model="form.code" placeholder="Vd: GIAM50K, TET2024" />
              </div>
              <div class="form-group">
                <label>Trạng thái</label>
                <div class="toggle-group">
                  <input type="checkbox" id="v-status" v-model="form.status" />
                  <label for="v-status">{{ form.status ? 'Đang kích hoạt' : 'Đang tạm dừng' }}</label>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Loại giảm giá <span class="required">*</span></label>
                <select v-model="form.type">
                  <option value="fixed">Số tiền cố định (-đ)</option>
                  <option value="percent">Phần trăm (-%)</option>
                </select>
              </div>
              <div class="form-group">
                <label>Giá trị giảm <span class="required">*</span></label>
                <div class="input-with-label">
                  <input type="number" v-model="form.value" />
                  <span class="unit">{{ form.type === 'percent' ? '%' : 'VNĐ' }}</span>
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Giá trị đơn tối thiểu</label>
                <div class="input-with-label">
                  <input type="number" v-model="form.min_order_value" />
                  <span class="unit">VNĐ</span>
                </div>
              </div>
              <div class="form-group" v-if="form.type === 'percent'">
                <label>Giảm tối đa (Optional)</label>
                <div class="input-with-label">
                  <input type="number" v-model="form.max_discount" />
                  <span class="unit">VNĐ</span>
                </div>
              </div>
              <div class="form-group" v-else>
                <label>Giới hạn lượt dùng</label>
                <input type="number" v-model="form.usage_limit" placeholder="Để trống nếu không giới hạn" />
              </div>
            </div>

            <div class="form-row" v-if="form.type === 'percent'">
              <div class="form-group">
                <label>Giới hạn lượt dùng</label>
                <input type="number" v-model="form.usage_limit" placeholder="Để trống nếu không giới hạn" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Ngày bắt đầu</label>
                <input type="datetime-local" v-model="form.start_date" />
              </div>
              <div class="form-group">
                <label>Ngày kết thúc</label>
                <input type="datetime-local" v-model="form.end_date" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeModal">Hủy</button>
            <button class="btn-primary" @click="saveVoucher" :disabled="isSaving">
              {{ isSaving ? 'Đang lưu...' : (editingVoucher ? 'Cập nhật' : 'Tạo mới') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminAuth } from '~/composables/useAdminAuth'

useHead({ title: 'Quản lý Voucher | Admin' })

const { isAdmin } = useAdminAuth()
const isLoading = ref(true)
const isSaving = ref(false)
const vouchers = ref([])
const searchQuery = ref('')
const showModal = ref(false)
const editingVoucher = ref(null)

const form = ref({
  code: '',
  type: 'fixed',
  value: 0,
  min_order_value: 0,
  max_discount: null,
  start_date: '',
  end_date: '',
  usage_limit: null,
  status: true
})

const fetchVouchers = async () => {
  try {
    isLoading.value = true
    const res = await $fetch('/api/admin/vouchers')
    if (res.success) {
      vouchers.value = res.data
    }
  } catch (err) {
    console.error('Fetch error:', err)
  } finally {
    isLoading.value = false
  }
}

const filteredVouchers = computed(() => {
  if (!searchQuery.value) return vouchers.value
  return vouchers.value.filter(v => v.code.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const formatPrice = (p) => {
  if (!p) return '0'
  return new Intl.NumberFormat('vi-VN').format(p)
}

const formatDate = (d) => {
  if (!d) return null
  return new Date(d).toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric'
  })
}

const openModal = (voucher = null) => {
  if (voucher) {
    editingVoucher.value = voucher
    form.value = {
      ...voucher,
      // Format dates for input[type="datetime-local"]
      start_date: voucher.start_date ? new Date(voucher.start_date).toISOString().slice(0, 16) : '',
      end_date: voucher.end_date ? new Date(voucher.end_date).toISOString().slice(0, 16) : ''
    }
  } else {
    editingVoucher.value = null
    form.value = {
      code: '',
      type: 'fixed',
      value: 0,
      min_order_value: 0,
      max_discount: null,
      start_date: '',
      end_date: '',
      usage_limit: null,
      status: true
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingVoucher.value = null
}

const saveVoucher = async () => {
  if (!form.value.code || !form.value.value) {
    alert('Vui lòng nhập đủ các thông tin bắt buộc (*)')
    return
  }

  try {
    isSaving.value = true
    const method = editingVoucher.value ? 'PUT' : 'POST'
    const res = await $fetch('/api/admin/vouchers', {
      method,
      body: form.value
    })

    if (res.success) {
      if (editingVoucher.value) {
        const index = vouchers.value.findIndex(v => v.id === res.data.id)
        if (index !== -1) vouchers.value[index] = res.data
      } else {
        vouchers.value.unshift(res.data)
      }
      closeModal()
    }
  } catch (err) {
    alert(err.statusMessage || 'Lỗi khi lưu voucher')
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = async (voucher) => {
  if (!confirm(`Bạn có chắc muốn xóa voucher ${voucher.code}?`)) return

  try {
    const res = await $fetch(`/api/admin/vouchers?id=${voucher.id}`, {
      method: 'DELETE'
    })
    if (res.success) {
      vouchers.value = vouchers.value.filter(v => v.id !== voucher.id)
    }
  } catch (err) {
    alert('Lỗi khi xóa voucher')
  }
}

onMounted(() => {
  fetchVouchers()
})
</script>

<style scoped>
.vouchers-admin {
  padding: 40px 15px;
  min-height: 80vh;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.title-group h1 {
  font-size: 28px;
  margin: 10px 0 0;
  color: #333;
}

.back-link {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.back-link:hover {
  color: #e31b1b;
}

.search-bar {
  margin-bottom: 25px;
}

.input-wrapper {
  position: relative;
  max-width: 400px;
}

.input-wrapper i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 0;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
  color: #888;
}

.loading-state i, .empty-state i {
  font-size: 40px;
  margin-bottom: 15px;
}

.vouchers-table-wrapper {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
  overflow-x: auto;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.vouchers-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.vouchers-table th {
  background: #f8f9fa;
  padding: 15px;
  font-weight: 700;
  color: #555;
  border-bottom: 2px solid #eee;
  white-space: nowrap;
}

.vouchers-table td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.voucher-code {
  font-family: monospace;
  font-weight: 700;
  background: #fff3f3;
  color: #e31b1b;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px dashed #e31b1b;
}

.type-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.type-badge.percent {
  background: #e3f2fd;
  color: #1976d2;
}

.type-badge.fixed {
  background: #f1f8e9;
  color: #388e3c;
}

.value-text {
  font-weight: 700;
  color: #d32f2f;
}

.limit-info {
  font-size: 14px;
  color: #666;
}

.date-info {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background: #ffebee;
  color: #c62828;
}

.actions {
  text-align: right;
  white-space: nowrap;
}

.btn-icon {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  border: none;
  background: #f5f5f5;
  color: #666;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s;
}

.btn-icon.edit:hover { background: #e3f2fd; color: #1976d2; }
.btn-icon.delete:hover { background: #ffebee; color: #c62828; }

/* Buttons */
.btn-primary {
  background: #e31b1b;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover { background: #cc1515; }

.btn-secondary {
  background: #f5f5f5;
  color: #666;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #fff;
  width: 100%;
  max-width: 650px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  overflow: hidden;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { margin: 0; color: #333; }

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #aaa;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f8f9fa;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
}

.required { color: #e31b1b; }

.form-group input, .form-group select {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: inherit;
}

.input-with-label {
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding-right: 12px;
  overflow: hidden;
}

.input-with-label input {
  border: none;
  flex: 1;
}

.input-with-label .unit {
  font-size: 13px;
  color: #888;
  font-weight: 600;
}

.toggle-group {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
}

.toggle-group input[type="checkbox"] {
  width: 40px;
  height: 20px;
  cursor: pointer;
}

@media (max-width: 600px) {
  .form-row { flex-direction: column; gap: 15px; }
  .modal-content { max-width: 90%; }
}
</style>
