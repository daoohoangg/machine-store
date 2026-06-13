import { useState } from '#imports'

export interface CategoryVisibility {
  [categoryId: number]: boolean // true = hiển thị, false = ẩn
}

const defaultVisibility: CategoryVisibility = {}

export const useCategoryVisibility = () => {
  const visibility = useState<CategoryVisibility>('category-visibility', () => ({ ...defaultVisibility }))
  const isLoaded = useState('category-visibility-loaded', () => false)
  const isSaving = useState('category-visibility-saving', () => false)

  const fetchVisibility = async () => {
    if (isLoaded.value) return
    try {
      const data = await $fetch<CategoryVisibility>('/api/category-visibility')
      visibility.value = { ...defaultVisibility, ...data }
    } catch (e) {
      console.error('[useCategoryVisibility] fetch error:', e)
    } finally {
      isLoaded.value = true
    }
  }

  const saveVisibility = async (newVal?: Partial<CategoryVisibility>) => {
    if (newVal) {
      visibility.value = { ...visibility.value, ...newVal }
    }
    isSaving.value = true
    try {
      const res = await $fetch<any>('/api/category-visibility', {
        method: 'POST',
        body: visibility.value,
      })
      if (res && res.success === false) {
        throw new Error(res.error || 'Lỗi server')
      }
      return true
    } catch (e) {
      console.error('[useCategoryVisibility] save error:', e)
      throw e
    } finally {
      isSaving.value = false
    }
  }

  const toggleCategory = (categoryId: number) => {
    visibility.value[categoryId] = !visibility.value[categoryId]
  }

  const setVisibility = (categoryId: number, visible: boolean) => {
    visibility.value[categoryId] = visible
  }

  const isCategoryVisible = (categoryId: number) => {
    // Mặc định hiển thị nếu chưa được cấu hình
    return visibility.value[categoryId] !== false
  }

  return {
    visibility,
    isLoaded,
    isSaving,
    fetchVisibility,
    saveVisibility,
    toggleCategory,
    setVisibility,
    isCategoryVisible,
  }
}
