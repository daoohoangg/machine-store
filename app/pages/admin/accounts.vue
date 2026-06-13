<template>
  <div class="admin-page">
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

        <div class="stat-card">
          <div class="stat-icon users"><i class="fa-solid fa-users"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ allAccounts.length }}</div>
            <div class="stat-label">Tổng khách hàng (Đã tải)</div>
          </div>
        </div>

      <div class="accounts-container">
        <div class="table-actions">
          <h3>Danh sách người dùng</h3>
          <div class="search-bar">
            <i v-if="!isLoading" class="fa-solid fa-magnifying-glass"></i>
            <i v-else class="fa-solid fa-spinner fa-spin search-loader"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Tìm theo tên, SĐT... (nhanh)"
            />
            <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <button class="btn-primary" @click="openCreateModal"><i class="fa-solid fa-plus"></i> Thêm Tài khoản</button>
        </div>

        <div v-if="isLoading" class="loading-state">
          <i class="fa-solid fa-spinner fa-spin"></i> Đang tải dữ liệu từ server...
        </div>

        <template v-else>
          <!-- Top Pagination Controls -->
          <div class="pagination-controls top" v-if="filteredAccounts.length > 0">
            <div class="pagination-numbers">
              <button class="page-nav-btn" :disabled="currentPage === 1" @click="currentPage--">
                <i class="fa-solid fa-chevron-left"></i>
              </button>
              
              <template v-for="p in visiblePages" :key="p">
                <span v-if="p === '...'" class="page-ellipsis">...</span>
                <button 
                  v-else 
                  class="page-num-btn" 
                  :class="{ active: p === currentPage }"
                  @click="currentPage = p as number"
                >
                  {{ p }}
                </button>
              </template>

              <button class="page-nav-btn" :disabled="currentPage === totalPages" @click="currentPage++">
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
            
            <div class="page-jump">
              <span>Đến trang:</span>
              <input type="number" v-model.number="jumpInput" @keyup.enter="handleJump" min="1" :max="totalPages" />
              <button @click="handleJump">Đi</button>
            </div>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>Số điện thoại</th>
                <th>Họ tên</th>
                <th>Hạng thành viên</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="paginatedAccounts.length === 0">
                <td colspan="4" class="empty-state">
                  Không tìm thấy người dùng phù hợp
                </td>
              </tr>
              <tr v-for="account in paginatedAccounts" :key="account.phone">
                <td><strong>{{ account.phone }}</strong></td>
                <td>{{ account.full_name || 'Khách vãng lai' }}</td>
                <td>
                  <span v-if="account.premium_name" class="tier-badge">
                    {{ account.premium_name }}
                  </span>
                  <span v-else class="tier-badge tier-0">Thành viên</span>
                </td>
                <td class="actions">
                  <button class="btn-icon edit" @click="openEditModal(account)" title="Chỉnh sửa"><i class="fa-solid fa-pen-to-square"></i></button>
                  <button v-if="account.phone !== currentAdminPhone" class="btn-icon delete" @click="confirmDelete(account)" title="Xóa"><i class="fa-solid fa-trash"></i></button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Bottom Pagination Controls -->
          <div class="pagination-controls bottom" v-if="filteredAccounts.length > 0">
            <div class="pagination-numbers">
              <button class="page-nav-btn" :disabled="currentPage === 1" @click="currentPage--">
                <i class="fa-solid fa-chevron-left"></i> Trước
              </button>
              
              <template v-for="p in visiblePages" :key="p">
                <span v-if="p === '...'" class="page-ellipsis">...</span>
                <button 
                  v-else 
                  class="page-num-btn" 
                  :class="{ active: p === currentPage }"
                  @click="currentPage = p as number"
                >
                  {{ p }}
                </button>
              </template>

              <button class="page-nav-btn" :disabled="currentPage === totalPages" @click="currentPage++">
                Sau <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
            <div class="pagination-summary">
              Hiển thị {{ (currentPage-1)*PAGE_SIZE + 1 }} - {{ Math.min(currentPage*PAGE_SIZE, filteredAccounts.length) }} trong tổng số {{ filteredAccounts.length }} kết quả
            </div>
          </div>
        </template>
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
        <div class="form-row">
          <div class="form-group">
            <label>Giới tính</label>
            <select v-model="editingAccount.gender">
              <option value="">-- Chọn --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div class="form-group">
            <label>Ngày sinh</label>
            <input type="date" v-model="editingAccount.birth_date" />
          </div>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="editingAccount.email" placeholder="example@email.com" />
        </div>
        <div class="form-group">
          <label>Địa chỉ</label>
          <input type="text" v-model="editingAccount.address" placeholder="Số nhà, đường, xã/phường..." />
        </div>
        <div class="form-group">
          <label>Tên địa điểm / Tỉnh thành</label>
          <input type="text" v-model="editingAccount.location_name" placeholder="Hà Nội, TP. HCM..." />
        </div>
        <div class="form-group">
          <label>SĐT người giới thiệu</label>
          <input type="text" v-model="editingAccount.invite_phone" placeholder="09xx... (nếu có)" />
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

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminAuth } from '~/composables/useAdminAuth'

