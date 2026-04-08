<template>
  <section class="hero-banner" @mouseenter="stopSlide" @mouseleave="startSlide">
    <button class="nav-arrow left" aria-label="Xem trước" @click="prevBanner">
      <i class="fa-solid fa-chevron-left"></i>
    </button>

    <div class="banner-slider" :style="{ transform: `translateX(-${currentIndex * 100}%)` }">
      <div v-for="(banner, index) in banners" :key="index" class="banner-slide">
        <img :src="banner" alt="Banner Tuấn Minh" />
      </div>
    </div>

    <button class="nav-arrow right" aria-label="Xem tiếp" @click="nextBanner">
      <i class="fa-solid fa-chevron-right"></i>
    </button>

    <div class="dots">
      <span 
        v-for="(banner, index) in banners" 
        :key="index" 
        :class="{ active: index === currentIndex }"
        @click="goToBanner(index)"
      ></span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

import img1 from '~/assets/img/banner/1111.jpg'
import img2 from '~/assets/img/banner/2.jpg'
import img3 from '~/assets/img/banner/333.jpg'
import img4 from '~/assets/img/banner/bn 1.jpg'
import img5 from '~/assets/img/banner/bn2.jpg'
import img6 from '~/assets/img/banner/bn5.jpg'
import img7 from '~/assets/img/banner/bn7.jpg'

const banners = [img2, img1, img3, img4, img5, img6, img7]
const currentIndex = ref(0)
let slideInterval: any = null

const nextBanner = () => {
  currentIndex.value = (currentIndex.value + 1) % banners.length
}

const prevBanner = () => {
  currentIndex.value = (currentIndex.value - 1 + banners.length) % banners.length
}

const goToBanner = (index: number) => {
  currentIndex.value = index
}

const startSlide = () => {
  slideInterval = setInterval(nextBanner, 4000)
}

const stopSlide = () => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
}

onMounted(() => {
  startSlide()
})

onUnmounted(() => {
  stopSlide()
})
</script>

<style scoped>
.hero-banner {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #f0f0f0;
}

.banner-slider {
  display: flex;
  transition: transform 0.5s ease-in-out;
}

.banner-slide {
  min-width: 100%;
}

.banner-slide img {
  width: 100%;
  height: auto;
  display: block;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  color: #fff;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
  padding-bottom: 4px; /* visually center the arrow */
}

.nav-arrow:hover {
  background: rgba(0, 0, 0, 0.7);
}

.nav-arrow.left {
  left: 20px;
}

.nav-arrow.right {
  right: 20px;
}

.dots {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 2;
}

.dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.dots span.active {
  background: #fff;
  transform: scale(1.2);
}

@media (max-width: 1200px) {
  .hero-banner {
    border-radius: 8px;
  }
  .nav-arrow {
    width: 36px;
    height: 36px;
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .hero-banner {
    border-radius: 4px;
  }
  .nav-arrow {
    display: none; /* Hide arrows on small screens, rely on swipe or dots */
  }
  .banner-slide img {
    height: auto;
    min-height: unset;
    object-fit: contain;
  }
}
</style>
