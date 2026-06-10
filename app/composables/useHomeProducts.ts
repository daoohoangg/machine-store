import { useAbahaApi } from './useAbahaApi'
import { useAdminAuth } from './useAdminAuth'
import { useMembershipPrices } from './useMembershipPrices'

export interface HomeProduct {
  id: string
  productCode?: string
  slug: string
  title: string
  price: number        // giá gốc từ API (chưa áp dụng membership)
  rawPrice: number     // alias của price gốc, dùng cho các component tính lại
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
  originalPrice?: number
  originalDiscount?: number
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

export const normalizeText = (text: string) => {
  if (!text) return ''
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
}

export const slugifyProduct = (value: string) => {
  const normalized = normalizeText(value)
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
  group_id?: number | string | null;
  ids?: string[];
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
  const { data: rawProductsData, pending, error, refresh } = useAsyncData(() => fetchKey.value, async () => {
    const val = toValue(optionsOrCategoryIdMaybe)
    let filters: FetchOptions = {}
    
    if (typeof val === 'object' && val !== null) {
      filters = { ...val }
    } else {
      filters.categoryId = val as any
    }
    
    // If it's a parent category, we fetch for its children too if CRM doesn't support recursive
    const expandedIds: number[] = []
    if (filters.categoryId) {
      const { categories, fetchCategories } = useCategories()
      if (!categories.value || categories.value.length === 0) {
        await fetchCategories()
      }

      let targetCategory: any = null
      const findCategory = (cats: any[]) => {
        for (const c of cats) {
          if (c.id === Number(filters.categoryId)) { targetCategory = c; return true; }
          if (c.children && findCategory(c.children)) return true;
        }
        return false;
      }
      if (categories.value) findCategory(categories.value)
      if (targetCategory) {
        const gatherAllDescendants = (cat: any) => {
          expandedIds.push(cat.id)
          if (cat.children) {
            cat.children.forEach((child: any) => gatherAllDescendants(child))
          }
        }
        gatherAllDescendants(targetCategory)
      }
    }

    const promises = []
    const uniqueIds = [...new Set(expandedIds)].slice(0, 25) // Increased limit to 25 parallel IDs
    
    if (uniqueIds.length > 0) {
      // Parallel fetch for each specific category ID found
      for (const cid of uniqueIds) {
        promises.push(fetchCoreItems({ ...filters, categoryId: cid, page: 1, limit: 100 }))
      }
      // If we have few subcategories, fetch a second page for each
      if (uniqueIds.length < 5) {
        for (const cid of uniqueIds) {
          promises.push(fetchCoreItems({ ...filters, categoryId: cid, page: 2, limit: 100 }))
        }
      }
    } else {
      // If searching, fetch more pages to ensure better coverage (10 pages = 1000 items)
      const pagesToFetch = filters.search ? 10 : 8
      for (let i = 1; i <= pagesToFetch; i++) {
        promises.push(fetchCoreItems({ ...filters, page: i, limit: 100 }))
      }
    }

    const results = await Promise.all(promises)
    let allProducts = results.flat()
    
    // Robust fallback: if a category was requested but results are scarce, 
    // fetch up to 10 pages of global products and let the client filter them.
    if (filters.categoryId && allProducts.length < 20 && !filters.search) {
      console.log('[useHomeProducts] Direct fetch yields low results, fetching global pool fallback...')
      const fallbackPromises = []
      for (let i = 1; i <= 10; i++) {
        fallbackPromises.push(fetchCoreItems({ ...filters, categoryId: null, page: i, limit: 100 }))
      }
      const fallbackData = await Promise.all(fallbackPromises)
      allProducts = [...allProducts, ...fallbackData.flat()]
    }
    const uniqueProducts = Array.from(new Map(allProducts.map((item: any) => [item.id, item])).values())
    
    // Client-side filter by IDs if provided
    if (filters.ids && filters.ids.length > 0) {
      const idSet = new Set(filters.ids.map(String))
      return uniqueProducts.filter((p: any) => idSet.has(String(p.id)))
    }
    
    console.log(`[useHomeProducts] Fetched 10 pages. Total flat: ${allProducts.length}, Unique: ${uniqueProducts.length}`)
    
    return uniqueProducts // These are raw API products
  }, {
    lazy: false,
    watch: [fetchKey], // Re-fetch when the key (and thus categoryId) changes
    getCachedData(key) {
      // Use Nuxt's built-in payload cache to prevent redundant API calls on client navigation
      return nuxtApp.payload.data[key] || nuxtApp.static?.data?.[key]
    },
    default: () => [] as any[]
  })

  // Load auth and pricing context
  const { userTier, isUser, isAdmin, isAgencyAccount } = useAdminAuth()
  const { tiers, calculateAdjustedPrice } = useMembershipPrices()

  // Manual loading state for loadMore
  const loadingMore = ref(false)

  // Reactive mapping of products based on current tier and loaded tiers
  const products = computed(() => {
    const rawList = rawProductsData.value || []
    // Truy cập `tiers.value` để computed tự re-run khi tiers load xong từ Supabase
    void tiers.value
    return rawList.map((item: any): HomeProduct => {
      // item.discount từ API = giá niêm yết gốc (Giá NPP / list price)
      // item.price từ API   = giá bán lẻ thông thường (giá hiển thị khi chưa đăng nhập)
      const apiDiscount = Number(item.discount) || 0
      const apiPrice    = Number(item.price)    || 0

      // Logic giá theo trạng thái đăng nhập và loại tài khoản:
      // - Chưa đăng nhập       : dùng apiPrice (giá bán lẻ)
      // - Đăng nhập - thường   : dùng apiPrice (giá bán lẻ)
      // - Đăng nhập - đại lý   : dùng apiDiscount (giá NPP gốc) rồi áp dụng tier chiết khấu
      const isLoggedIn = isUser.value || isAdmin.value
      // Chỉ đại lý mới nhìn thấy giá NPP (discount từ API)
      const rawPriceBase = (isLoggedIn && isAgencyAccount.value && apiDiscount > 0)
        ? apiDiscount
        : apiPrice

      // Apply membership tier adjustment (chỉ áp dụng cho đại lý)
      const price = (isLoggedIn && isAgencyAccount.value)
        ? calculateAdjustedPrice(rawPriceBase, userTier.value)
        : rawPriceBase
      
      const discountText = inferDiscount(price, rawPriceBase)
      
      const gallery = (item.images || []).map((img: any) => img.src).filter(Boolean)
      const mainImage = item.image || gallery[0] || 'https://placehold.co/400x400/eeeeee/999999?text=No+Image'

      const cleanedContent = cleanHtml(item.content)
      const specs = cleanedContent.split('. ').slice(0, 3).filter(Boolean)
      const detailedSpecs = extractSpecs(item.content)

      return {
        id: String(item.id),
        productCode: item.product_code || item.code || String(item.id),
        slug: item.slug || `product-${item.id}`,
        title: item.name || 'Sản phẩm',
        price: price,    // giá gốc (item.discount từ API) để ProductCard tính membership
        rawPrice: rawPriceBase, // alias rõ ràng
        oldPrice: null,         // không cần - ProductCard tự tính từ rawPriceBase vs membershipPrice
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
        originalDiscount: apiDiscount
      }
    }).filter((item: HomeProduct) => {
      return item.image && !item.image.includes('placehold') && !item.image.includes('noimage')
    })
  })

// Removal of old non-reactive fetchItems mapping logic as it is now handled by the computed products property.

  async function fetchCoreItems(f: any) {
    try {
      const page = f.page || 1
      const limit = f.limit || 100
      const body: any = {}
      const queryParams: any = { limit, page }
      
      if (f.search) {
        queryParams.search = f.search
        queryParams.keyword = f.search // Reliability: some Abaha versions use keyword
        body.search = f.search
        body.keyword = f.search
      }
      if (f.categoryId) {
        body.category_id = Number(f.categoryId)
        body.cat_id = Number(f.categoryId)
      }
      if (f.group_id) {
        body.group_id = f.group_id
        queryParams.group_id = f.group_id
      }

      const response = await request<any>('product/index', { method: 'POST', body, query: queryParams })
      return response?.data?.products || response?.products || (Array.isArray(response?.data) ? response.data : [])
    } catch (err) {
      return []
    }
  }

  return {
    products,
    pending: computed(() => pending.value || loadingMore.value),
    error,
    refresh,
    loadMore: async (pageToLoad: number) => {
      // ... loadMore implementation simplified ...
      const res = await fetchCoreItems({ ...toValue(optionsOrCategoryIdMaybe) as any, page: pageToLoad })
      if (res.length > 0 && rawProductsData.value) {
        rawProductsData.value = [...rawProductsData.value, ...res]
      }
    }
  }
}


