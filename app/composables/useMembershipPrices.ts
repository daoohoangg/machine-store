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

  // Normalize: strip dấu tiếng Việt, thống nhất lí/lý, đ/d, lowercase
  const normalizeForMatch = (s: string): string => {
    return s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // strip combining diacritics
      .replace(/[đĐ]/g, 'd')
      .toLowerCase()
      .replace(/\bli\b/g, 'ly')        // thống nhất "lí" → "ly" (đại lí = đại lý)
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Trích xuất tất cả số từ tên tier, vd: "Cấp 1, 2" → [1, 2]
  const extractNumbers = (s: string): number[] => {
    return (s.match(/\d+/g) || []).map(Number)
  }

  const getAdjustmentForTier = (tierName: string | null | undefined): number => {
    if (!tierName) return 0

    const raw = tierName.trim()

    // 1. Exact match (case-insensitive)
    const exactMatch = tiers.value.find(t => t.name.trim().toLowerCase() === raw.toLowerCase())
    if (exactMatch) {
      console.log(`[Pricing] Exact match "${raw}": ${exactMatch.percent}%`)
      return exactMatch.percent
    }

    // 2. Substring match (case-insensitive)
    const subMatch = tiers.value.find(t => {
      const a = raw.toLowerCase()
      const b = t.name.trim().toLowerCase()
      return a.includes(b) || b.includes(a)
    })
    if (subMatch) {
      console.log(`[Pricing] Substring match "${raw}" → "${subMatch.name}": ${subMatch.percent}%`)
      return subMatch.percent
    }

    // 3. Normalize accent + unify lí/lý, then substring match
    const normId = normalizeForMatch(raw)
    const normMatch = tiers.value.find(t => {
      const normConfig = normalizeForMatch(t.name)
      return normId.includes(normConfig) || normConfig.includes(normId)
    })
    if (normMatch) {
      console.log(`[Pricing] Normalized match "${raw}" → "${normMatch.name}": ${normMatch.percent}%`)
      return normMatch.percent
    }

    // 4. Fallback: so khớp theo số cấp trích xuất
    //    vd: "ĐẠI LÍ CẤP 2" → [2], "Đại lý cấp 1, 2 (Mặc định)" → [1,2] → giao nhau → match
    const inputNumbers = extractNumbers(raw)
    if (inputNumbers.length > 0) {
      const numberMatch = tiers.value.find(t => {
        const configNumbers = extractNumbers(t.name)
        return inputNumbers.some(n => configNumbers.includes(n))
      })
      if (numberMatch) {
        console.log(`[Pricing] Number-based match "${raw}" (${inputNumbers}) → "${numberMatch.name}": ${numberMatch.percent}%`)
        return numberMatch.percent
      }
    }

    console.log(`[Pricing] No matching configuration found for tier: "${raw}"`)
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
