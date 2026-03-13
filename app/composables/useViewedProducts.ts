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
}

export const useViewedProducts = () => {
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
    
    // Remove if already exists to move it to the top
    const filtered = viewedProducts.value.filter(p => p.id !== product.id)
    const newList = [product, ...filtered].slice(0, maxItems)
    
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

  return {
    viewedProducts,
    addViewedProduct,
    lastViewedCategory: computed(() => viewedProducts.value[0]?.categoryId || null)
  }
}
