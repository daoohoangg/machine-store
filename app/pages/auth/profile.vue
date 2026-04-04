<template>
  <div class="profile-page container">
    <div class="profile-card">
      <div class="header-back">
        <button class="back-btn" @click="$router.back()"><i class="fa-solid fa-arrow-left"></i> Trở lại</button>
        <h1>Thông tin tài khoản</h1>
      </div>
      
      <p class="subtitle">Cập nhật thông tin cá nhân để nhận hàng thuận tiện hơn</p>

      <div v-if="loadingInit" class="loading-state">
        <i class="fa-solid fa-spinner fa-spin"></i> Đang tải thông tin...
      </div>

      <form v-else @submit.prevent="handleUpdate">
        <div class="form-grid">
          <div class="form-group readonly">
            <label>Số điện thoại</label>
            <div class="input-display">{{ userPhone }}</div>
          </div>

          <div class="form-group">
            <label>Họ và Tên <em>*</em></label>
            <input v-model="form.fullName" type="text" placeholder="Nhập họ tên" required />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" placeholder="Nhập email (tùy chọn)" />
          </div>
        </div>

        <div class="form-section">
          <h3>📍 Địa chỉ nhận hàng mặc định</h3>
          <div class="address-grid">
            <div class="form-group">
              <label>Tỉnh/Thành phố</label>
              <select v-model="selectedProvinceCode" @change="onProvinceChange">
                <option value="">Chọn Tỉnh/Thành phố</option>
                <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Quận/Huyện</label>
              <select v-model="selectedDistrictCode" @change="onDistrictChange" :disabled="!selectedProvinceCode">
                <option value="">Chọn Quận/Huyện</option>
                <option v-for="d in districts" :key="d.code" :value="d.code">{{ d.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Phường/Xã</label>
              <select v-model="selectedWardCode" @change="onWardChange" :disabled="!selectedDistrictCode">
                <option value="">Chọn Phường/Xã</option>
                <option v-for="w in wards" :key="w.code" :value="w.code">{{ w.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-group full-width">
            <label>Địa chỉ chi tiết (số nhà, tên đường...)</label>
            <input v-model="form.address" type="text" placeholder="Số nhà, tên đường, thôn, xóm..." />
          </div>
        </div>

        <div v-if="statusMsg" :class="['status-msg', isError ? 'error' : 'success']">
          <i :class="isError ? 'fa-solid fa-circle-exclamation' : 'fa-solid fa-circle-check'"></i>
          {{ statusMsg }}
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="isLoading">
            <span v-if="isLoading"><i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...</span>
            <span v-else>Lưu thay đổi</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useLocations } from '~/composables/useLocations'
import { useAdminAuth } from '~/composables/useAdminAuth'
import { useAbahaApi } from '~/composables/useAbahaApi'

const { provinces, districts, wards, fetchProvinces, fetchDistricts, fetchWards } = useLocations()
const { setUser } = useAdminAuth()

const userPhone = ref('')
const loadingInit = ref(true)
const isLoading = ref(false)
const statusMsg = ref('')
const isError = ref(false)

const form = reactive({
  fullName: '',
  email: '',
  city: '',
  district: '',
  ward: '',
  address: ''
})

const selectedProvinceCode = ref('')
const selectedDistrictCode = ref('')
const selectedWardCode = ref('')

onMounted(async () => {
  try {
    const storedPhone = localStorage.getItem('user_phone')
    if (storedPhone) {
      userPhone.value = storedPhone
      await syncWithAbaha(storedPhone)
    }

    const data = await $fetch('/api/auth/me')
    if (data?.authenticated && data.user) {
      const u = data.user
      userPhone.value = u.phone
      
      form.fullName = u.full_name || form.fullName
      form.email = u.email || form.email
      form.city = u.city || form.city
      form.district = u.district || form.district
      form.ward = u.ward || form.ward
      form.address = u.address || form.address

      if (u.phone !== storedPhone) {
        await syncWithAbaha(u.phone)
      }
      
      await applyLocationMatching()
    } else {
      window.location.href = '/auth/login'
    }
  } catch (err) {
    console.error('Failed to init profile:', err)
  } finally {
    loadingInit.value = false
  }
})

const syncWithAbaha = async (phone: string) => {
  if (!phone) {
    console.warn('[Abaha Sync] No phone number provided')
    return
  }
  
  try {
    console.log('[Abaha Sync] Starting sync for phone:', phone)
    const { request } = useAbahaApi()
    const normalizedPhone = phone.startsWith('0') ? phone : (phone.startsWith('84') ? '0' + phone.slice(2) : (phone.startsWith('+84') ? '0' + phone.slice(3) : '0' + phone))
    console.log('[Abaha Sync] Normalized phone:', normalizedPhone)
    
    const abahaRes = await request('customer/info', {
      method: 'POST',
      query: { token: '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA' },
      body: { tel: normalizedPhone }
    }) as any
    
    console.log('[Abaha Sync] Raw response:', abahaRes)
    
    if (abahaRes && abahaRes.status === 1 && abahaRes.data) {
      // Abaha info can return an object or an array with one object
      const ad = Array.isArray(abahaRes.data) ? abahaRes.data[0] : abahaRes.data
      
      if (ad) {
        console.log('[Abaha Sync] Customer record found:', ad)
        // Prioritize Abaha data
        if (ad.name || ad.full_name) {
          form.fullName = ad.name || ad.full_name
          console.log('[Abaha Sync] Updated name to:', form.fullName)
        }
        if (ad.email) {
          form.email = ad.email
          console.log('[Abaha Sync] Updated email to:', form.email)
        }
        if (ad.address) {
          form.address = ad.address
          console.log('[Abaha Sync] Updated address to:', form.address)
        }

        form.city = ad.location_name || ad.city || form.city
        form.district = ad.district_name || ad.district || form.district
        form.ward = ad.ward_name || ad.ward || form.ward
        
        console.log('[Abaha Sync] Final form state:', form)
      } else {
        console.warn('[Abaha Sync] data object is empty')
      }
    } else {
      console.warn('[Abaha Sync] API returned non-success status or missing data:', abahaRes)
    }
  } catch (err) {
    console.error('[Abaha Sync] Request failed:', err)
  }
}

const applyLocationMatching = async () => {
  await fetchProvinces()
  
  if (form.city) {
    const p = provinces.value.find(p => p.name === form.city || p.name.includes(form.city) || form.city.includes(p.name))
    if (p) {
      selectedProvinceCode.value = p.code
      await fetchDistricts(p.code)
      
      if (form.district) {
        const d = districts.value.find(d => d.name === form.district || d.name.includes(form.district) || form.district.includes(d.name))
        if (d) {
          selectedDistrictCode.value = d.code
          await fetchWards(d.code)
          
          if (form.ward) {
            const w = wards.value.find(w => w.name === form.ward || w.name.includes(form.ward) || form.ward.includes(w.name))
            if (w) {
              selectedWardCode.value = w.code
            }
          }
        }
      }
    }
  }
}

const onProvinceChange = async () => {
  form.district = ''
  form.ward = ''
  selectedDistrictCode.value = ''
  selectedWardCode.value = ''
  
  const province = provinces.value.find(p => p.code == selectedProvinceCode.value)
  form.city = province ? province.name : ''
  if (selectedProvinceCode.value) {
    await fetchDistricts(selectedProvinceCode.value)
  }
}

const onDistrictChange = async () => {
  form.ward = ''
  selectedWardCode.value = ''
  
  const district = districts.value.find(d => d.code == selectedDistrictCode.value)
  form.district = district ? district.name : ''
  if (selectedDistrictCode.value) {
    await fetchWards(selectedDistrictCode.value)
  }
}

const onWardChange = () => {
  const ward = wards.value.find(w => w.code == selectedWardCode.value)
  form.ward = ward ? ward.name : ''
}

const handleUpdate = async () => {
  isLoading.value = true
  statusMsg.value = ''
  isError.value = false
  
  try {
    const res = await $fetch('/api/auth/profile', {
      method: 'PUT',
      body: form
    })
    
    if (res.success) {
      statusMsg.value = 'Cập nhật thông tin thành công!'
      // Update global auth state
      setUser(form.fullName, userPhone.value, false)
    }
  } catch (err) {
    isError.value = true
    statusMsg.value = err.data?.statusMessage || 'Có lỗi xảy ra khi cập nhật'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.profile-page {
  padding: 40px 10px;
  background: #f8f9fa;
  min-height: 80vh;
}

.profile-card {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 30px;
}

.header-back {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 5px;
}

.back-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.back-btn:hover {
  color: #000;
}

h1 {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.subtitle {
  color: #888;
  margin-bottom: 30px;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #444;
  font-size: 14px;
}

.form-group label em {
  color: red;
  font-style: normal;
}

.input-display {
  padding: 10px 12px;
  background: #f0f0f0;
  border-radius: 4px;
  color: #666;
  font-weight: 500;
}

input[type="text"],
input[type="email"],
select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  transition: border-color 0.2s;
}

input:focus,
select:focus {
  border-color: #007bff;
  outline: none;
}

.form-section {
  border-top: 1px solid #eee;
  padding-top: 25px;
  margin-top: 10px;
}

.form-section h3 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.full-width {
  grid-column: span 3;
}

.status-msg {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-msg.success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}

.status-msg.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-primary {
  padding: 12px 30px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .address-grid {
    grid-template-columns: 1fr;
  }
  
  .full-width {
    grid-column: span 1;
  }
}
</style>
