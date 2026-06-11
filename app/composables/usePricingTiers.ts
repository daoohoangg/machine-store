import { computed } from 'vue'
import { useAdminAuth } from './useAdminAuth'
import { useMembershipPrices } from './useMembershipPrices'

/**
 * Three-tier pricing system:
 * 1. Guest (not logged in): Show list price only
 * 2. Member (logged in, regular user): Show discount price (strikethrough list price)
 * 3. Reseller (logged in, agency account): Show further reduced price based on tier
 */
export const usePricingTiers = () => {
  const { isUser, isAdmin, isAgencyAccount, userTier } = useAdminAuth()
  const { calculateAdjustedPrice } = useMembershipPrices()

  /**
   * Determine the current user's pricing tier
   * Returns: 'guest' | 'member' | 'reseller'
   */
  const currentPricingTier = computed(() => {
    const isLoggedIn = isUser.value || isAdmin.value
    if (!isLoggedIn) return 'guest'
    if (isAgencyAccount.value) return 'reseller'
    return 'member'
  })

  /**
   * Get the appropriate price to display for a product
   * 
   * Input prices from API:
   * - apiPrice (price field): List price shown to guests
   * - apiDiscount (discount field): Member/NPP price (base for resellers)
   * 
   * Rules:
   * - Guest: Show apiPrice only
   * - Member: Show apiDiscount (if available, else apiPrice)
   * - Reseller: Show apiDiscount with tier discount applied
   */
  const getPriceForDisplay = (apiPrice: number, apiDiscount?: number | null): number => {
    const tier = currentPricingTier.value
    const displayPrice = (apiDiscount && apiDiscount > 0) ? apiDiscount : apiPrice

    if (tier === 'guest') {
      // Guests see full list price
      return apiPrice
    }

    if (tier === 'member') {
      // Members see discount price (or list if no discount)
      return displayPrice
    }

    // Reseller: apply tier-based discount to the base price
    return calculateAdjustedPrice(displayPrice, userTier.value)
  }

  /**
   * Get the original/strikethrough price
   * 
   * Rules:
   * - Guest: Do not show strikethrough (no discount visible)
   * - Member: Show strikethrough if apiDiscount less than apiPrice
   * - Reseller: Show strikethrough of the member price if tier discount applies
   */
  const getOriginalPrice = (apiPrice: number, apiDiscount?: number | null): number | null => {
    const tier = currentPricingTier.value

    if (tier === 'guest') {
      return null
    }

    const memberPrice = (apiDiscount && apiDiscount > 0) ? apiDiscount : apiPrice

    if (tier === 'member') {
      // Show strikethrough only if there is a discount
      if (memberPrice < apiPrice && memberPrice > 0) {
        return apiPrice
      }
      return null
    }

    // Reseller: show member price as strikethrough if tier creates further discount
    const resellerPrice = calculateAdjustedPrice(memberPrice, userTier.value)
    if (resellerPrice < memberPrice && resellerPrice > 0) {
      return memberPrice
    }
    return null
  }

  /**
   * Determine if prices should be shown at all
   * Guests see only list price, members/resellers see discount prices
   */
  const shouldShowPricing = computed(() => {
    return true
  })

  /**
   * Get discount percentage between two prices
   */
  const calculateDiscountPercent = (currentPrice: number, originalPrice: number): number => {
    if (!originalPrice || originalPrice <= 0) return 0
    const percent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    return Math.max(0, percent)
  }

  return {
    currentPricingTier,
    getPriceForDisplay,
    getOriginalPrice,
    shouldShowPricing,
    calculateDiscountPercent
  }
}
