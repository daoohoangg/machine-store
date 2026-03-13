import { useAbahaApi } from './useAbahaApi'

export interface HomeProduct {
  id: string
  slug: string
  title: string
  price: number
  oldPrice: number | null
  discount: string | null
  image: string
  category: string
  categoryId: number | null
  brand: string
  rating: number
  reviews: number
  isNew: boolean
  sold: number
  images?: string[]
  specs?: string[]
  fullSpecs?: string[]
}

const inferDiscount = (price: number, oldPrice: number | null): string | null => {
  if (!oldPrice || oldPrice <= price || oldPrice <= 0) return null
  const percent = Math.round(((oldPrice - price) / oldPrice) * 100)
  if (percent <= 0) return null
  return `-${percent}%`
}

const cleanHtml = (html: string | undefined | null) => {
  if (!html) return ''
  return html
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const slugifyProduct = (value: string) => {
  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()

  return normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

import { toValue, type MaybeRefOrGetter } from 'vue'

export const useHomeProducts = (categoryIdMaybe?: MaybeRefOrGetter<number | string | null | undefined>) => {
  const { request } = useAbahaApi()

  // Use a computed for the key to ensure useAsyncData re-runs when the category changes
  const fetchKey = computed(() => {
    const cid = toValue(categoryIdMaybe)
    return `home-products-fetch-${cid || 'all'}`
  })
  
  // products will contain the data for the current active category
  const { data: products, pending, error, refresh } = useAsyncData(fetchKey.value, async () => {
    return await fetchItems(1, 12, toValue(categoryIdMaybe))
  }, {
    lazy: false,
    watch: [fetchKey], // Re-fetch when the key (and thus categoryId) changes
    default: () => [] as HomeProduct[]
  })

  // Manual loading state for loadMore
  const loadingMore = ref(false)

  async function fetchItems(page: number, limit: number, cid?: number | string | null) {
    try {
      const body: any = { limit: Number(limit) || 12, page: Number(page) || 1 }
      const queryParams: any = {}
      
      if (cid) {
        const numericId = Number(cid)
        if (!isNaN(numericId)) {
          body.category_id = numericId
          body.cat_id = numericId
          body.categories = [numericId]
          // Also try in query params for some API versions
          queryParams.cat_id = numericId
          queryParams.category_id = numericId
        } else {
          body.category_id = cid
          body.cat_id = cid
          queryParams.cat_id = cid
        }
      }

      console.log(`[useHomeProducts] Fetching items for cid: ${cid}, page: ${page}, limit: ${limit}`)
      const response = await request<any>('product/index', {
        method: 'POST',
        body,
        query: queryParams
      })

      const rawProducts = response?.data?.products || response?.products || (Array.isArray(response?.data) ? response.data : [])
      console.log(`[useHomeProducts] API returned ${rawProducts.length} items`)
      
      // Strict client-side filter as safe-guard if the API returns mixed results
      const finalProducts = cid 
        ? rawProducts.filter((item: any) => {
            const itemCid = Number(item.category_id || item.cat_id)
            return itemCid === Number(cid)
          })
        : rawProducts

      return finalProducts.map((item: any): HomeProduct => {
        const price = Number(item.price) || 0
        const oldPrice = Number(item.discount) > price ? Number(item.discount) : null
        const discountText = inferDiscount(price, oldPrice)
        
        const gallery = (item.images || []).map((img: any) => img.src).filter(Boolean)
        const mainImage = item.image || gallery[0] || 'https://placehold.co/400x400/eeeeee/999999?text=No+Image'

        const cleanedContent = cleanHtml(item.content)
        const specs = cleanedContent.split('. ').slice(0, 3).filter(Boolean)

        return {
          id: String(item.id),
          slug: item.slug || `product-${item.id}`,
          title: item.name || 'Sản phẩm',
          price,
          oldPrice,
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
          fullSpecs: [cleanedContent]
        }
      })
    } catch (err) {
      console.error('API Error:', err)
      return []
    }
  }

  const loadMore = async (page: number) => {
    if (loadingMore.value) return
    loadingMore.value = true
    
    const newItems = await fetchItems(page, 20, toValue(categoryIdMaybe))
    if (newItems.length > 0 && products.value) {
      products.value = [...products.value, ...newItems]
    }
    
    loadingMore.value = false
  }

  return {
    products,
    pending: computed(() => pending.value || loadingMore.value),
    error,
    refresh,
    loadMore
  }
}
