// https://nuxt.com/docs/api/configuration/nuxt-config

const SITE_URL = 'https://huspanda.vn'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    ['@nuxtjs/google-fonts', {
      families: {
        Roboto: [400, 500, 700],
      }
    }],
    '@nuxtjs/sitemap'
  ],
  css: ['~/assets/css/main.css'],
  site: {
    url: SITE_URL,
    name: 'Tuấn Minh - Điện Máy & Máy Nông Nghiệp Chính Hãng',
  },
  sitemap: {
    strictNuxtContentPaths: false,
    urls: [
      { loc: '/', changefreq: 'daily', priority: 1.0 },
      { loc: '/tin-tuc', changefreq: 'weekly', priority: 0.8 },
      { loc: '/chinh-sach', changefreq: 'monthly', priority: 0.4 },
    ]
  },
  app: {
    head: {
      htmlAttrs: { lang: 'vi' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'robots', content: 'index, follow' },
        { name: 'keywords', content: 'diện máy tuấn minh, điện máy, máy nông nghiệp, máy bơm nước, máy phát điện, máy xới đất, máy nén khí, máy cắt cỏ, Oshima, Honda, máy chính hãng, giá tốt, bảo hành toàn quốc' },
        { property: 'og:site_name', content: 'Tuấn Minh - Điện Máy Chính Hãng' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: `${SITE_URL}/logo.png` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: `${SITE_URL}/logo.png` },
        { name: 'zalo-platform-site-verification', content: 'QS-S9uF2INrww9DX_iWBQtJ3aNAOjKKbDZGq' },
      ],
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
    zaloAppId: process.env.ZALO_APP_ID,
    zaloAppSecret: process.env.ZALO_APP_SECRET,
    zaloRedirectUri: process.env.ZALO_REDIRECT_URI,
    public: {
      siteUrl: SITE_URL,
      zaloAppId: process.env.ZALO_APP_ID,
      zaloRedirectUri: process.env.ZALO_REDIRECT_URI,
      apiBaseUrl: process.env.API_BASE_URL || 'https://babystore18787.abaha.vn/',
      productsApiPath: process.env.PRODUCTS_API_PATH || '/api/products',
      abahaToken: process.env.ABAHA_TOKEN,
      abahaApiBaseUrl: process.env.ABAHA_API_BASE_URL || 'https://publicapi.abaha.vn/'
    }
  }
})
