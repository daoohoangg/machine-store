import { ref, onMounted, watch } from 'vue'

export interface ViewedProduct {
  id: string
  slug: string
  title: string
  price: number
  oldPrice: number | null
  image: string
  categoryId: number | string | null
  category: string
  rawPrice?: number
  rawOldPrice?: number | null
}

export const useViewedProducts = () => {
  const { userTier } = useAdminAuth()
  const { calculateAdjustedPrice } = useMembershipPrices()
  const viewedProducts = useState<ViewedProduct[]>('tuanminh-viewed-products-list', () => [])
  const maxItems = 5

  const loadViewedProducts = () => {
    if (!process.client) return
    try {
      const saved = localStorage.getItem('tuanminh_viewed_products_v2')
      if (saved) {
        viewedProducts.value = JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load viewed products:', e)
    }
  }

  const addViewedProduct = (product: ViewedProduct) => {
    if (!product.id) return
    
    // Ensure we store raw prices for recalculation if they aren't provided
    const toStore = {
      ...product,
      rawPrice: product.rawPrice || product.price,
      rawOldPrice: product.rawOldPrice || product.oldPrice
    }
    
    // Remove if already exists to move it to the top
    const filtered = viewedProducts.value.filter(p => p.id !== product.id)
    const newList = [toStore, ...filtered].slice(0, maxItems)
    
    viewedProducts.value = newList
    
    if (process.client) {
      localStorage.setItem('tuanminh_viewed_products_v2', JSON.stringify(newList))
    }
  }

  // Initialize on client
  if (process.client) {
    onMounted(() => {
      if (viewedProducts.value.length === 0) {
        loadViewedProducts()
      }
    })
  }

  const viewedProductsAdjusted = computed(() => {
    return viewedProducts.value.map(p => {
      const base = p.rawPrice || p.price
      const baseOld = p.rawOldPrice || p.oldPrice
      return {
        ...p,
        price: calculateAdjustedPrice(base, userTier.value),
        oldPrice: baseOld ? calculateAdjustedPrice(baseOld, userTier.value) : null
      }
    })
  })

  return {
    viewedProducts: viewedProductsAdjusted,
    addViewedProduct,
    lastViewedCategory: computed(() => viewedProducts.value[0]?.categoryId || null)
  }
}
