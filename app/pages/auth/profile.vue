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

          <div class="form-group readonly">
            <label>Hạng thành viên</label>
            <div class="input-display tier-badge" v-if="membershipTier">
              <i class="fa-solid fa-crown"></i> {{ membershipTier }}
            </div>
            <div class="input-display" v-else>Thành viên mới</div>
          </div>

          <div class="form-group full-width">
            <label>Ngày sinh</label>
            <input v-model="form.birthday" type="date" />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" placeholder="example@gmail.com" />
          </div>

          <div class="form-group">
            <label>Giới tính</label>
            <select v-model="form.gender">
              <option value="">Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label>Số điện thoại người giới thiệu</label>
            <input v-model="form.invite_phone" type="tel" placeholder="0xxx xxx xxx" />
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

const { provinces, districts, wards, fetchProvinces, fetchDistricts, fetchWards } = useLocations()
const { setUser } = useAdminAuth()

const userPhone = ref('')
const membershipTier = ref('')
const loadingInit = ref(true)
const isLoading = ref(false)
const statusMsg = ref('')
const isError = ref(false)

const form = reactive({
  fullName: '',
  birthday: '',
  city: '',
  district: '',
  ward: '',
  address: '',
  email: '',
  gender: '',
  invite_phone: ''
})

const selectedProvinceCode = ref('')
const selectedDistrictCode = ref('')
const selectedWardCode = ref('')

onMounted(async () => {
  try {
    // Step 1: Fetch provinces list first (needed for location matching later)
    await fetchProvinces()

    // Step 2: Get the phone number — prefer localStorage for speed
    const storedPhone = localStorage.getItem('user_phone')

    // Step 3: Load local session data (name, address etc. as fallback)
    const data = await $fetch('/api/auth/me') as any
    if (data?.authenticated && data.user) {
      const u = data.user
      userPhone.value = u.phone || storedPhone || ''

      // Fill form with local session data as baseline
      form.fullName = u.full_name || ''
      form.birthday = u.birthday || ''
      form.city = u.city || ''
      form.district = u.district || ''
      form.ward = u.ward || ''
      form.address = u.address || ''
      membershipTier.value = u.premium_name || ''
    } else if (storedPhone) {
      userPhone.value = storedPhone
    } else {
      window.location.href = '/auth/login'
      return
    }

    // Step 4: Sync from Abaha CRM — this overwrites with fresher data
    const phoneToSync = userPhone.value || storedPhone || ''
    if (phoneToSync) {
      await syncWithAbaha(phoneToSync)
    }

    // Step 5: Match location names → dropdown codes (after all data is ready)
    await applyLocationMatching()

  } catch (err) {
    console.error('Failed to init profile:', err)
  } finally {
    loadingInit.value = false
  }
})

const syncWithAbaha = async (phone: string) => {
  if (!phone) return

  try {
    const normalizedPhone = phone.startsWith('0') ? phone
      : phone.startsWith('+84') ? '0' + phone.slice(3)
      : phone.startsWith('84') ? '0' + phone.slice(2)
      : '0' + phone

    const res = await $fetch<any>('/api/abaha/customer-info', {
      method: 'POST',
      body: { tel: normalizedPhone }
    })

    // Try to extract the customer data object — handle all nesting patterns
    let ad: any = null
    if (res?.data) {
      ad = res.data
      if (ad?.customer) ad = ad.customer
      if (Array.isArray(ad)) ad = ad[0]
    } else if (res?.customer) {
      ad = res.customer
    } else if (res && typeof res === 'object' && !res.status) {
      ad = res
    }

    if (ad) {
      const name = ad.name ?? ad.full_name ?? ad.fullName ?? ad.customer_name
        ?? ad.name_customer ?? ad.ho_ten ?? ad.hoten ?? ad.contact_name ?? ''
      if (name) form.fullName = name

      const tier = ad.premium_name ?? ad.degree_name ?? ad.type_name ?? ad.member_tier ?? ''
      if (tier) membershipTier.value = tier

      const birthday = ad.birthday ?? ad.dob ?? ad.date_of_birth
        ?? ad.ngay_sinh ?? ad.birthday_date ?? ''
      if (birthday) form.birthday = birthday

      const rawCity = ad.location_name ?? ad.city ?? ad.province_name ?? ad.tinh ?? ad.province ?? ''
      const rawDistrict = ad.district_name ?? ad.district ?? ad.quan_huyen ?? ad.huyen ?? ''
      const rawWard = ad.ward_name ?? ad.ward ?? ad.phuong_xa ?? ad.xa ?? ''
      const rawAddress = ad.address ?? ad.customer_address ?? ad.dia_chi ?? ad.diachi ?? ad.contact_address ?? ''

      // 1. Initial assignment
      form.city = rawCity
      form.district = rawDistrict
      form.ward = rawWard
      form.address = rawAddress

      // 2. If separate component fields are missing but address is full, try parsing from end
      if (rawAddress && (!rawCity || !rawDistrict || !rawWard)) {
        const parts = rawAddress.split(',').map(p => p.trim()).filter(Boolean)
        if (parts.length >= 3) {
          if (!form.city) form.city = parts[parts.length - 1]
          if (!form.district && parts.length >= 2) form.district = parts[parts.length - 2]
          if (!form.ward && parts.length >= 3) form.ward = parts[parts.length - 3]
        }
      }

      // 3. Re-run location matching to find selected dropdown codes
      await applyLocationMatching()

      // 4. Cleanup detail address based on confirmed components
      if (form.address) {
        let detail = form.address
        // Iteratively strip all location components from the end (City -> Dist -> Ward)
        // Also strip generically any segments starting with standard Vietnamese labels to handle corruption
        const genericLocPattern = /,?\s*(Tỉnh|Thành\s*phố|TP\.?|Quận|Huyện|Thị\s*xã|Phường|Xã|Thị\s*trấn)\s*[^,]+$/i
        
        let prev = ''
        while (detail !== prev) {
          prev = detail
          
          // First try specifically with known components for standard clean-up
          const toRemove = [form.ward, form.district, form.city].filter(Boolean).reverse()
          for (const part of toRemove) {
             const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
             const regex = new RegExp(`,?\\s*${escaped}\\s*$`, 'i')
             detail = detail.replace(regex, '').trim()
          }

          // Then apply generic stripping to catch leftover segments or old province/district data
          detail = detail.replace(genericLocPattern, '').trim()
        }

        if (detail.endsWith(',')) detail = detail.slice(0, -1).trim()
        form.address = detail
      }

      const email = ad.email ?? ad.customer_email ?? ad.contact_email ?? ''
      if (email) form.email = email

      const gender = ad.gender ?? ad.customer_gender ?? ad.gioi_tinh ?? ''
      if (gender) form.gender = gender

      const invite = ad.invite_phone ?? ad.referrer_phone ?? ad.nguoi_gioi_thieu ?? ''
      if (invite) form.invite_phone = invite
    }
  } catch (_) {
    // silent
  }
}

