import { useState } from '#imports'

import type { HomeProduct } from './useHomeProducts'
import { useAdminAuth } from './useAdminAuth'
import { useMembershipPrices } from './useMembershipPrices'

export interface ManualGroups {
  'outlet-shop': HomeProduct[]
  'new-products': HomeProduct[]
}

export const useManualGroups = () => {
  const rawManualGroups = useState<ManualGroups>('manual-groups-raw', () => ({
    'outlet-shop': [],
    'new-products': []
  }))
  const { userTier, isUser, isAdmin, isAgencyAccount } = useAdminAuth()
  const { calculateAdjustedPrice } = useMembershipPrices()
  const isLoading = useState('manual-groups-loading', () => false)
  const error = useState<any>('manual-groups-error', () => null)

  const fetchManualGroups = async () => {
    isLoading.value = true
    try {
      const data = await $fetch<ManualGroups>('/api/manual-groups')
      if (data) {
        rawManualGroups.value = {
          'outlet-shop': (data['outlet-shop'] || []).filter(p => typeof p === 'object' && p !== null),
          'new-products': (data['new-products'] || []).filter(p => typeof p === 'object' && p !== null)
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
        body: rawManualGroups.value
      })
      if (resp && resp.success === false) {
        throw new Error(resp.error || 'Loi server khi luu nhom')
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
    if (!rawManualGroups.value[groupName].some(p => String(p.id) === String(product.id))) {
      rawManualGroups.value[groupName].unshift(product)
    }
  }

  const removeFromGroup = (groupName: keyof ManualGroups, productId: string) => {
    rawManualGroups.value[groupName] = rawManualGroups.value[groupName].filter(p => String(p.id) !== String(productId))
  }

  const clearGroup = (groupName: keyof ManualGroups) => {
    rawManualGroups.value[groupName] = []
  }

  const manualGroups = computed<ManualGroups>(() => {
    const isLoggedIn = isUser.value || isAdmin.value

    const applyPrices = (list: any[]) => {
      return list.map(p => {
        const retailPrice = Number(p.originalPrice || p.price) || 0
        const nppPrice = Number(p.originalDiscount || p.discount) || 0

        // T?t c? ngu?i dùng dã dang nh?p d?u dùng giá nppPrice (discount t? API) n?u có
        const rawPriceBase = (isLoggedIn && nppPrice > 0)
          ? nppPrice
          : retailPrice

        // Áp d?ng chi?t kh?u c?p b?c d?i lý (n?u là tài kho?n d?i lý)
        const finalPrice = (isLoggedIn && isAgencyAccount.value) 
          ? calculateAdjustedPrice(rawPriceBase, userTier.value) 
          : rawPriceBase

        // Giá g?ch ngang cu
        const rawOldPrice = (p.rawOldPrice || p.oldPrice || p.discount)
          ? Math.max(Number(p.rawOldPrice || 0), Number(p.oldPrice || 0), Number(p.discount || 0))
          : null

        return {
          ...p,
          rawPrice: retailPrice, // Luôn luu giá g?c bán l? d? làm giá g?c so sánh
          rawOldPrice: p.rawOldPrice || p.oldPrice,
          price: finalPrice, // Giá hi?n th? sau cùng
          oldPrice: rawOldPrice ? ((isLoggedIn && isAgencyAccount.value) ? calculateAdjustedPrice(rawOldPrice, userTier.value) : rawOldPrice) : null
        } as HomeProduct
      })
    }

    return {
      'outlet-shop': applyPrices(rawManualGroups.value['outlet-shop']),
      'new-products': applyPrices(rawManualGroups.value['new-products'])
    }
  })

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
