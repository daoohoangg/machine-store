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

export const useHomeProducts = () => {
  const { request } = useAbahaApi()

  const { data: products, pending, error, refresh } = useAsyncData<HomeProduct[]>('home-products', async () => {
    try {
      const response = await request<any>('product/index', {
        method: 'POST',
        body: {
          limit: 20,
          page: 1
        }
      })

      const rawProducts = response?.data?.products || response?.products || (Array.isArray(response?.data) ? response.data : [])
      return rawProducts.map((item: any): HomeProduct => {
        const price = Number(item.price) || 0
        const oldPrice = Number(item.discount) > price ? Number(item.discount) : null
        const discountText = inferDiscount(price, oldPrice)
        
        // Extract images
        const gallery = (item.images || []).map((img: any) => img.src).filter(Boolean)
        const mainImage = item.image || gallery[0] || 'https://placehold.co/400x400/eeeeee/999999?text=No+Image'

        // Extract specs from content
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
          category: 'Sản phẩm',
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
      return [] as HomeProduct[]
    }
  }, {
    default: () => [] as HomeProduct[]
  })

  return {
    products,
    pending,
    error,
    refresh
  }
}
