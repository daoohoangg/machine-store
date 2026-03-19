// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    ['@nuxtjs/google-fonts', {
      families: {
        Roboto: [400, 500, 700],
      }
    }]
  ],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' },
        { rel: 'shortcut icon', type: 'image/png', href: '/logo.png' },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css' }
      ]
    }
  },
  runtimeConfig: {
    tokenApi: process.env.TOKEN_API,
    geminiApiKey: process.env.GEMINI_API_KEY,
    speedSmsToken: process.env.SPEEDSMS_ACCESS_TOKEN,
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'https://babystore18787.abaha.vn/',
      productsApiPath: process.env.PRODUCTS_API_PATH || '/api/products',
      abahaToken: process.env.ABAHA_TOKEN,
      abahaApiBaseUrl: process.env.ABAHA_API_BASE_URL || 'https://publicapi.abaha.vn/'
    }
  }
})
