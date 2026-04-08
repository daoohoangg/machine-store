<template>
  <div class="admin-page container">
    <div v-if="!isAdmin" class="login-wrapper">
      <div class="login-box">
        <h2>Đăng nhập quản trị</h2>
        <p>Vui lòng nhập số điện thoại để tiếp tục</p>
        <div class="form-group">
          <input 
            type="text" 
            v-model="phoneInput" 
            placeholder="Nhập số điện thoại..." 
            @keyup.enter="handleLogin"
          />
        </div>
        <div v-if="loginError" class="error-msg">{{ loginError }}</div>
        <button class="btn-primary" @click="handleLogin" :disabled="isLoading">
          {{ isLoading ? 'Đang kiểm tra...' : 'Đăng nhập' }}
        </button>
      </div>
    </div>
    
    <div v-else class="admin-dashboard">
      <div class="admin-header">
        <h1>Quản lý Website</h1>
        <div class="header-actions">
          <NuxtLink to="/admin/san-pham-group" class="btn-outline group-mgr-btn"><i class="fa-solid fa-layer-group"></i> Quản lý Nhóm SP</NuxtLink>
          <NuxtLink to="/admin/baiviet" class="btn-outline news-mgr-btn"><i class="fa-solid fa-newspaper"></i> Quản lý Bài viết</NuxtLink>
          <NuxtLink to="/admin/accounts" class="btn-outline account-mgr-btn"><i class="fa-solid fa-users-gear"></i> Quản lý Tài khoản</NuxtLink>
          <NuxtLink to="/admin/edit-price" class="btn-outline price-mgr-btn"><i class="fa-solid fa-tags"></i> Cấu hình Giá</NuxtLink>
          <NuxtLink to="/admin/vouchers" class="btn-outline voucher-mgr-btn"><i class="fa-solid fa-ticket"></i> Quản lý Voucher</NuxtLink>
          <button class="btn-outline logout-btn" @click="handleLogout">Đăng xuất</button>
        </div>
      </div>

      <div class="dashboard-stats" v-if="isAdmin">
        <div class="stat-card" @click="$router.push('/admin/san-pham-group')">
          <div class="stat-icon flash"><i class="fa-solid fa-bolt"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ manualGroups['flash-sale']?.length || 0 }}</div>
            <div class="stat-label">Sản phẩm Flash Sale</div>
          </div>
        </div>
        <div class="stat-card" @click="$router.push('/admin/san-pham-group')">
          <div class="stat-icon new"><i class="fa-solid fa-plus"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ manualGroups['new-products']?.length || 0 }}</div>
            <div class="stat-label">Sản phẩm mới</div>
          </div>
        </div>
        <div class="stat-card" @click="$router.push('/admin/baiviet')">
          <div class="stat-icon news"><i class="fa-solid fa-newspaper"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ newsList.length }}</div>
            <div class="stat-label">Bài viết tin tức</div>
          </div>
        </div>
        <div class="stat-card" @click="$router.push('/admin/edit-price')">
          <div class="stat-icon price"><i class="fa-solid fa-tags"></i></div>
          <div class="stat-info">
            <div class="stat-value">%</div>
            <div class="stat-label">Cấu hình chiết khấu</div>
          </div>
        </div>
        <div class="stat-card" @click="$router.push('/admin/vouchers')">
          <div class="stat-icon voucher"><i class="fa-solid fa-ticket"></i></div>
          <div class="stat-info">
            <div class="stat-value">{{ voucherCount }}</div>
            <div class="stat-label">Mã giảm giá</div>
          </div>
        </div>
      </div>
      
      <div class="settings-form">
        <div class="form-section">
          <h3>Thông tin liên hệ</h3>
          
          <div class="form-group">
            <label>Hotline</label>
            <input type="text" v-model="formSettings.hotline" />
          </div>
          
          <div class="form-group">
            <label>Địa chỉ</label>
            <input type="text" v-model="formSettings.address" />
          </div>
          
          <div class="form-group">
            <label>Email liên hệ</label>
            <input type="text" v-model="formSettings.email" />
          </div>
        </div>
        
        <div class="form-section">
          <h3>Mạng xã hội</h3>
          
          <div class="form-group">
            <label>Link Facebook</label>
            <input type="text" v-model="formSettings.facebook" />
          </div>
          
          <div class="form-group">
            <label>Link Zalo</label>
            <input type="text" v-model="formSettings.zalo" />
          </div>
          
          <div class="form-group">
            <label>Link Youtube</label>
            <input type="text" v-model="formSettings.youtube" />
          </div>
          
          <div class="form-group">
            <label>Link Tiktok</label>
            <input type="text" v-model="formSettings.tiktok" />
          </div>
        </div>

        <div class="form-section" v-if="formSettings.policies">
          <h3>Nội dung Trang "Chính sách"</h3>
          <div v-for="(policy, key) in formSettings.policies" :key="key" class="policy-edit-box">
            <h4><i class="fa-solid" :class="policy.icon"></i> Tab: {{ policy.title }}</h4>
            <div class="form-group">
              <label>Tên Tab (Tiêu đề)</label>
              <input type="text" v-model="policy.title" />
            </div>
            <div class="form-group">
              <label>Nội dung hiển thị (Mã HTML)</label>
              <textarea v-model="policy.content" rows="8"></textarea>
            </div>
            <div class="last-updated"><em>Cập nhật lần cuối: {{ policy.updatedAt }}</em></div>
          </div>
        </div>
        
        <div class="form-actions">
          <transition name="fade">
            <span v-if="saveSuccess" class="success-msg"><i class="fa-solid fa-check"></i> Đã lưu cài đặt!</span>
          </transition>
          <button class="btn-primary" @click="saveSettings">Lưu thay đổi</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { useAdminAuth } from '~/composables/useAdminAuth'
