import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)
  const query = getQuery(event)
  
  // The path is passed in the query or body, let's assume it's part of the URL or a header
  // For simplicity, let's expect a 'path' query param
  // Strip internal 'path' param and merge with config token
  const { path: queryPath, ...restQuery } = query
  const forwardQuery = { 
    ...restQuery, 
    token: restQuery.token || config.public.abahaToken 
  }

  const cleanPath = (queryPath as string).startsWith('/') ? (queryPath as string).slice(1) : queryPath
  const targetUrl = `${config.public.abahaApiBaseUrl}${cleanPath}`

  console.log('[Abaha Proxy] Forwarding to:', targetUrl)
  console.log('[Abaha Proxy] Final Query Params:', forwardQuery)
  console.log('[Abaha Proxy] Incoming Body:', body)

  const fetchOptions: any = {
    method: 'POST',
    query: forwardQuery,
    headers: {}
  }

  // If there's a body, convert it to url-encoded format for Abaha compatibility
  if (body && Object.keys(body).length > 0) {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(body)) {
      params.append(key, String(value))
    }
    fetchOptions.body = params.toString()
    fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded'
  }

  try {
    const response = await $fetch(targetUrl, fetchOptions)
    return response
  } catch (error: any) {
    console.error('[Abaha Proxy] Forwarding error:', error.data || error.message)
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.data?.message || 'Error forwarding request to Abaha'
    })
  }
})
