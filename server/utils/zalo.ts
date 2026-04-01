import fs from 'fs'
import path from 'path'

interface ZaloOaConfig {
  access_token: string
  refresh_token: string
  expires_at: number
}

const CONFIG_PATH = path.resolve('e:/freelance/machine-store/server/data/zalo_oa_config.json')

import { useSupabase } from './supabase'

export const getZaloConfig = async (): Promise<ZaloOaConfig | null> => {
  try {
    const supabase = useSupabase()
    const { data, error } = await supabase
      .from('configs')
      .select('value')
      .eq('key', 'zalo_oa')
      .single()

    if (error || !data) {
      console.error('[Zalo Utils] Zalo config not found in DB:', error?.message)
      return null
    }

    console.log('[Zalo Utils] Config loaded from DB successfully')
    return typeof data.value === 'string' ? JSON.parse(data.value) : data.value
  } catch (error) {
    console.error('[Zalo Utils] Error reading config from DB:', error)
    return null
  }
}

export const saveZaloConfig = async (config: ZaloOaConfig) => {
  try {
    const supabase = useSupabase()
    const { error } = await supabase
      .from('configs')
      .upsert({
        key: 'zalo_oa',
        value: config
      })

    if (error) {
      console.error('[Zalo Utils] Error saving config to DB:', error.message)
    } else {
      console.log('[Zalo Utils] Config successfully saved to DB')
    }
  } catch (error) {
    console.error('[Zalo Utils] Exception saving config to DB:', error)
  }
}

export const refreshZaloToken = async () => {
  const config = await getZaloConfig()
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
        expires_at: Date.now() + (parseInt(response.expires_in) || 90000) * 1000
      }
      await saveZaloConfig(newConfig)
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
  const config = await getZaloConfig()
  if (!config) throw new Error('Zalo OA config not found in DB')

  // Refresh if expired or expiring in 5 minutes, or if expires_at is not available/invalid
  if (!config.expires_at || isNaN(Number(config.expires_at)) || Date.now() + 5 * 60 * 1000 > Number(config.expires_at)) {
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
    const response: any = await $fetch('https://business.openapi.zalo.me/message/template', {
      method: 'POST',
      headers: {
        'access_token': accessToken,
        'Content-Type': 'application/json'
      },
      body: {
        phone: formattedPhone,
        template_id: templateId,
        template_data: {
          otp: String(otp),
          time: "5"
        }
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
