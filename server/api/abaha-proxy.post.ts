import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event).catch(() => ({}))
  const query = getQuery(event)
  
  // The path is passed in the query or body
  const { path: queryPath, method: bodyMethod, ...restQuery } = query
  const forwardMethod = (bodyMethod as string) || 'POST'
  
  const forwardQuery: any = { 
    ...restQuery, 
    token: restQuery.token || config.public.abahaToken 
  }

  const cleanPath = (queryPath as string).startsWith('/') ? (queryPath as string).slice(1) : queryPath
  const targetUrl = `${config.public.abahaApiBaseUrl}${cleanPath}`

  console.log(`[Abaha Proxy] Forwarding ${forwardMethod} to:`, targetUrl)
  
  const fetchOptions: any = {
    method: forwardMethod,
    query: forwardQuery,
    headers: {}
  }

  // If there's a body and method is NOT GET, convert it to url-encoded format
  if (forwardMethod !== 'GET' && body && Object.keys(body).length > 0) {
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
