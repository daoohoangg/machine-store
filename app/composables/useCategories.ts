import { ref } from 'vue'
import { useAbahaApi } from './useAbahaApi'

export interface Category {
  id: number
  parent_id: number
  name: string
  slug: string
  image: string
  banner: string
  status: number
  ordering: number
  delete_flag: number
  children?: Category[]
}

export const useCategories = () => {
  const { request } = useAbahaApi()
  const categories = useState<Category[]>('abaha-categories-list', () => [])
  const isLoading = useState('abaha-categories-loading', () => false)
  const error = useState<any>('abaha-categories-error', () => null)

  const fetchCategories = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await request<{ status: number; message: string; data: { categories: Category[] } }>('category/index')
      if (response.status === 200) {
        const allCategories = response.data.categories.filter(c => c.delete_flag === 0)
        
        // Build hierarchy
        const categoryMap = new Map<number, Category>()
        allCategories.forEach(cat => {
          categoryMap.set(cat.id, { ...cat, children: [] })
        })

        const rootCategories: Category[] = []
        allCategories.forEach(cat => {
          const mappedCat = categoryMap.get(cat.id)!
          if (cat.parent_id === 0) {
            rootCategories.push(mappedCat)
          } else {
            const parent = categoryMap.get(cat.parent_id)
            if (parent) {
              parent.children?.push(mappedCat)
            } else {
              // Fallback: treat as root if parent not found
              rootCategories.push(mappedCat)
            }
          }
        })

        // Sort by ordering
        const sortByOrdering = (a: Category, b: Category) => a.ordering - b.ordering
        rootCategories.sort(sortByOrdering)
        rootCategories.forEach(cat => cat.children?.sort(sortByOrdering))

        categories.value = rootCategories
      }
    } catch (err) {
      error.value = err
      console.error('Failed to fetch categories:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    categories,
    isLoading,
    error,
    fetchCategories
  }
}
