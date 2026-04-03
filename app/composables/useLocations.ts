import { ref } from 'vue'

export interface LocationItem {
  name: string
  code: number
  division_type: string
  codename: string
}

export interface Province extends LocationItem {
  phone_code: number
}

export interface District extends LocationItem {
  province_code: number
}

export interface Ward extends LocationItem {
  district_code: number
}

export const useLocations = () => {
  const provinces = ref<Province[]>([])
  const districts = ref<District[]>([])
  const wards = ref<Ward[]>([])
  
  const isLoadingProvinces = ref(false)
  const isLoadingDistricts = ref(false)
  const isLoadingWards = ref(false)

  const fetchProvinces = async () => {
    if (provinces.value.length > 0) return
    isLoadingProvinces.value = true
    try {
      const data = await $fetch<Province[]>('https://provinces.open-api.vn/api/p/')
      provinces.value = data
    } catch (err) {
      console.error('Failed to fetch provinces:', err)
    } finally {
      isLoadingProvinces.value = false
    }
  }

  const fetchDistricts = async (provinceCode: number | string) => {
    if (!provinceCode) {
      districts.value = []
      return
    }
    isLoadingDistricts.value = true
    try {
      const data = await $fetch<{ districts: District[] }>(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`)
      districts.value = data.districts || []
    } catch (err) {
      console.error('Failed to fetch districts:', err)
      districts.value = []
    } finally {
      isLoadingDistricts.value = false
    }
  }

  const fetchWards = async (districtCode: number | string) => {
    if (!districtCode) {
      wards.value = []
      return
    }
    isLoadingWards.value = true
    try {
      const data = await $fetch<{ wards: Ward[] }>(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`)
      wards.value = data.wards || []
    } catch (err) {
      console.error('Failed to fetch wards:', err)
      wards.value = []
    } finally {
      isLoadingWards.value = false
    }
  }

  return {
    provinces,
    districts,
    wards,
    isLoadingProvinces,
    isLoadingDistricts,
    isLoadingWards,
    fetchProvinces,
    fetchDistricts,
    fetchWards
  }
}
