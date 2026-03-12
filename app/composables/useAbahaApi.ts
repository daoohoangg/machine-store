export const useAbahaApi = () => {
  const config = useRuntimeConfig()

  const request = <T>(path: string, options: any = {}) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    
    // Ensure query object exists
    const query = {
      ...options.query,
      token: config.public.abahaToken
    }

    return $fetch<T>(cleanPath, {
      baseURL: config.public.abahaApiBaseUrl,
      ...options,
      query
    })
  }

  return {
    request
  }
}
