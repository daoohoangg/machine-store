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
    if (!rawManualGroups.value[groupName].some(p => String(p.id) === String(product.id))) {
      // Store the RAW product if possible. If the product passed in is already adjusted, 
      // we might need to be careful, but HomeProduct usually has raw values if we just fetched it.
      rawManualGroups.value[groupName].unshift(product)
    }
  }

  const removeFromGroup = (groupName: keyof ManualGroups, productId: string) => {
    rawManualGroups.value[groupName] = rawManualGroups.value[groupName].filter(p => String(p.id) !== String(productId))
  }

  const clearGroup = (groupName: keyof ManualGroups) => {
    rawManualGroups.value[groupName] = []
  }

  // Reactive mapping
  const manualGroups = computed<ManualGroups>(() => {
    const isLoggedIn = isUser.value || isAdmin.value

    // Outlet shop: LUÔN hiển thị giá "price" (giá bán lẻ), không áp dụng giá đại lý
    const applyOutletPrices = (list: any[]) => {
      const isLoggedIn = isUser.value || isAdmin.value
      return list.map(p => {
        const retailPrice = Number(p.originalPrice || p.price) || 0
        const nppPrice = Number(p.originalDiscount || p.discount) || 0
        
        if (!isLoggedIn) {
          return {
            ...p,
            rawPrice: retailPrice,
            price: retailPrice,
            oldPrice: null
          } as HomeProduct
        }
        
        const basePrice = (nppPrice > 0) ? nppPrice : retailPrice
        const finalPrice = (isAgencyAccount.value) ? calculateAdjustedPrice(basePrice, userTier.value) : basePrice
        
        return {
          ...p,
          rawPrice: retailPrice,
          price: finalPrice,
          oldPrice: retailPrice > finalPrice ? retailPrice : null
        } as HomeProduct
      })
    }

    const applyPrices = (list: any[]) => {
      return list.map(p => {
        // Lấy giá bán lẻ từ originalPrice (nếu không có thì fallback)
        const retailPrice = Number(p.originalPrice || p.price) || 0
        // Lấy giá NPP từ originalDiscount (nếu không có thì fallback)
        const nppPrice = Number(p.originalDiscount || p.discount) || 0

        // Chưa đăng nhập hoặc không phải đại lý: dùng giá bán lẻ
        // Đại lý đã đăng nhập: dùng giá NPP rồi áp dụng tier chiết khấu
        const rawPrice = (isLoggedIn && isAgencyAccount.value && nppPrice > 0)
          ? nppPrice
          : retailPrice

        const rawOldPrice = (p.rawOldPrice || p.oldPrice || p.discount)
          ? Math.max(Number(p.rawOldPrice || 0), Number(p.oldPrice || 0), Number(p.discount || 0))
          : null

        return {
          ...p,
          rawPrice: rawPrice,
          rawOldPrice: p.rawOldPrice || p.oldPrice,
          price: (isLoggedIn && isAgencyAccount.value) ? calculateAdjustedPrice(rawPrice, userTier.value) : rawPrice,
          oldPrice: rawOldPrice ? ((isLoggedIn && isAgencyAccount.value) ? calculateAdjustedPrice(rawOldPrice, userTier.value) : rawOldPrice) : null
        } as HomeProduct
      })
    }

    return {
      'outlet-shop': applyOutletPrices(rawManualGroups.value['outlet-shop']),
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



