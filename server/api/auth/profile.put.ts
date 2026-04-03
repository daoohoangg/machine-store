import { useSupabase } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const method = getMethod(event)
  if (method !== 'PUT') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }

  const authToken = getCookie(event, 'auth_token')
  const adminToken = getCookie(event, 'admin_token')

  if (!authToken && !adminToken) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  let userPhone = ''
  if (adminToken) {
    try {
      const decoded = Buffer.from(adminToken, 'base64').toString('utf-8')
      if (decoded.startsWith('admin_')) {
        userPhone = decoded.split('_')[1]
      }
    } catch (e) {}
  }

  if (!userPhone && authToken && authToken.startsWith('user_')) {
    userPhone = authToken.replace('user_', '')
  }

  if (!userPhone) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized session' })
  }

  const body = await readBody(event)
  const { fullName, email, city, district, ward, address } = body

  try {
    const supabase = useSupabase()

    // 1. Update Supabase
    const { error: supabaseError } = await supabase
      .from('accounts')
      .update({
        full_name: fullName,
        email: email,
        city: city,
        district: district,
        ward: ward,
        address: address,
        updated_at: new Date().toISOString()
      })
      .eq('phone', userPhone)

    if (supabaseError) {
      console.error('[Profile Update] Supabase Error:', supabaseError)
      throw createError({ statusCode: 500, statusMessage: 'Lỗi cập nhật cơ sở dữ liệu' })
    }

    // 2. Sync to Abaha
    try {
      const abahaToken = process.env.ABAHA_TOKEN || useRuntimeConfig().public.abahaToken;
      if (abahaToken) {
        const fullAddress = `${address || ''}${ward ? `, ${ward}` : ''}${district ? `, ${district}` : ''}${city ? `, ${city}` : ''}`.trim().replace(/^, /, '')
        
        await $fetch(`https://publicapi.abaha.vn/customer/create?token=${abahaToken}`, {
          method: 'POST',
          body: {
            tel: userPhone,
            name: fullName,
            email: email,
            address: fullAddress,
            location_name: city // Abaha often uses city/location_name
          }
        });
        console.log('[Abaha API] Successfully synced profile update:', userPhone);
      }
    } catch (abahaErr: any) {
       console.error('[Abaha API Sync Error]:', abahaErr?.data || abahaErr.message)
       // We don't fail the whole request if only Abaha sync fails, but we log it
    }

    return { 
      success: true, 
      message: 'Cập nhật thông tin thành công',
      user: {
        phone: userPhone,
        name: fullName
      }
    }
  } catch (err: any) {
    console.error('[Profile API Error]:', err)
    if (err.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: 'Lỗi hệ thống khi cập nhật hồ sơ' })
  }
})
