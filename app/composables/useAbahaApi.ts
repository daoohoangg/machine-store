export const useAbahaApi = () => {
  const config = useRuntimeConfig()

  const request = <T>(path: string, options: any = {}) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    
    // If we're on the client, use our server-side proxy
    if (import.meta.client || (typeof window !== 'undefined')) {
      return $fetch<T>('/api/abaha-proxy', {
        ...options,
        method: 'POST',
        body: options.body || {},
        query: { 
          path: cleanPath,
          token: '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA',
          ...options.query 
        }
      })
    }

    // SSR path (original logic)
    const queryParams = {
      token: config.public.abahaToken || '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA',
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
