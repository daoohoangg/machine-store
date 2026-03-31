import fs from 'fs'
import path from 'path'

interface ZaloOaConfig {
  access_token: string
  refresh_token: string
  expires_at: number
}

const CONFIG_PATH = path.resolve(process.cwd(), 'server/data/zalo_oa_config.json')

export const getZaloConfig = (): ZaloOaConfig | null => {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return null
    const content = fs.readFileSync(CONFIG_PATH, 'utf-8')
    console.log('[Zalo Utils] Config loaded successfully')
    return JSON.parse(content)
  } catch (error) {
    console.error('[Zalo Utils] Error reading config:', error)
    return null
  }
}

export const saveZaloConfig = (config: ZaloOaConfig) => {
  try {
    const dir = path.dirname(CONFIG_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
  } catch (error) {
    console.error('[Zalo Utils] Error saving config:', error)
  }
}

export const refreshZaloToken = async () => {
  const config = getZaloConfig()
  if (!config || !config.refresh_token) {
    throw new Error('Missing Zalo refresh token in config')
  }

  const runtimeConfig = useRuntimeConfig()
  const appId = runtimeConfig.zaloAppId
  const appSecret = runtimeConfig.zaloAppSecret

  if (!appId || !appSecret) {
    throw new Error('Zalo App ID or Secret not configured in environment')
  }

  console.log('[Zalo Utils] Refreshing access token...')

  try {
    const response: any = await $fetch('https://oauth.zaloapp.com/v4/oa/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'secret_key': appSecret
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: config.refresh_token,
        app_id: appId
      })
    })

    if (response.access_token) {
      const newConfig: ZaloOaConfig = {
        access_token: response.access_token,
        refresh_token: response.refresh_token || config.refresh_token,
        expires_at: Date.now() + (response.expires_in || 3600) * 1000
      }
      saveZaloConfig(newConfig)
      console.log('[Zalo Utils] Token refreshed successfully')
      return newConfig.access_token
    } else {
      console.error('[Zalo Utils] Refresh token response error:', response)
      throw new Error(`Failed to refresh Zalo token: ${response.error_description || response.message || 'Unknown error'}`)
    }
  } catch (error: any) {
    console.error('[Zalo Utils] Refresh token request failed:', error.data || error)
    throw error
  }
}

export const getValidAccessToken = async () => {
  const config = getZaloConfig()
  if (!config) throw new Error('Zalo OA config not found')

  // Refresh if expired or expiring in 5 minutes
  if (Date.now() + 5 * 60 * 1000 > config.expires_at) {
    return await refreshZaloToken()
  }

  return config.access_token
}

export const sendZNS = async (phone: string, otp: string, templateId: string = '558299') => {
  const accessToken = await getValidAccessToken()
  
  // Standardize phone number for Zalo (84...)
  let formattedPhone = phone.replace(/\D/g, '')
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '84' + formattedPhone.slice(1)
  } else if (!formattedPhone.startsWith('84')) {
    formattedPhone = '84' + formattedPhone
  }

  console.log(`[Zalo Utils] Sending ZNS to ${formattedPhone} with OTP ${otp}`)

  try {
    const response: any = await $fetch('https://openapi.zalo.me/v3.0/oa/message/zns', {
      method: 'POST',
      headers: {
        'access_token': accessToken,
        'Content-Type': 'application/json'
      },
      body: {
        phone: formattedPhone,
        template_id: templateId,
        template_data: {
          otp: otp,
          content: `Mã OTP của bạn là ${otp}. Vui lòng không chia sẻ mã này cho bất kỳ ai.`
        },
        tracking_id: `otp_${Date.now()}`
      }
    })

    if (response.error !== 0) {
      console.error('[Zalo Utils] ZNS Send Error:', response)
      throw new Error(`Zalo API Error: ${response.message} (code: ${response.error})`)
    }

    return response
  } catch (error: any) {
    const detail = error.data || error.message || error
    console.error('[Zalo Utils] ZNS Request Failed Detail:', detail)
    throw new Error(`Zalo API error: ${JSON.stringify(detail)}`)
  }
}
