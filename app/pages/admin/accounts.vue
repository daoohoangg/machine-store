<template>
  <div class="admin-page container">
    <div v-if="!isAdmin" class="login-wrapper">
      <div class="login-box">
        <h2>Bạn cần đăng nhập</h2>
        <NuxtLink to="/admin" class="btn-primary" style="display:inline-block; margin-top:20px;">Về trang đăng nhập</NuxtLink>
      </div>
    </div>
    
    <div v-else class="admin-dashboard">
      <div class="admin-header">
        <div class="breadcrumb">
          <NuxtLink to="/admin" class="back-link"><i class="fa-solid fa-arrow-left"></i> Bảng điều khiển</NuxtLink>
        </div>
        <h1>Quản lý Tài khoản & Phân quyền</h1>
      </div>

      <div class="dashboard-stats" v-if="accounts.length > 0">
        <div class="stat-card">
          <div class="stat-icon users"><i class="fa-solid fa-users"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ accounts.length }}</div>
            <div class="stat-label">Tổng tài khoản</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon admin"><i class="fa-solid fa-user-shield"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ accounts.filter(a => a.role === 'admin').length }}</div>
            <div class="stat-label">Ban quản trị</div>
          </div>
        </div>
      </div>

      <div class="accounts-container">
        <div class="table-actions">
          <h3>Danh sách người dùng</h3>
          <button class="btn-primary" @click="openCreateModal"><i class="fa-solid fa-plus"></i> Thêm Tài khoản</button>
        </div>

        <div v-if="isLoading" class="loading-state">
          Đang tải dữ liệu...
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Số điện thoại</th>
              <th>Họ tên</th>
              <th>Phân quyền</th>
              <th>Đăng nhập cuối</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="accounts.length === 0">
              <td colspan="5" class="empty-state">Chưa có dữ liệu người dùng</td>
            </tr>
            <tr v-for="account in accounts" :key="account.phone">
              <td><strong>{{ account.phone }}</strong></td>
              <td>{{ account.full_name || 'Khách vãng lai' }}</td>
              <td>
                <span class="role-badge" :class="account.role">{{ account.role === 'admin' ? 'Admin' : 'Khách hàng' }}</span>
              </td>
              <td>{{ formatDate(account.last_login || account.created_at) }}</td>
              <td class="actions">
                <button class="btn-icon edit" @click="openEditModal(account)" title="Chỉnh sửa"><i class="fa-solid fa-pen-to-square"></i></button>
                <button v-if="account.phone !== currentAdminPhone" class="btn-icon delete" @click="confirmDelete(account)" title="Xoá"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal-overlay" v-if="showModal" @click.self="showModal = false">
      <div class="modal-content">
        <h2>{{ editingAccount.isNew ? 'Thêm Tài khoản' : 'Sửa Tài khoản' }}</h2>
        <div class="form-group">
          <label>Số điện thoại *</label>
          <input type="text" v-model="editingAccount.phone" :disabled="!editingAccount.isNew" placeholder="09xx..." />
        </div>
        <div class="form-group">
          <label>Họ và tên</label>
          <input type="text" v-model="editingAccount.full_name" placeholder="Nguyễn Văn A" />
        </div>
        <div class="form-group">
          <label>Phân quyền (Role)</label>
          <select v-model="editingAccount.role">
            <option value="user">Khách hàng (User)</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>
        </div>
        
        <div class="modal-actions">
          <button class="btn-outline" @click="showModal = false">Huỷ</button>
          <button class="btn-primary" @click="saveAccount" :disabled="isSaving">
            {{ isSaving ? 'Đang lưu...' : 'Lưu lại' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminAuth } from '~/composables/useAdminAuth'

useHead({ title: 'Quản lý Tài khoản - Admin' })

const { isAdmin, initAuth } = useAdminAuth()
const accounts = ref([])
const isLoading = ref(true)
const isSaving = ref(false)
const showModal = ref(false)

// We can get the current admin phone from the login state if we stored it, 
// for now we don't have it exactly mapped in local storage, but the user understands.
const currentAdminPhone = ref('') 

const editingAccount = ref({
  isNew: false,
  phone: '',
  full_name: '',
  role: 'user',
  status: 'active'
})

onMounted(() => {
  initAuth()
  if (isAdmin.value) {
    fetchAccounts()
  }
})

const fetchAccounts = async () => {
  isLoading.value = true
  try {
    const { data, error } = await useFetch('/api/admin/accounts')
    if (!error.value && data.value) {
      accounts.value = data.value
    }
  } catch (err) {
    console.error('Lỗi khi tải danh sách:', err)
  }
  isLoading.value = false
}

const formatDate = (dateString) => {
  if (!dateString) return 'Chưa đăng nhập'
  const date = new Date(dateString)
  return `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')} - ${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`
}

const openCreateModal = () => {
  editingAccount.value = {
    isNew: true,
    phone: '',
    full_name: '',
    role: 'user',
    status: 'active'
  }
  showModal.value = true
}

const openEditModal = (account) => {
  editingAccount.value = {
    isNew: false,
    phone: account.phone,
    full_name: account.full_name || '',
    role: account.role || 'user',
    status: account.status || 'active'
  }
  showModal.value = true
}

const saveAccount = async () => {
  if (!editingAccount.value.phone) {
    alert('Vui lòng nhập số điện thoại')
    return
  }
  
  isSaving.value = true
  try {
    const { data, error } = await useFetch('/api/admin/accounts', {
      method: 'POST',
      body: {
        phone: editingAccount.value.phone,
        full_name: editingAccount.value.full_name,
        role: editingAccount.value.role,
        status: editingAccount.value.status
      }
    })
    
    if (error.value) throw error.value
    
    showModal.value = false
    await fetchAccounts() // reload list
  } catch (err) {
    alert(err.message || 'Lỗi khi lưu tài khoản')
  }
  isSaving.value = false
}

const confirmDelete = async (account) => {
  if (!confirm(`Bạn có chắc chắn muốn xoá tài khoản ${account.phone}?`)) return
  
  try {
    const { error } = await useFetch('/api/admin/accounts', {
      method: 'DELETE',
      body: { phone: account.phone }
    })
    
    if (error.value) throw error.value
    await fetchAccounts()
  } catch (err) {
    alert(err.message || 'Lỗi khi xoá')
  }
}
</script>

<style scoped>
.admin-page {
  padding: 40px 15px;
  min-height: 70vh;
}

.login-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.login-box {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
}

.admin-dashboard {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.admin-header {
  margin-bottom: 30px;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 10px;
  transition: color 0.2s;
}

.back-link:hover { color: #e31b1b; }

.admin-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

/* Dashboard Stats */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid #eee;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.stat-icon.users { background: linear-gradient(135deg, #4D96FF, #0061FF); }
.stat-icon.admin { background: linear-gradient(135deg, #e31b1b, #a51313); }

.stat-info { flex: 1; }
.stat-value { font-size: 24px; font-weight: 700; color: #333; line-height: 1; }
.stat-label { font-size: 13px; color: #777; margin-top: 5px; }

/* Table Container */
.accounts-container {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.table-actions h3 { margin: 0; color: #333; }

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th { background: #f9f9f9; font-weight: 600; color: #555; }

.role-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}
.role-badge.admin { background: #ffebee; color: #e31b1b; border: 1px solid #ffcdd2; }
.role-badge.user { background: #e3f2fd; color: #1976d2; border: 1px solid #bbdefb; }

.actions { display: flex; gap: 8px; }
.btn-icon {
  width: 32px; height: 32px;
  border-radius: 4px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; color: white;
}
.btn-icon.edit { background: #ff9800; }
.btn-icon.edit:hover { background: #f57c00; }
.btn-icon.delete { background: #f44336; }
.btn-icon.delete:hover { background: #d32f2f; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.modal-content {
  background: white; border-radius: 8px; width: 90%; max-width: 450px;
  padding: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.modal-content h2 { margin: 0 0 20px; color: #333; font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }

.form-group { margin-bottom: 15px; text-align: left; }
.form-group label { display: block; font-weight: 600; margin-bottom: 8px; color: #333; font-size: 14px; }
.form-group input, .form-group select {
  width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 15px; font-family: inherit;
}
.form-group input:disabled { background: #f5f5f5; color: #888; cursor: not-allowed; }

.modal-actions {
  display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px;
}

.btn-primary {
  padding: 10px 20px; background: #e31b1b; color: white;
  border: none; border-radius: 4px; font-weight: 600; cursor: pointer; transition: background 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #cc1515; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

.btn-outline {
  padding: 10px 20px; background: transparent; color: #555;
  border: 1px solid #ccc; border-radius: 4px; font-weight: 600; cursor: pointer; transition: background 0.2s;
}
.btn-outline:hover { background: #f5f5f5; }
</style>
