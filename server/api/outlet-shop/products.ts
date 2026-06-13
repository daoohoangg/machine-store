import { defineEventHandler } from 'h3'
import { useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabase = useSupabase()

    // 1. Get product data from manual_groups where group_key = 'outlet-shop'
    const { data: manualGroupsRows, error: fetchError } = await supabase
      .from('manual_groups')
      .select('product_data')
      .eq('group_key', 'outlet-shop')

    if (fetchError) {
      console.error('[outlet-shop/products] Supabase fetch error:', fetchError)
      return { success: false, error: fetchError.message, products: [] }
    }

    if (!manualGroupsRows || manualGroupsRows.length === 0) {
      return { success: true, products: [], total: 0 }
    }

    // Extract product codes from saved data
    const productCodes = manualGroupsRows
      .map(row => row.product_data?.productCode || row.product_data?.product_code)
      .filter(Boolean)

    console.log(`[outlet-shop/products] Found ${productCodes.length} product codes`)

    // 2. Fetch full product details from Zalo Academy CRM using product codes
    try {
      const TOKEN = '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA'
      const ZALO_ACADEMY_BASE_URL = 'https://publicapi.zalo.academy/'

      const allProducts: any[] = []

      // Fetch product info for each product code
      for (const productCode of productCodes) {
        try {
          const targetUrl = `${ZALO_ACADEMY_BASE_URL}product/info`

          console.log(`[outlet-shop/products] Fetching product info for code: ${productCode}`)

          const body = new URLSearchParams()
          body.append('token', TOKEN)
          body.append('product_code', String(productCode))

          const response = await $fetch<any>(targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
          })

          // Get product data from response (nằm trong data.product)
          const productData = response?.data?.product || response?.product
          if (productData && typeof productData === 'object' && productData.id) {
            allProducts.push(productData)
          }
        } catch (err: any) {
          console.error(`[outlet-shop/products] Error fetching product ${productCode}:`, err.message)
          // Continue with next product if one fails
        }
      }

      console.log(`[outlet-shop/products] Successfully fetched ${allProducts.length} products from Zalo Academy`)

      return {
        success: true,
        products: allProducts,
        total: allProducts.length
      }
    } catch (abahaError: any) {
      console.error('[outlet-shop/products] Zalo Academy API error:', abahaError)
      return {
        success: false,
        error: abahaError.message || 'Failed to fetch from Zalo Academy CRM',
        products: []
      }
    }
  } catch (globalError: any) {
    console.error('[outlet-shop/products] Global error:', globalError)
    return {
      success: false,
      error: globalError.message || 'Server error',
      products: []
    }
  }
})
