import { useState } from '#imports'

export interface ManualGroups {
  'flash-sale': string[]
  'new-products': string[]
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
        manualGroups.value = {
          'flash-sale': data['flash-sale'] || [],
          'new-products': data['new-products'] || []
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
      await $fetch('/api/manual-groups', {
        method: 'POST',
        body: manualGroups.value
      })
    } catch (err) {
      error.value = err
      console.error('Failed to save manual groups:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addToGroup = (groupName: keyof ManualGroups, productId: string) => {
    if (!manualGroups.value[groupName].includes(productId)) {
      manualGroups.value[groupName].unshift(productId)
    }
  }

  const removeFromGroup = (groupName: keyof ManualGroups, productId: string) => {
    manualGroups.value[groupName] = manualGroups.value[groupName].filter(id => id !== productId)
  }

  return {
    manualGroups,
    isLoading,
    error,
    fetchManualGroups,
    saveManualGroups,
    addToGroup,
    removeFromGroup
  }
}
