<template>
  <div class="article-detail-page">
    <nav class="breadcrumb" aria-label="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <span>/</span>
      <NuxtLink to="/tin-tuc">Tin tức hoạt động</NuxtLink>
      <span>/</span>
      <strong>{{ article?.title || 'Đang tải...' }}</strong>
    </nav>
    
    <div v-if="!article" class="not-found">
      <h1>Không tìm thấy bài viết</h1>
      <p>Bài viết bạn đang truy cập không tồn tại hoặc đã bị xóa.</p>
      <NuxtLink to="/tin-tuc" class="back-btn">Trở về trang Tin tức</NuxtLink>
    </div>

    <div v-else class="article-container">
      <div class="article-header">
        <div class="article-tag">{{ article.tag }}</div>
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span class="date"><i class="fa-regular fa-calendar"></i> Cập nhật gần nhất</span>
        </div>
      </div>
      
      <div class="article-content" v-html="article.content"></div>
      
      <div class="article-footer">
        <h3>Chia sẻ bài viết này</h3>
        <div class="social-share">
          <button class="share-btn fb"><i class="fa-brands fa-facebook-f"></i> Facebook</button>
          <button class="share-btn tw"><i class="fa-brands fa-twitter"></i> Twitter</button>
          <button class="share-btn link" @click="copyLink"><i class="fa-solid fa-link"></i> Copy Link</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNews } from '~/composables/useNews'

const route = useRoute()
const slug = route.params.slug
const { newsList, loadNews } = useNews()

onMounted(() => {
  loadNews()
})

const article = computed(() => {
  return newsList.value.find(item => item.slug === slug)
})

const SITE_URL = 'https://huspanda.vn'

const getExcerpt = (html: string, maxLength = 160) => {
  const tagPattern = new RegExp('<[^>]*>', 'g')
  const text = html.replace(tagPattern, ' ').replace(/\s+/g, ' ').trim()
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

useSeoMeta({
  title: () => article.value ? `${article.value.title} | Tuấn Minh` : 'Bài viết | Tuấn Minh',
  description: () => article.value ? getExcerpt(article.value.content || '') : 'Tin tức máy nông nghiệp tại Tuấn Minh.',
  ogTitle: () => article.value ? `${article.value.title} | Tuấn Minh` : 'Bài viết | Tuấn Minh',
  ogDescription: () => article.value ? getExcerpt(article.value.content || '') : '',
  ogImage: () => article.value?.image || `${SITE_URL}/logo.png`,
  ogUrl: () => article.value ? `${SITE_URL}/tin-tuc/${article.value.slug}` : SITE_URL,
  ogType: 'article',
  twitterCard: 'summary_large_image',
})

const ldJson = computed(() => {
  if (!article.value) return ''
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.value.title,
    description: getExcerpt(article.value.content || ''),
    image: article.value.image || `${SITE_URL}/logo.png`,
    url: `${SITE_URL}/tin-tuc/${article.value.slug}`,
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: { '@type': 'Organization', name: 'Tuấn Minh', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'Tuấn Minh',
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` }
    }
  })
})

useHead({
  link: [{ rel: 'canonical', href: () => article.value ? `${SITE_URL}/tin-tuc/${article.value.slug}` : SITE_URL }],
  script: [{ type: 'application/ld+json', innerHTML: ldJson }]
})

const copyLink = () => {
  if (import.meta.client) {
    navigator.clipboard.writeText(window.location.href)
    alert('Đã copy đường dẫn bài viết!')
  }
}
</script>

<style scoped>
.article-detail-page {
  padding: 15px;
  max-width: 900px;
  margin: 0 auto;
  min-height: 60vh;
}

.breadcrumb {
  font-size: 13px;
  color: #666;
  margin-bottom: 25px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.breadcrumb a {
  color: #0066cc;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found h1 {
  color: #e31b1b;
  margin-bottom: 15px;
}

.back-btn {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background: #0066cc;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.article-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 15px rgba(0,0,0,0.05);
  padding: 30px;
  margin-bottom: 40px;
}

.article-header {
  margin-bottom: 30px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 20px;
}

.article-tag {
  display: inline-block;
  background: #e6f0fa;
  color: #0066cc;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.article-title {
  font-size: 28px;
  color: #222;
  margin: 0 0 15px 0;
  line-height: 1.4;
  font-weight: 700;
}

.article-meta {
  color: #888;
  font-size: 13px;
  display: flex;
  gap: 15px;
}

.article-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
}

.article-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 20px 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.article-content :deep(h2) {
  font-size: 22px;
  color: #1a73e8;
  margin: 30px 0 15px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 5px;
}

.article-content :deep(h3) {
  font-size: 18px;
  margin: 25px 0 10px;
  color: #222;
}

.article-content :deep(p) {
  margin-bottom: 16px;
}

.article-content :deep(ul), .article-content :deep(ol) {
  margin-bottom: 20px;
  padding-left: 20px;
}

.article-content :deep(li) {
  margin-bottom: 8px;
}

.article-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eaeaea;
}

.article-footer h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #444;
}

.social-share {
  display: flex;
  gap: 10px;
}

.share-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: opacity 0.2s;
}

.share-btn:hover {
  opacity: 0.9;
}

.share-btn.fb { background: #1877f2; }
.share-btn.tw { background: #1da1f2; }
.share-btn.link { background: #666; }

@media (max-width: 768px) {
  .article-container {
    padding: 20px;
  }
  
  .article-title {
    font-size: 24px;
  }
}
</style>
