import { useState } from '#imports'

export interface TierAdjustment {
  name: string
  percent: number
}

// These are the tiers from the image provided by the user
const defaultTiers: TierAdjustment[] = [
  { name: 'Giá NPP + 1%', percent: 1 },
  { name: 'Giá NPP + 2%', percent: 2 },
  { name: 'Giá NPP + 3%', percent: 3 },
  { name: 'đại lý cấp 1, 2 ( Giá NPP )', percent: 0 },
  { name: 'đại lý cấp 3 ( +5% giá NPP )', percent: 5 }
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
    // Try to find exact match
    const found = tiers.value.find(t => t.name === tierName)
    if (found) return found.percent

    // Try a more flexible match if necessary
    const flexibleMatch = tiers.value.find(t => 
      tierName.toLowerCase().includes(t.name.toLowerCase()) || 
      t.name.toLowerCase().includes(tierName.toLowerCase())
    )
    return flexibleMatch ? flexibleMatch.percent : 0
  }

  const calculateAdjustedPrice = (basePrice: number, tierName: string | null | undefined): number => {
    const percent = getAdjustmentForTier(tierName)
    if (percent === 0) return basePrice
    
    // Calculate and round to nearest 1,000 for Vietnamese currency
    const adjusted = basePrice * (1 + percent / 100)
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
