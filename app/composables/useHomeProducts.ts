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
          // Flatten child IDs if the category has children
          const { categories, fetchCategories } = useCategories()
          if (!categories.value || categories.value.length === 0) {
            await fetchCategories()
          }
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
          findCategory(categories.value)
          
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
          // Also try in query params for some API versions
          queryParams.cat_id = numericId
          queryParams.category_id = numericId
          
          // Store for the strict filter below
          body._strict_ids = expandedIds
        } else {
          body.category_id = cid
          body.cat_id = cid
          queryParams.cat_id = cid
          body._strict_ids = [cid]
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
            if (body._strict_ids) {
              return body._strict_ids.includes(itemCid) || body._strict_ids.includes(String(item.category_id))
            }
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
