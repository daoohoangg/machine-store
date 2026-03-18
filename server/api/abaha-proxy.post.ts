import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const query = getQuery(event)
  
  // The path is passed in the query or body, let's assume it's part of the URL or a header
  // For simplicity, let's expect a 'path' query param
  const path = query.path as string
  if (!path) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing path parameter'
    })
  }

  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  const forwardQuery: Record<string, any> = { ...query, token: config.public.abahaToken }
  delete forwardQuery.path

  try {
    const response = await $fetch(`${config.public.abahaApiBaseUrl}${cleanPath}`, {
      method: 'POST',
      query: forwardQuery,
      body,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.message || 'Proxy error'
    })
  }
})
