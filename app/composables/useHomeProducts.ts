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

const decodeHTMLEntities = (text: string) => {
  const entities: Record<string, string> = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ',
    '&agrave;': 'à', '&aacute;': 'á', '&acirc;': 'â', '&atilde;': 'ã',
    '&egrave;': 'è', '&eacute;': 'é', '&ecirc;': 'ê',
    '&igrave;': 'ì', '&iacute;': 'í',
    '&ograve;': 'ò', '&oacute;': 'ó', '&ocirc;': 'ô', '&otilde;': 'õ',
    '&ugrave;': 'ù', '&uacute;': 'ú',
    '&yacute;': 'ý',
    '&Agrave;': 'À', '&Aacute;': 'Á', '&Acirc;': 'Â', '&Atilde;': 'Ã',
    '&Egrave;': 'È', '&Eacute;': 'É', '&Ecirc;': 'Ê',
    '&Igrave;': 'Ì', '&Iacute;': 'Í',
    '&Ograve;': 'Ò', '&Oacute;': 'Ó', '&Ocirc;': 'Ô', '&Otilde;': 'Õ',
    '&Ugrave;': 'Ù', '&Uacute;': 'Ú',
    '&Yacute;': 'Ý',
    '&deg;': '°'
  }
  return text.replace(/&[#a-zA-Z0-9]+;/g, (match) => entities[match] || match)
}

const cleanHtml = (html: string | undefined | null) => {
  if (!html) return ''
  const stripTags = html.replace(/<[^>]*>?/gm, '')
  const decoded = decodeHTMLEntities(stripTags)
  return decoded.replace(/\s+/g, ' ').trim()
}

const extractSpecs = (html: string | undefined | null): string[] => {
  if (!html) return []
  // Instead of completely stripping HTML, try to keep semantic blocks (p, div, li, br) separate
  const blocks = html
    .split(/<br\s*\/?>|<\/p>|<\/li>|<\/div>/i)
    .map(block => cleanHtml(block))
    .filter(text => text.length > 0)
    
  return blocks
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
import { useCategories } from './useCategories'

export interface FetchOptions {
  categoryId?: number | string | null;
  search?: string;
  price_min?: number;
  price_max?: number;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
}

export const useHomeProducts = (optionsOrCategoryIdMaybe?: MaybeRefOrGetter<FetchOptions | number | string | null | undefined>) => {
  const { request } = useAbahaApi()

  // Use a computed for the key to ensure useAsyncData re-runs when the category changes
  const fetchKey = computed(() => {
    const val = toValue(optionsOrCategoryIdMaybe)
    if (typeof val === 'object' && val !== null) {
      return `home-products-fetch-${JSON.stringify(val)}`
    }
    return `home-products-fetch-${val || 'all'}`
  })
  
  // products will contain the data for the current active category
  const nuxtApp = useNuxtApp()
  const { data: products, pending, error, refresh } = useAsyncData(fetchKey.value, async () => {
    const val = toValue(optionsOrCategoryIdMaybe)
    let filters: FetchOptions = {}
    
    if (typeof val === 'object' && val !== null) {
      filters = { ...val }
    } else {
      filters.categoryId = val
    }
    
    // Fix race condition: Ensure categories are loaded ONCE before triggering 10 parallel requests
    if (filters.categoryId) {
      const { categories, fetchCategories } = useCategories()
      if (!categories.value || categories.value.length === 0) {
        await fetchCategories()
      }
    }
    
    // We found a workaround: Abaha API respects pagination for categories ONLY if
    // page and limit are passed via QUERY STRING, while category_id is in BODY.
    const promises = []
    for (let i = 1; i <= 6; i++) {
        promises.push(fetchItems({ ...filters, page: i, limit: 100 }))
    }
    const results = await Promise.all(promises)
    const allProducts = results.flat()
    const uniqueProducts = Array.from(new Map(allProducts.map(item => [item.id, item])).values())
    
    console.log(`[useHomeProducts] Fetched 10 pages. Total flat: ${allProducts.length}, Unique: ${uniqueProducts.length}`)
    
    return uniqueProducts
  }, {
    lazy: false,
    watch: [fetchKey], // Re-fetch when the key (and thus categoryId) changes
    getCachedData(key) {
      // Use Nuxt's built-in payload cache to prevent redundant API calls on client navigation
      return nuxtApp.payload.data[key] || nuxtApp.static?.data?.[key]
    },
    default: () => [] as HomeProduct[]
  })

  // Manual loading state for loadMore
  const loadingMore = ref(false)

  async function fetchItems(filters: FetchOptions) {
    try {
      const parsedPage = Number(filters.page) || 1
      const parsedLimit = Number(filters.limit) || 20 
      const body: any = {}
      const queryParams: any = { limit: parsedLimit, page: parsedPage }
      
      if (filters.search) queryParams.search = filters.search
      if (filters.price_min) queryParams.price_min = filters.price_min
      if (filters.price_max) queryParams.price_max = filters.price_max
      if (filters.sort) queryParams.sort = filters.sort
      if (filters.order) queryParams.order = filters.order
      
      const cid = filters.categoryId

      if (cid) {
        const numericId = Number(cid)
        if (!isNaN(numericId)) {
          // Flatten child IDs if the category has children
          const { categories } = useCategories()
          let targetCategory: any = null
          
          const findCategory = (cats: any[]) => {
            for (const c of cats) {
              if (c.id === numericId) {
                targetCategory = c
                return true
              }
              if (c.children && findCategory(c.children)) return true
            }
            return false
          }
          if (categories.value) findCategory(categories.value)
          
          const expandedIds = [numericId]
          const gatherChilrenIds = (cat: any) => {
            if (cat && cat.children) {
              cat.children.forEach((child: any) => {
                expandedIds.push(child.id)
                gatherChilrenIds(child)
              })
            }
          }
          gatherChilrenIds(targetCategory)
          
          body.category_id = numericId
          body.cat_id = numericId
          body.categories = expandedIds
        } else {
          body.category_id = cid
          body.cat_id = cid
        }
      }

      console.log(`[useHomeProducts] Fetching items for cid: ${cid}, page: ${parsedPage}, limit: ${parsedLimit}`)
      const response = await request<any>('product/index', {
        method: 'POST',
        body,
        query: queryParams
      })

      const rawProducts = response?.data?.products || response?.products || (Array.isArray(response?.data) ? response.data : [])
      console.log(`[useHomeProducts] API returned ${rawProducts.length} items`)
      
      // Trust the Abaha API filtering entirely instead of performing strict client-side ID checks
      const finalProducts = rawProducts

      return finalProducts.map((item: any): HomeProduct => {
        const price = Number(item.price) || 0
        const oldPrice = Number(item.discount) > price ? Number(item.discount) : null
        const discountText = inferDiscount(price, oldPrice)
        
        const gallery = (item.images || []).map((img: any) => img.src).filter(Boolean)
        const mainImage = item.image || gallery[0] || 'https://placehold.co/400x400/eeeeee/999999?text=No+Image'

        const cleanedContent = cleanHtml(item.content)
        const specs = cleanedContent.split('. ').slice(0, 3).filter(Boolean)
        const detailedSpecs = extractSpecs(item.content)

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
          fullSpecs: detailedSpecs.length > 0 ? detailedSpecs : [cleanedContent]
        }
      }).filter((item: HomeProduct) => {
        // Filter out products with no image or placeholder image
        return item.image && !item.image.includes('placehold') && !item.image.includes('noimage')
      })
    } catch (err) {
      console.error('API Error:', err)
      return []
    }
  }

  const loadMore = async (pageToLoad: number) => {
    if (loadingMore.value) return
    loadingMore.value = true
    
    const val = toValue(optionsOrCategoryIdMaybe)
    let filters: FetchOptions = {}
    if (typeof val === 'object' && val !== null) {
      filters = { ...val }
    } else {
      filters.categoryId = val
    }
    filters.page = pageToLoad
    // If we want multiple pages in one go as user asked, we can use limit: 200.
    // However, for loadMore, we typically just load the next page of 20 or 200 depending on limit.
    // If the base query was heavily limited, we will preserve it or default to 20.
    
    const newItems = await fetchItems(filters)
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
