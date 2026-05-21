import { useState } from '#imports'

export interface WholesaleTier {
  min_quantity: number
  discount_percent: number
}

export interface WholesalePriceRow {
  label: string        // e.g. "1 - 9", "10 - 20", "≥ 21"
  minQty: number
  maxQty: number | null  // null = unlimited
  discount: number     // percent
  unitPrice: number    // calculated
}

const defaultWholesaleTiers: WholesaleTier[] = []

export const useWholesalePricing = () => {
  const tiers = useState<WholesaleTier[]>('wholesale-tiers', () => [...defaultWholesaleTiers])
  const isLoaded = useState('wholesale-tiers-loaded', () => false)
  const isPending = useState('wholesale-tiers-pending', () => false)

  const loadWholesaleTiers = async () => {
    if (isLoaded.value) return
    isPending.value = true
    try {
      const response: any = await $fetch('/api/admin/wholesale-tiers')
      if (response && response.success && Array.isArray(response.data)) {
        tiers.value = response.data.map((t: any) => ({
          min_quantity: Number(t.min_quantity),
          discount_percent: Number(t.discount_percent)
        }))
      }
    } catch (e) {
      console.error('Failed to load wholesale tiers from DB', e)
    } finally {
      isLoaded.value = true
      isPending.value = false
    }
  }

  // Auto-load on client
  if (import.meta.client && !isLoaded.value && !isPending.value) {
    loadWholesaleTiers()
  }

  const saveWholesaleTiers = async (newTiers: WholesaleTier[]) => {
    isPending.value = true
    try {
      const response: any = await $fetch('/api/admin/wholesale-tiers', {
        method: 'POST',
        body: { tiers: newTiers }
      })
      if (response && response.success) {
        tiers.value = [...newTiers]
      }
    } catch (e) {
      console.error('Failed to save wholesale tiers to DB', e)
      throw e
    } finally {
      isPending.value = false
    }
  }

  /**
   * Sorted tiers by min_quantity ascending
   */
  const sortedTiers = computed(() => {
    return [...tiers.value].sort((a, b) => a.min_quantity - b.min_quantity)
  })

  /**
   * Get the discount percent for a given quantity
   * Returns the highest tier the quantity qualifies for
   */
  const getWholesaleDiscount = (quantity: number): number => {
    const sorted = [...tiers.value].sort((a, b) => b.min_quantity - a.min_quantity)
    for (const tier of sorted) {
      if (quantity >= tier.min_quantity) {
        return tier.discount_percent
      }
    }
    return 0
  }

  /**
   * Calculate wholesale unit price
   */
  const calculateWholesalePrice = (basePrice: number, quantity: number): number => {
    const discount = getWholesaleDiscount(quantity)
    if (discount === 0) return basePrice
    const adjusted = basePrice * (1 - discount / 100)
    return Math.round(adjusted / 100) * 100 // round to nearest 100đ
  }

  /**
   * Generate the wholesale price table for display on product page
   * Returns array of rows with quantity range labels and unit prices
   */
  const getWholesalePriceTable = (basePrice: number): WholesalePriceRow[] => {
    const sorted = sortedTiers.value
    if (sorted.length === 0) return []

    const rows: WholesalePriceRow[] = []

    // First row: 1 to (first tier - 1) at base price
    if (sorted[0].min_quantity > 1) {
      rows.push({
        label: `1 - ${sorted[0].min_quantity - 1}`,
        minQty: 1,
        maxQty: sorted[0].min_quantity - 1,
        discount: 0,
        unitPrice: basePrice
      })
    }

    // Middle rows
    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i]
      const next = sorted[i + 1]

      const minQty = current.min_quantity
      const maxQty = next ? next.min_quantity - 1 : null
      const label = maxQty ? `${minQty} - ${maxQty}` : `≥ ${minQty}`

      const adjusted = basePrice * (1 - current.discount_percent / 100)
      const unitPrice = Math.round(adjusted / 100) * 100

      rows.push({
        label,
        minQty,
        maxQty,
        discount: current.discount_percent,
        unitPrice
      })
    }

    return rows
  }

  return {
    tiers,
    sortedTiers,
    isLoaded,
    isPending,
    loadWholesaleTiers,
    saveWholesaleTiers,
    getWholesaleDiscount,
    calculateWholesalePrice,
    getWholesalePriceTable
  }
}
