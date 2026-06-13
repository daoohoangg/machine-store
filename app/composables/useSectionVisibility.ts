import { useState } from '#imports'

export interface SectionVisibility {
  showOutletShop: boolean
  showNewProducts: boolean
}

const defaultVisibility: SectionVisibility = {
  showOutletShop: true,
  showNewProducts: true,
}

export const useSectionVisibility = () => {
  const visibility = useState<SectionVisibility>('section-visibility', () => ({ ...defaultVisibility }))
  const isLoaded = useState('section-visibility-loaded', () => false)
  const isSaving = useState('section-visibility-saving', () => false)

  const fetchVisibility = async () => {
    if (isLoaded.value) return
    try {
      // Fetch từ manual_groups API với metadata status
      const data = await $fetch<any>('/api/manual-groups-status')
      if (data) {
        visibility.value = {
          showOutletShop: data['outlet-shop'] !== false,
          showNewProducts: data['new-products'] !== false,
        }
      }
    } catch (e) {
      console.error('[useSectionVisibility] fetch error:', e)
    } finally {
      isLoaded.value = true
    }
  }

  const saveVisibility = async (newVal?: Partial<SectionVisibility>) => {
    if (newVal) {
      visibility.value = { ...visibility.value, ...newVal }
    }
    isSaving.value = true
    try {
      const res = await $fetch<any>('/api/manual-groups-status', {
        method: 'POST',
        body: {
          'outlet-shop': visibility.value.showOutletShop,
          'new-products': visibility.value.showNewProducts,
        },
      })
      if (res && res.success === false) {
        throw new Error(res.error || 'Lỗi server')
      }
      return true
    } catch (e) {
      console.error('[useSectionVisibility] save error:', e)
      throw e
    } finally {
      isSaving.value = false
    }
  }

  return {
    visibility,
    isLoaded,
    isSaving,
    fetchVisibility,
    saveVisibility,
  }
}
