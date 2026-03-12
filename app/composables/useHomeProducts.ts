import { computed, ref } from 'vue'
import productsData from '~/data/products.json'

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
  specs?: string[]
  fullSpecs?: string[]
}

const inferDiscount = (price: number, oldPrice: number | null): string | null => {
  if (!oldPrice || oldPrice <= price || oldPrice <= 0) return null
  const percent = Math.round(((oldPrice - price) / oldPrice) * 100)
  if (percent <= 0) return null
  return `-${percent}%`
}

const normalizeText = (value: unknown) => {
  return String(value || '')
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

const parseSpecs = (rawValue: unknown): string[] => {
  const raw = String(rawValue || '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
  if (!raw) return []

  return raw
    .split(/\n+/)
    .flatMap((line) => line.split(/\s*;\s*/))
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

export const useHomeProducts = () => {
  const products = computed<HomeProduct[]>(() => {
    return productsData.map((item: any, index: number) => {
      const price = item.price || 0
      const oldPrice = item.oldPrice > 0 ? item.oldPrice : null
      const discountText = inferDiscount(price, oldPrice)
      const title = normalizeText(item.name) || 'Sản phẩm'
      const id = normalizeText(item.id) || `prod_${index + 1}`
      const slugBase = slugifyProduct(title) || `san-pham-${index + 1}`
      const slugTail = slugifyProduct(id).slice(-8)
      const slug = slugTail ? `${slugBase}-${slugTail}` : slugBase
      const fullSpecs = parseSpecs(item.specs)

      return {
        id,
        slug,
        title,
        price,
        oldPrice,
        discount: discountText || null,
        image: item.image || 'https://placehold.co/400x400/eeeeee/999999?text=Kh%C3%B4ng+c%C3%B3+%E1%BA%A3nh',
        category: normalizeText(item.category) || 'Danh mục',
        brand: normalizeText(item.brand) || 'Thương hiệu',
        rating: Number(item.rating) || 5,
        reviews: Number(item.reviews) || 0,
        isNew: Boolean(item.isNew),
        sold: Number(item.reviews) || 0,
        specs: fullSpecs.slice(0, 3),
        fullSpecs
      }
    }).filter((item) => item.price > 0)
  })

  // Mock pending/error for compatibility
  const pending = ref(false)
  const error = ref(null)

  return {
    products,
    pending,
    error
  }
}
