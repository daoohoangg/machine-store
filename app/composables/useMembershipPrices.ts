import { useState } from '#imports'

export interface TierAdjustment {
  name: string
  percent: number
}

// Default tiers centered around discounts
const defaultTiers: TierAdjustment[] = [
  { name: 'Chiết khấu 3%', percent: 3 },
  { name: 'Chiết khấu 5%', percent: 5 },
  { name: 'Chiết khấu 7%', percent: 7 },
  { name: 'Đại lý cấp 1, 2 (Mặc định)', percent: 0 },
  { name: 'Đại lý cấp 3 (Giảm 2%)', percent: 2 }
]

export const useMembershipPrices = () => {
  const tiers = useState<TierAdjustment[]>('membership-tiers', () => [...defaultTiers])
  const isLoaded = useState('membership-tiers-loaded', () => false)
  const isPending = useState('membership-tiers-pending', () => false)

  const loadTiers = async () => {
    if (isLoaded.value) return
    isPending.value = true
    try {
      const response: any = await $fetch('/api/admin/tiers')
      if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
        tiers.value = response.data
      }
    } catch (e) {
      console.error('Failed to load membership tiers from DB, using defaults', e)
    } finally {
      isLoaded.value = true
      isPending.value = false
    }
  }

  // Tự động load nếu đang trên client và chưa load
  if (import.meta.client && !isLoaded.value && !isPending.value) {
    loadTiers()
  }

  const saveTiers = async (newTiers: TierAdjustment[]) => {
    isPending.value = true
    try {
      const response: any = await $fetch('/api/admin/tiers', {
        method: 'POST',
        body: { tiers: newTiers }
      })
      if (response && response.success) {
        tiers.value = [...newTiers]
      }
    } catch (e) {
      console.error('Failed to save membership tiers to DB', e)
      throw e
    } finally {
      isPending.value = false
    }
  }

  const getAdjustmentForTier = (tierName: string | null | undefined): number => {
    if (!tierName) return 0
    
    const normalizedId = tierName.trim().toLowerCase()
    
    // 1. Try to find exact match (case-insensitive)
    const found = tiers.value.find(t => t.name.trim().toLowerCase() === normalizedId)
    if (found) {
      console.log(`[Pricing] Found exact match for tier "${tierName}": ${found.percent}%`)
      return found.percent
    }

    // 2. Try a more flexible match (sub-string)
    const flexibleMatch = tiers.value.find(t => {
      const configName = t.name.trim().toLowerCase()
      return normalizedId.includes(configName) || configName.includes(normalizedId)
    })
    
    if (flexibleMatch) {
      console.log(`[Pricing] Found flexible match for tier "${tierName}" via "${flexibleMatch.name}": ${flexibleMatch.percent}%`)
      return flexibleMatch.percent
    }

    console.log(`[Pricing] No matching configuration found for tier: "${tierName}"`)
    return 0
  }

  const calculateAdjustedPrice = (basePrice: number, tierName: string | null | undefined): number => {
    const percent = getAdjustmentForTier(tierName)
    if (percent === 0) return basePrice
    
    // Calculate as a DISCOUNT (subtraction)
    // Formula: Price * (1 - percent/100)
    const adjusted = basePrice * (1 - percent / 100)
    return Math.round(adjusted / 1000) * 1000
  }

  // Cleanup on composition
  return {
    tiers,
    loadTiers,
    saveTiers,
    isPending,
    getAdjustmentForTier,
    calculateAdjustedPrice
  }
}
