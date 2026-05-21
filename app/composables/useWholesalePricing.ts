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
  // Global tiers
  const tiers = useState<WholesaleTier[]>('wholesale-tiers', () => [...defaultWholesaleTiers])
  const isLoaded = useState('wholesale-tiers-loaded', () => false)
  const isPending = useState('wholesale-tiers-pending', () => false)

  // Product-specific tiers cache
  const productTiersMap = useState<Record<string, WholesaleTier[]>>('product-wholesale-tiers', () => ({}))
  const loadedProductIds = useState<Record<string, boolean>>('loaded-product-wholesale-ids', () => ({}))

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

  // Auto-load global tiers on client
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

  // ── Product Specific Tiers Functions ──

  const loadProductWholesaleTiers = async (productId: string) => {
    if (!productId) return
    if (loadedProductIds.value[productId]) return
    try {
      const response: any = await $fetch(`/api/admin/product-wholesale-tiers?productId=${productId}`)
      if (response && response.success && Array.isArray(response.data)) {
        productTiersMap.value[productId] = response.data.map((t: any) => ({
          min_quantity: Number(t.min_quantity),
          discount_percent: Number(t.discount_percent)
        }))
      }
    } catch (e) {
      console.error(`Failed to load wholesale tiers for product ${productId}`, e)
    } finally {
      loadedProductIds.value[productId] = true
    }
  }

  const loadMultipleProductsWholesaleTiers = async (productIds: string[]) => {
    if (!productIds || productIds.length === 0) return
    const toFetch = productIds.filter(id => !loadedProductIds.value[id])
    if (toFetch.length === 0) return

    try {
      const response: any = await $fetch(`/api/admin/product-wholesale-tiers?productIds=${toFetch.join(',')}`)
      if (response && response.success && response.data) {
        Object.keys(response.data).forEach(id => {
          productTiersMap.value[id] = response.data[id].map((t: any) => ({
            min_quantity: Number(t.min_quantity),
            discount_percent: Number(t.discount_percent)
          }))
          loadedProductIds.value[id] = true
        })
      }
    } catch (e) {
      console.error('Failed to bulk load product wholesale tiers', e)
    }
  }

  const saveProductWholesaleTiers = async (productId: string, newTiers: WholesaleTier[]) => {
    try {
      const response: any = await $fetch('/api/admin/product-wholesale-tiers', {
        method: 'POST',
        body: { productId, tiers: newTiers }
      })
      if (response && response.success) {
        productTiersMap.value[productId] = newTiers.map((t: any) => ({
          min_quantity: Number(t.min_quantity),
          discount_percent: Number(t.discount_percent)
        }))
        loadedProductIds.value[productId] = true
      }
    } catch (e) {
      console.error(`Failed to save wholesale tiers for product ${productId}`, e)
      throw e
    }
  }

  const deleteProductWholesaleTiers = async (productId: string) => {
    try {
      const response: any = await $fetch(`/api/admin/product-wholesale-tiers?productId=${productId}`, {
        method: 'DELETE'
      })
      if (response && response.success) {
        delete productTiersMap.value[productId]
        loadedProductIds.value[productId] = true // Mark as loaded since we know it's empty
      }
    } catch (e) {
      console.error(`Failed to delete wholesale tiers for product ${productId}`, e)
      throw e
    }
  }

  /**
   * Sorted global tiers by min_quantity ascending
   */
  const sortedTiers = computed(() => {
    return [...tiers.value].sort((a, b) => a.min_quantity - b.min_quantity)
  })

  /**
   * Get the discount percent for a given quantity
   * Returns the highest tier the quantity qualifies for
   */
  const getWholesaleDiscount = (quantity: number, productId?: string): number => {
    // 1. Try product-specific tiers first
    if (productId && productTiersMap.value[productId] && productTiersMap.value[productId].length > 0) {
      const sorted = [...productTiersMap.value[productId]].sort((a, b) => b.min_quantity - a.min_quantity)
      for (const tier of sorted) {
        if (quantity >= tier.min_quantity) {
          return tier.discount_percent
        }
      }
      return 0
    }

    // 2. Fallback to global tiers
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
  const calculateWholesalePrice = (basePrice: number, quantity: number, productId?: string): number => {
    const discount = getWholesaleDiscount(quantity, productId)
    if (discount === 0) return basePrice
    const adjusted = basePrice * (1 - discount / 100)
    return Math.round(adjusted / 100) * 100 // round to nearest 100đ
  }

  /**
   * Generate the wholesale price table for display on product page
   * Returns array of rows with quantity range labels and unit prices
   */
  const getWholesalePriceTable = (basePrice: number, productId?: string): WholesalePriceRow[] => {
    let activeTiers = sortedTiers.value
    if (productId && productTiersMap.value[productId] && productTiersMap.value[productId].length > 0) {
      activeTiers = [...productTiersMap.value[productId]].sort((a, b) => a.min_quantity - b.min_quantity)
    }

    if (activeTiers.length === 0) return []

    const rows: WholesalePriceRow[] = []

    // First row: 1 to (first tier - 1) at base price
    if (activeTiers[0].min_quantity > 1) {
      rows.push({
        label: `1 - ${activeTiers[0].min_quantity - 1}`,
        minQty: 1,
        maxQty: activeTiers[0].min_quantity - 1,
        discount: 0,
        unitPrice: basePrice
      })
    }

    // Middle rows
    for (let i = 0; i < activeTiers.length; i++) {
      const current = activeTiers[i]
      const next = activeTiers[i + 1]

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
    productTiersMap,
    loadedProductIds,
    loadWholesaleTiers,
    saveWholesaleTiers,
    loadProductWholesaleTiers,
    loadMultipleProductsWholesaleTiers,
    saveProductWholesaleTiers,
    deleteProductWholesaleTiers,
    getWholesaleDiscount,
    calculateWholesalePrice,
    getWholesalePriceTable
  }
}