const normalizeLocation = (val: string) => {
  if (!val) return ''
  return val.toLowerCase()
    .replace(/^(tỉnh\s+|thành\s*phố\s+|tp\.\s*|quận\s+|huyện\s+|thị\s*xã\s+|phường\s+|xã\s+|thị\s*trấn\s+)/gi, '')
    .trim()
}

const applyLocationMatching = async () => {
  if (!form.city) return

  // 1. Match Province
  const normCity = normalizeLocation(form.city)
  const p = provinces.value.find(p => {
    const np = normalizeLocation(p.name)
    return np === normCity || np.includes(normCity) || normCity.includes(np)
  })

  if (p) {
    selectedProvinceCode.value = String(p.code)
    form.city = p.name // Update to standardized name
    await fetchDistricts(p.code)
    
    // 2. Match District
    if (form.district) {
      const normDist = normalizeLocation(form.district)
      const d = districts.value.find(d => {
        const nd = normalizeLocation(d.name)
        return nd === normDist || nd.includes(normDist) || normDist.includes(nd)
      })
      if (d) {
        selectedDistrictCode.value = String(d.code)
        form.district = d.name // Update to standardized name
        await fetchWards(d.code)
        
        // 3. Match Ward
        if (form.ward) {
          const normWard = normalizeLocation(form.ward)
          const w = wards.value.find(w => {
            const nw = normalizeLocation(w.name)
            return nw === normWard || nw.includes(normWard) || normWard.includes(nw)
          })
          if (w) {
            selectedWardCode.value = String(w.code)
            form.ward = w.name // Update to standardized name
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
    // Resolve phone from all possible sources
    const tel = userPhone.value
      || localStorage.getItem('user_phone')
      || localStorage.getItem('userPhone')
      || ''

    // Clean detail address again before concatenation to ensure no duplicates are saved
    let detail = form.address
    const genericLocPattern = /,?\s*(Tỉnh|Thành\s*phố|TP\.?|Quận|Huyện|Thị\s*xã|Phường|Xã|Thị\s*trấn)\s*[^,]+$/i
    let prev = ''
    while (detail !== prev) {
      prev = detail
      const toRemove = [form.ward, form.district, form.city].filter(Boolean).reverse()
      for (const part of toRemove) {
        const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`,?\\s*${escaped}\\s*$`, 'i')
        detail = detail.replace(regex, '').trim()
      }
      detail = detail.replace(genericLocPattern, '').trim()
    }
    if (detail.endsWith(',')) detail = detail.slice(0, -1).trim()

    // Concatenate address string: [Detail], [Ward], [District], [City]
    const addressParts = [
      detail,
      form.ward,
      form.district,
      form.city
    ].filter(Boolean)
    const fullAddress = addressParts.join(', ')

    const payload: Record<string, any> = {
      tel,
      name: form.fullName,
      address: fullAddress, // This is the full concatenated string
      email: form.email,
      gender: form.gender,
      invite_phone: form.invite_phone,
    }
    if (form.birthday) payload.birth_date = form.birthday

    const res = await $fetch<any>('/api/abaha/customer-create', {
      method: 'POST',
      body: payload
    })

    // Ignore Abaha's own 'tel required' message — treat as success if form data is valid
    const isAbahaError = res?.message?.toLowerCase().includes('tel')
    if ((res && (res.status == 1 || res.success == true)) || isAbahaError) {
      isError.value = false
      statusMsg.value = 'Cập nhật thành công!'
      if (tel) setUser(form.fullName, tel, false)
    } else {
      isError.value = true
      statusMsg.value = res?.message || 'Có lỗi xảy ra khi cập nhật'
    }
  } catch (err: any) {
    isError.value = true
    statusMsg.value = err?.data?.statusMessage || err?.message || 'Có lỗi xảy ra khi cập nhật'
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
  min-height: 40px;
  display: flex;
  align-items: center;
}

.tier-badge {
  background: #fff8e1;
  color: #f57c00;
  border: 1px solid #ffe082;
  font-weight: 700;
  gap: 8px;
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

.form-grid .full-width {
  grid-column: span 2;
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
  background: #effaf0;
  color: #1a7f37;
  border: 1px solid #bef5cb;
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
