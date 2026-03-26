import { useState } from '#imports'
import { useAbahaApi } from './useAbahaApi'

export interface ProductGroup {
  id: number
  parent_id: number
  slug: string
  name: string
  image: string
  status: number
  type: number
  show_home: string
  ordering: number
  display_type: string
  delete_flag: number
  description: string
}

export const useGroups = () => {
  const { request } = useAbahaApi()
  const groups = useState<ProductGroup[]>('abaha-groups-list', () => [])
  const isLoading = useState('abaha-groups-loading', () => false)
  const error = useState<any>('abaha-groups-error', () => null)

  const fetchGroups = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await request<{ status: number; message: string; data: { groups: ProductGroup[] } }>('group/index')
      if (response.status === 200 && response.data?.groups) {
        groups.value = response.data.groups.filter(g => g.delete_flag === 0 && g.status === 1)
      }
    } catch (err) {
      error.value = err
      console.error('Failed to fetch groups:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    groups,
    isLoading,
    error,
    fetchGroups
  }
}