useHead({ title: 'Quản lý Tài khoản - Admin' })

const { isAdmin, initAuth } = useAdminAuth()
const allAccounts = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const showModal = ref(false)
const currentPage = ref(1)
const jumpInput = ref(1)
const PAGE_SIZE = 100
const searchQuery = ref('')

// Vietnamese accent removal helper
const removeAccents = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

// Local optimized search
const filteredAccounts = computed(() => {
  const query = removeAccents(searchQuery.value.trim().toLowerCase())
  if (!query) return allAccounts.value

  return allAccounts.value.filter(acc => {
    const phone = acc.phone || ''
    const name = removeAccents((acc.full_name || '').toLowerCase())
    return phone.includes(query) || name.includes(query)
  })
})

// Pagination logic
const totalPages = computed(() => Math.ceil(filteredAccounts.value.length / PAGE_SIZE) || 1)

const paginatedAccounts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE
  return filteredAccounts.value.slice(start, end)
})

const visiblePages = computed(() => {
  const tp = totalPages.value
  const cp = currentPage.value
  const pages: (number | string)[] = []

  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (cp > 3) pages.push('...')
    
    let start = Math.max(2, cp - 1)
    let end = Math.min(tp - 1, cp + 1)
    
    if (cp <= 3) end = 4
    if (cp >= tp - 2) start = tp - 3
    
    for (let i = start; i <= end; i++) pages.push(i)
    
    if (cp < tp - 2) pages.push('...')
    pages.push(tp)
  }
  return pages
})

onMounted(async () => {
  await initAuth()
  if (isAdmin.value) {
    fetchAllData()
  } else {
    const stop = watch(isAdmin, (val) => {
      if (val) { stop(); fetchAllData() }
    })
  }
})

// Fetch all data from backend
const fetchAllData = async () => {
  isLoading.value = true
  try {
    const res = await $fetch('/api/admin/accounts') as any
    allAccounts.value = res.items || []
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu:', err)
  }
  isLoading.value = false
}

// Ensure search resets page
watch(searchQuery, () => {
  currentPage.value = 1
})

const handleJump = () => {
  const page = Math.max(1, Math.min(jumpInput.value, totalPages.value))
  currentPage.value = page
}

const openCreateModal = () => {
  editingAccount.value = {
    isNew: true,
    phone: '',
    full_name: '',
    role: 'user',
    status: 'active',
    gender: '',
    birth_date: '',
    email: '',
    address: '',
    location_name: '',
    invite_phone: ''
  }
  showModal.value = true
}

