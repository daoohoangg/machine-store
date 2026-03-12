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
        { rel: 'icon', type: 'image/jpeg', href: '/favicon.jpg' },
        { rel: 'shortcut icon', type: 'image/jpeg', href: '/favicon.jpg' }
      ]
    }
  },
  runtimeConfig: {
    tokenApi: process.env.TOKEN_API,
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'https://babystore18787.abaha.vn/',
      productsApiPath: process.env.PRODUCTS_API_PATH || '/api/products'
    }
  }
})
