import { useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const authToken = getCookie(event, 'auth_token')
  const adminToken = getCookie(event, 'admin_token')

  console.log('[Auth Me Debug] Checking tokens - Auth:', !!authToken, 'Admin:', !!adminToken);

  if (!authToken && !adminToken) {
    return { authenticated: false }
  }

  try {
    const supabase = useSupabase()
    let userPhone = ''
    let isAdmin = false

    if (adminToken) {
      // Decode admin token (which we base64 encoded in login.post.ts)
      try {
        const decoded = Buffer.from(adminToken, 'base64').toString('utf-8')
        if (decoded.startsWith('admin_')) {
          const parts = decoded.split('_')
          userPhone = parts[1]
          isAdmin = true
        }
      } catch (e) {
        console.error('Failed to decode admin token', e)
      }
    }

    if (!userPhone && authToken) {
      if (authToken.startsWith('user_')) {
        userPhone = authToken.replace('user_', '')
      }
    }

    if (!userPhone) {
      return { authenticated: false }
    }

    // Fetch user details from Supabase
    const { data: account, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('phone', userPhone)
      .single()

    const userObj = {
      ...(account || {}),
      phone: userPhone,
      name: account?.name || userPhone,
      isAdmin: isAdmin || account?.role === 'admin'
    }

    // NEW: Sync name from Abaha CRM if NOT admin
    if (!userObj.isAdmin) {
      try {
        const TOKEN = '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA'
        
        // Normalize phone for Abaha (ensure 0 prefix)
        const normalizedPhone = userPhone.startsWith('0') ? userPhone 
          : userPhone.startsWith('84') ? '0' + userPhone.slice(2)
          : userPhone.startsWith('+84') ? '0' + userPhone.slice(3)
          : '0' + userPhone

        const params = new URLSearchParams()
        params.append('tel', normalizedPhone)

        const abahaRes = await $fetch<any>(
          `https://publicapi.abaha.vn/customer/info?token=${TOKEN}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
          }
        )

        // Extract name using existing mapping patterns
        let ad = abahaRes?.data?.customer || abahaRes?.data || abahaRes?.customer || abahaRes
        if (Array.isArray(ad)) ad = ad[0]
        
        if (ad) {
          const abahaName = ad.name ?? ad.full_name ?? ad.fullName ?? ad.customer_name 
            ?? ad.name_customer ?? ad.contact_name ?? ''
          if (abahaName) {
            userObj.name = abahaName
          }

          // Also merge address fields if available
          userObj.address = ad.address ?? ad.customer_address ?? ad.contact_address ?? userObj.address
          userObj.city = ad.location_name ?? ad.city ?? ad.province_name ?? userObj.city
          userObj.district = ad.district_name ?? ad.district ?? userObj.district
          userObj.ward = ad.ward_name ?? ad.ward ?? userObj.ward
        }
      } catch (err) {
        console.error('[Abaha Sync Error]:', err)
      }
    }

    return {
      authenticated: true,
      user: userObj
    }
  } catch (err) {
    console.error('[Auth Me Error]:', err)
    return { authenticated: false, error: 'Internal Server Error' }
  }
})
