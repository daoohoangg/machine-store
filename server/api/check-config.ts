export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  return {
    mongodbUriSet: !!config.mongodbUri,
    uriLength: config.mongodbUri?.length || 0,
    maskedUri: config.mongodbUri ? config.mongodbUri.replace(/:([^@]+)@/, ':****@') : 'MISSING'
  }
})
