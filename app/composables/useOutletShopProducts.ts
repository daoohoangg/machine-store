import { useState } from '#imports'
import type { HomeProduct } from './useHomeProducts'
import { useAdminAuth } from './useAdminAuth'
import { useMembershipPrices } from './useMembershipPrices'
import { normalizeText } from './useHomeProducts'

// Function to safely extract specs from HTML content
const cleanHtml = (html: string | undefined | null) => {
  if (!html) return ''
  const stripTags = html.replace(/<[^>]*>?/gm, '')
  return stripTags.replace(/\s+/g, ' ').trim()
}

const extractSpecs = (html: string | undefined | null): string[] => {
  if (!html) return []
  const blocks = html
    .split(/<br\s*\/?>|<\/p>|<\/li>|<\/div>/i)
    .map(block => cleanHtml(block))
    .filter(text => text.length > 0)

  return blocks
}

const inferDiscount = (price: number, oldPrice: number | null): string | null => {
  if (!oldPrice || oldPrice <= price || oldPrice <= 0) return null
  const percent = Math.round(((oldPrice - price) / oldPrice) * 100)
  if (percent <= 0) return null
  return `-${percent}%`
}

export const useOutletShopProducts = () => {
  const rawProducts = useState<any[]>('outlet-shop-raw', () => [])
  const { userTier, isUser, isAdmin, isAgencyAccount } = useAdminAuth()
  const { calculateAdjustedPrice } = useMembershipPrices()
  const isLoading = useState('outlet-shop-loading', () => false)
  const error = useState<any>('outlet-shop-error', () => null)

  const fetchOutletShopProducts = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await $fetch<any>('/api/outlet-shop/products')

      if (response?.success === false) {
        throw new Error(response?.error || 'Failed to fetch outlet shop products')
      }

      const products = response?.products || []
      if (Array.isArray(products)) {
        rawProducts.value = products.filter(p => typeof p === 'object' && p !== null)
      }
    } catch (err) {
      error.value = err
      console.error('Failed to fetch outlet shop products:', err)
    } finally {
      isLoading.value = false
    }
  }

  const products = computed<HomeProduct[]>(() => {
    const isLoggedIn = isUser.value || isAdmin.value

    return rawProducts.value.map((item: any): HomeProduct => {
      // Map từ raw Abaha data sang HomeProduct format
      const apiPrice    = Number(item.price)    || 0
      const apiDiscount = Number(item.discount) || 0

      const rawPriceBase = (isLoggedIn && apiDiscount > 0)
        ? apiDiscount
        : apiPrice

      // Áp dụng chiết khấu cấp bậc đại lý (nếu là tài khoản đại lý)
      const finalPrice = (isLoggedIn && isAgencyAccount.value)
        ? calculateAdjustedPrice(rawPriceBase, userTier.value)
        : rawPriceBase

      const discountText = inferDiscount(finalPrice, rawPriceBase)

      const gallery = (item.images || []).map((img: any) => img.src || img).filter(Boolean)
      const mainImage = item.image || gallery[0] || 'https://placehold.co/400x400/eeeeee/999999?text=No+Image'

      const cleanedContent = cleanHtml(item.content)
      const specs = cleanedContent.split('. ').slice(0, 3).filter(Boolean)
      const detailedSpecs = extractSpecs(item.content)

      return {
        id: String(item.id),
        productCode: item.product_code || item.code || String(item.id),
        slug: item.slug || `product-${item.id}`,
        title: item.name || item.title || 'Sản phẩm',
        price: finalPrice,
        rawPrice: apiPrice,
        oldPrice: null, // Component ProductCard tự tính
        discount: discountText,
        image: mainImage,
        images: gallery.length ? gallery : [mainImage],
        brand: item.brand || 'No Brand',
        category: item.category_name || item.category || 'Sản phẩm',
        categoryId: item.category_id || item.cat_id || null,
        rating: Number(item.rate) || 5,
        reviews: Number(item.comment_count) || 0,
        isNew: false,
        sold: Number(item.sales) || 0,
        specs: specs,
        fullSpecs: detailedSpecs.length > 0 ? detailedSpecs : [cleanedContent],
        originalPrice: apiPrice,
        originalDiscount: apiDiscount,

        // Preserve any other raw data if components need it
        rawItemData: item
      } as unknown as HomeProduct
    })
  })

  return {
    products,
    rawProducts, // rawProducts giờ đây chứa 100% nguyên bản cấu trúc Abaha
    isLoading,
    error,
    fetchOutletShopProducts
  }
}
