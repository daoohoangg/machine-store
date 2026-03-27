import { useState } from '#imports'

import type { HomeProduct } from './useHomeProducts'

export interface ManualGroups {
  'flash-sale': HomeProduct[]
  'new-products': HomeProduct[]
}

export const useManualGroups = () => {
  const manualGroups = useState<ManualGroups>('manual-groups', () => ({
    'flash-sale': [],
    'new-products': []
  }))
  const isLoading = useState('manual-groups-loading', () => false)
  const error = useState<any>('manual-groups-error', () => null)

  const fetchManualGroups = async () => {
    isLoading.value = true
    try {
      const data = await $fetch<ManualGroups>('/api/manual-groups')
      if (data) {
        // Robust mapping to ensure we always have objects. 
        // If the file still has string IDs, they will be handled as empty objects or filtered out 
        // until the admin page saves the full objects.
        manualGroups.value = {
          'flash-sale': (data['flash-sale'] || []).filter(p => typeof p === 'object' && p !== null) as HomeProduct[],
          'new-products': (data['new-products'] || []).filter(p => typeof p === 'object' && p !== null) as HomeProduct[]
        }
      }
    } catch (err) {
      error.value = err
      console.error('Failed to fetch manual groups:', err)
    } finally {
      isLoading.value = false
    }
  }

  const saveManualGroups = async () => {
    isLoading.value = true
    try {
      const resp = await $fetch<any>('/api/manual-groups', {
        method: 'POST',
        body: manualGroups.value
      })
      if (resp && resp.success === false) {
        throw new Error(resp.error || 'Lỗi server khi lưu nhóm')
      }
    } catch (err) {
      error.value = err
      console.error('Failed to save manual groups:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addToGroup = (groupName: keyof ManualGroups, product: HomeProduct) => {
    if (!manualGroups.value[groupName].some(p => String(p.id) === String(product.id))) {
      manualGroups.value[groupName].unshift(product)
    }
  }

  const removeFromGroup = (groupName: keyof ManualGroups, productId: string) => {
    manualGroups.value[groupName] = manualGroups.value[groupName].filter(p => String(p.id) !== String(productId))
  }

  const clearGroup = (groupName: keyof ManualGroups) => {
    manualGroups.value[groupName] = []
  }

  return {
    manualGroups,
    isLoading,
    error,
    fetchManualGroups,
    saveManualGroups,
    addToGroup,
    removeFromGroup,
    clearGroup
  }
}