import { useManualGroups } from '~/composables/useManualGroups'
import { useNews } from '~/composables/useNews'

useHead({ title: 'Quản trị hệ thống' })

const { settings, loadSettings } = useSiteSettings()
const { isAdmin, login, logout: logoutAuth, initAuth } = useAdminAuth()
const { manualGroups, fetchManualGroups } = useManualGroups()
const { newsList, loadNews } = useNews()

const phoneInput = ref('')
const loginError = ref('')
const saveSuccess = ref(false)
const isLoading = ref(false)
const voucherCount = ref(0)

const formSettings = ref({
  hotline: '',
  address: '',
  email: '',
  facebook: '',
  zalo: '',
  youtube: '',
  tiktok: '',
  policies: null
})

onMounted(() => {
  initAuth()
  fetchManualGroups()
  loadNews()
  fetchVoucherCount()
  
  // Sync initial form settings
  setTimeout(() => {
    formSettings.value = JSON.parse(JSON.stringify(settings.value))
  }, 100)
})

const fetchVoucherCount = async () => {
  try {
    const res = await $fetch('/api/admin/vouchers')
    if (res.success) {
      voucherCount.value = res.data.length
    }
  } catch (e) {}
}

const handleLogin = async () => {
  if (!phoneInput.value) return;
  loginError.value = ''
  isLoading.value = true
  const res = await login(phoneInput.value)
  isLoading.value = false
  
  if (res && res.success) {
    formSettings.value = JSON.parse(JSON.stringify(settings.value))
  } else {
    loginError.value = res?.error || 'Số điện thoại không có quyền truy cập.'
  }
}

const handleLogout = () => {
  logoutAuth()
  phoneInput.value = ''
}

const getCurrentTimestamp = () => {
  const now = new Date()
  const pad = (n) => n.toString().padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

const saveSettings = () => {
  // Update policy timestamps if content changed
  if (formSettings.value.policies && settings.value.policies) {
    for (const key in formSettings.value.policies) {
      if (formSettings.value.policies[key].content !== settings.value.policies[key].content || 
          formSettings.value.policies[key].title !== settings.value.policies[key].title) {
        formSettings.value.policies[key].updatedAt = getCurrentTimestamp()
      }
    }
  }

  localStorage.setItem('site_settings', JSON.stringify(formSettings.value))
  settings.value = JSON.parse(JSON.stringify(formSettings.value))
  
  saveSuccess.value = true
  setTimeout(() => {
    saveSuccess.value = false
  }, 3000)
}
</script>

<style scoped>
.admin-page {
  padding: 40px 15px;
  min-height: 70vh;
  display: flex;
  justify-content: center;
}

.login-wrapper {
  width: 100%;
  max-width: 400px;
  margin-top: 40px;
}

.login-box {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
  border: 1px solid #eee;
}

.login-box h2 {
  color: #e31b1b;
  margin: 0 0 10px;
}

.login-box p {
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
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

.error-msg {
  color: #e31b1b;
  font-size: 13px;
  margin-bottom: 15px;
}

.success-msg {
  color: #2dca2f;
  font-weight: 600;
  margin-right: 15px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #e31b1b;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-weight: 700;
  font-size: 16px;
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
}

.btn-outline:hover {
  background: #f5f5f5;
}

.admin-dashboard {
  width: 100%;
  max-width: 800px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
}

.admin-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.settings-form {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.form-section {
  margin-bottom: 40px;
}

.form-section h3 {
  font-size: 18px;
  color: #e31b1b;
  margin: 0 0 15px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #eee;
}

.policy-edit-box {
  background: #fdfdfd;
  border: 1px solid #e0e0e0;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.policy-edit-box h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #0066cc;
  display: flex;
  align-items: center;
  gap: 10px;
}

.last-updated {
  font-size: 12px;
  color: #888;
  text-align: right;
  margin-top: -10px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.form-actions .btn-primary {
  width: auto;
  padding: 10px 24px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .admin-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}

/* Dashboard Stats */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
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

.stat-icon.flash { background: linear-gradient(135deg, #FFD93D, #FF8400); }
.stat-icon.new { background: linear-gradient(135deg, #4D96FF, #0061FF); }
.stat-icon.news { background: linear-gradient(135deg, #6BCB77, #1B9C85); }
.stat-icon.price { background: linear-gradient(135deg, #F273E6, #9D3CFF); }
.stat-icon.voucher { background: linear-gradient(135deg, #FF6B6B, #EE5253); }

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #777;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .dashboard-stats {
    grid-template-columns: 1fr;
  }
}
</style>
