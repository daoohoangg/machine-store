<template>
  <div class="news-page">
    <nav class="breadcrumb" aria-label="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <span>/</span>
      <strong>Tin tức hoạt động</strong>
    </nav>

    <div class="news-container">
      <h1 class="page-title">Tin tức hoạt động</h1>
      
      <div class="news-page-grid">
        <NuxtLink 
          v-for="(item, index) in newsList" 
          :key="index" 
          :to="(item.link && item.link !== '#') ? item.link : ('/tin-tuc/' + item.slug)"
          class="news-item"
        >
          <div class="news-img-wrapper">
            <img :src="item.image" :alt="item.title" class="news-img" />
            <div class="news-tag">{{ item.tag }}</div>
          </div>
          <div class="news-content">
            <h3 class="news-title">{{ item.title }}</h3>
            <div class="news-divider"></div>
            <p class="news-desc">{{ item.description }}</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useNews } from '~/composables/useNews'

useSeoMeta({
  title: 'Tin tức hoạt động | Tuấn Minh',
  description: 'Cập nhật tin tức mới nhất về máy nông nghiệp, máy xây dựng, khuyến mãi và các sự kiện tại Tuấn Minh.',
  ogTitle: 'Tin tức hoạt động | Tuấn Minh',
  ogDescription: 'Cập nhật tin tức mới nhất về máy nông nghiệp, khuyến mãi và các sự kiện tại Tuấn Minh.',
  ogImage: 'https://huspanda.vn/logo.png',
  ogUrl: 'https://huspanda.vn/tin-tuc',
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: 'https://huspanda.vn/tin-tuc' }]
})

const { newsList, loadNews } = useNews()

onMounted(() => {
  loadNews()
})
</script>

<style scoped>
.news-page {
  padding: 15px;
  max-width: 1200px;
  margin: 0 auto;
}

.breadcrumb {
  font-size: 13px;
  color: #666;
  margin-bottom: 20px;
  display: flex;
  gap: 6px;
}

.breadcrumb a {
  color: #0066cc;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.page-title {
  font-size: 24px;
  color: #222;
  margin-bottom: 24px;
  text-transform: uppercase;
  font-weight: 700;
  border-left: 4px solid #1a73e8;
  padding-left: 12px;
}

.news-page-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px 20px;
}

.news-item {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background: #fff;
  height: 100%;
}

.news-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 15px rgba(0,0,0,0.08);
}

.news-img-wrapper {
  position: relative;
  width: 100%;
  padding-top: 65%;
  overflow: hidden;
  background: #f5f5f5;
}

.news-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.news-item:hover .news-img {
  transform: scale(1.05);
}

.news-tag {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: rgba(54, 126, 203, 0.85);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 8px 12px;
  text-align: center;
  text-transform: uppercase;
  line-height: 1.3;
}

.news-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.news-title {
  font-size: 15px;
  font-weight: 700;
  color: #222;
  margin: 0 0 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-divider {
  width: 30px;
  height: 2px;
  background: #ddd;
  margin-bottom: 12px;
}

.news-desc {
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .news-page-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .news-page-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .news-page-grid {
    grid-template-columns: 1fr;
  }
  .page-title {
    font-size: 20px;
  }
}
</style>
