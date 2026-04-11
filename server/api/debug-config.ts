export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  return {
    supabaseUrlVisible: !!config.public.supabaseUrl,
    supabaseKeyVisible: !!config.public.supabaseKey,
    supabaseUrlLength: config.public.supabaseUrl?.length || 0,
    supabaseKeyLength: config.public.supabaseKey?.length || 0,
    // Add some prefix comparison to be sure
    supabaseUrlPrefix: config.public.supabaseUrl?.substring(0, 10),
    supabaseKeyPrefix: config.public.supabaseKey?.substring(0, 5)
  }
})