const openEditModal = (account: any) => {
  editingAccount.value = {
    isNew: false,
    phone: account.phone,
    full_name: account.full_name || '',
    role: account.role || 'user',
    status: account.status || 'active',
    gender: account.gender || '',
    birth_date: account.birth_date || '',
    email: account.email || '',
    address: account.address || '',
    location_name: account.location_name || '',
    invite_phone: account.invite_phone || ''
  }
  showModal.value = true
}

const editingAccount = ref({
  isNew: false,
  phone: '',
  full_name: '',
  role: 'user',
  status: 'active',
  gender: '',
  birth_date: '',
  email: '',
  address: '',
  location_name: '',
  invite_phone: ''
})

const saveAccount = async () => {
  if (!editingAccount.value.phone) {
    alert('Vui lòng nhập số điện thoại')
    return
  }
  
  isSaving.value = true
  try {
    const { data, error } = await useFetch('/api/admin/accounts', {
      method: 'POST',
      body: { ...editingAccount.value }
    })
    
    if (error.value) throw error.value
    
    showModal.value = false
    await fetchAllData() // reload full list
  } catch (err: any) {
    alert(err.message || 'Lỗi khi lưu tài khoản')
  }
  isSaving.value = false
}

const confirmDelete = async (account: any) => {
  if (!confirm(`Bạn có chắc chắn muốn xóa tài khoản ${account.phone}?`)) return
  
  try {
    const { error } = await useFetch('/api/admin/accounts', {
      method: 'DELETE',
      body: { phone: account.phone }
    })
    
    if (error.value) throw error.value
    await fetchAllData()
  } catch (err: any) {
    alert(err.message || 'Lỗi khi xóa')
  }
}
</script>

<style scoped>
.admin-page {
  padding: 40px 15px;
  min-height: 70vh;
  background: #f8f9fa;
}

.login-wrapper { display: flex; justify-content: center; margin-top: 40px; }
.login-box {
  background: #fff; padding: 40px; border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08); text-align: center;
}

