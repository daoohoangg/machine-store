interface ApiRequestOptions extends Omit<Parameters<typeof $fetch>[1], 'baseURL'> {}

export const useApi = () => {
  const config = useRuntimeConfig()

  const request = <T>(path: string, options: ApiRequestOptions = {}) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`

    return $fetch<T>(cleanPath, {
      baseURL: config.public.apiBaseUrl,
      ...options
    })
  }

  return {
    request
  }
}
