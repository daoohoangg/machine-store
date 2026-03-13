export const useAbahaApi = () => {
  const config = useRuntimeConfig()

  const request = <T>(path: string, options: any = {}) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    
    // If we're on the client, use our server-side proxy
    if (import.meta.client || (typeof window !== 'undefined')) {
      console.log('Client-side request через proxy:', cleanPath)
      return $fetch<T>('/api/abaha-proxy', {
        ...options,
        method: 'POST',
        body: options.body || {},
        query: { 
          path: cleanPath, 
          ...options.query 
        }
      })
    }

    // SSR path (original logic)
    const queryParams = {
      token: config.public.abahaToken,
      ...options.query
    }

    return $fetch<T>(cleanPath, {
      baseURL: config.public.abahaApiBaseUrl,
      ...options,
      query: queryParams
    })
  }

  return {
    request
  }
}