.admin-header {
  margin-bottom: 25px; border-bottom: 2px solid #e9ecef;
  padding-bottom: 15px;
}
.back-link {
  display: inline-flex; align-items: center; gap: 8px;
  color: #6c757d; text-decoration: none; font-size: 14px;
  margin-bottom: 10px; transition: color 0.2s;
}
.back-link:hover { color: #e31b1b; }
.admin-header h1 { font-size: 26px; color: #212529; font-weight: 800; margin: 0; }

.stat-card {
  background: #fff; padding: 20px; border-radius: 12px;
  display: flex; align-items: center; gap: 20px;
  border: 1px solid #e9ecef; box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  margin-bottom: 30px; max-width: 300px;
}
.stat-icon {
  width: 54px; height: 54px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; color: #fff; background: linear-gradient(135deg, #FF6B6B, #E31B1B);
}
.stat-value { font-size: 28px; font-weight: 800; color: #212529; line-height: 1; }
.stat-label { font-size: 14px; color: #6c757d; margin-top: 4px; }

.accounts-container {
  background: #fff; padding: 28px; border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e9ecef;
}

.table-actions {
  display: flex; justify-content: space-between; align-items: center;
  gap: 20px; margin-bottom: 25px; flex-wrap: wrap;
}
.table-actions h3 { font-size: 18px; font-weight: 700; margin:0; }

.search-bar {
  display: flex; align-items: center; gap: 10px;
  flex: 1; max-width: 400px; background: #f1f3f5;
  border: 1px solid #dee2e6; border-radius: 10px; padding: 8px 16px;
  transition: all 0.2s;
}
.search-bar:focus-within { background: #fff; border-color: #e31b1b; box-shadow: 0 0 0 3px rgba(227,27,27,0.1); }
.search-bar input { border: none; background: transparent; outline: none; font-size: 15px; width: 100%; }

.loading-state { text-align: center; padding: 60px; color: #e31b1b; font-size: 16px; font-weight: 600; }
.empty-state { text-align: center; padding: 40px; color: #6c757d; border: 1px dashed #dee2e6; border-radius: 8px; }

/* Advanced Pagination Controls */
.pagination-controls {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px 0; border-top: 1px solid #eee; margin-top: 10px;
}
.pagination-controls.top { border-top: none; border-bottom: 1px solid #eee; margin-bottom: 20px; padding-top: 0; }

.pagination-numbers { display: flex; align-items: center; gap: 6px; }
.page-num-btn, .page-nav-btn {
  height: 38px; min-width: 38px; border-radius: 8px; border: 1px solid #dee2e6;
  background: #fff; font-weight: 600; color: #495057; cursor: pointer;
  transition: all 0.2s; display: flex; align-items: center; justify-content: center;
}
.page-nav-btn { padding: 0 15px; }
.page-num-btn:hover, .page-nav-btn:hover:not(:disabled) { border-color: #e31b1b; color: #e31b1b; background: #fff5f5; }
.page-num-btn.active { background: #e31b1b; color: #fff; border-color: #e31b1b; }
.page-nav-btn:disabled { opacity: 0.4; cursor: not-allowed; background: #f8f9fa; }
.page-ellipsis { color: #adb5bd; padding: 0 4px; font-weight: 700; }

.page-jump { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #495057; }
.page-jump input {
  width: 50px; height: 38px; border: 1px solid #dee2e6; border-radius: 8px;
  text-align: center; font-weight: 700; outline: none;
}
.page-jump input:focus { border-color: #e31b1b; }
.page-jump button {
  height: 38px; padding: 0 15px; background: #212529; color: #fff;
  border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
}
.pagination-summary { font-size: 13px; color: #6c757d; }

.data-table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 10px; }
.data-table th { background: #f8f9fa; padding: 14px 20px; font-weight: 700; color: #495057; text-align: left; border-bottom: 2px solid #dee2e6; }
.data-table td { padding: 16px 20px; border-bottom: 1px solid #f1f3f5; color: #212529; }
.data-table tr:hover td { background-color: #fff9f9; }

.tier-badge {
  padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700;
  border: 1px solid transparent; display: inline-block;
}
.tier-0 { background: #fff4e6; color: #d9480f; border-color: #ffd8a8; }

.actions { display: flex; gap: 8px; }
.btn-icon {
  width: 36px; height: 36px; border-radius: 8px; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; color: #fff; transition: transform 0.2s;
}
.btn-icon:hover { transform: scale(1.1); }
.btn-icon.edit { background: #fab005; }
.btn-icon.delete { background: #fa5252; }

/* Modal Styles */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.modal-content {
  background: #fff; border-radius: 16px; width: 90%; max-width: 560px;
  padding: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.15);
  max-height: 90vh; overflow-y: auto;
}
.modal-content h2 { margin: 0 0 25px; font-size: 22px; font-weight: 800; border-bottom: 1px solid #f1f3f5; padding-bottom: 15px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; font-weight: 700; margin-bottom: 8px; font-size: 14px; }
.form-group input, .form-group select {
  width: 100%; padding: 12px; border: 1px solid #dee2e6; border-radius: 8px; font-size: 15px;
  background: #f8f9fa; transition: all 0.2s;
}
.form-group input:focus, .form-group select:focus { background: #fff; border-color: #e31b1b; outline: none; }

.modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 30px; }
.btn-primary {
  padding: 12px 24px; background: #e31b1b; color: #fff;
  border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) { background: #cc1515; box-shadow: 0 4px 12px rgba(227,27,27,0.2); }
.btn-outline {
  padding: 12px 24px; background: #fff; color: #495057;
  border: 1px solid #dee2e6; border-radius: 10px; font-weight: 700; cursor: pointer;
}
.btn-outline:hover { background: #f8f9fa; border-color: #adb5bd; }
</style>
