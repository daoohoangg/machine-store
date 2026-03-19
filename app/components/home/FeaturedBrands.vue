<template>
  <section class="featured-brands">
    <div class="brands-header">
      <div class="bh-left">
        <h2 class="bh-title">Thương hiệu nổi bật</h2>
      </div>
    </div>

    <div class="brands-grid">
      <NuxtLink 
        v-for="(brand, index) in activeBrands" 
        :key="index" 
        :to="`/homepage?brand=${encodeURIComponent(brand)}`"
        class="brand-item"
      >
        <img :src="getBrandImage(brand)" alt="" class="brand-icon" />
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const topBrands = [
  'BENLEY', 'CX', 'GX', 'HUPANDA', 'HUQAMA',
  'HUSPANDA', 'HUSPRO', 'HUSQAMA', 'HUSTIHL', 'KAMASTSU',
  'KAVANNI', 'KENSI', 'MAXLOCK', 'MITUSI', 'SITILEN', 'SITNL'
]

// Load all images from the logo directory dynamically
const brandImages = import.meta.glob('~/assets/img/brand/LOGO WEB/*.{png,jpg,jpeg,svg,webp}', { eager: true, import: 'default' })

const getBrandImage = (brand: string) => {
  const normalized = brand.toLowerCase();
  for (const path in brandImages) {
    if (path.toLowerCase().includes(`/${normalized}.`)) {
      return brandImages[path] as string;
    }
  }
  return null;
}

const activeBrands = computed(() => {
  return topBrands.filter(brand => getBrandImage(brand));
})
</script>

<style scoped>
.featured-brands {
  background: #fff;
  border: 1px solid #e0e0e0;
  margin-top: 20px;
}

.brands-header {
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
}

.bh-title {
  font-size: 22px;
  font-weight: 700;
  text-transform: uppercase;
  margin: 0;
  color: #333;
  border-left: 4px solid #ffcc00;
  padding-left: 10px;
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  padding: 20px;
  gap: 12px;
}

.brand-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 60px; /* Increased slightly to better fit logos */
  padding: 8px;
  text-align: center;
  border: 1px solid #dcdcdc;
  border-radius: 4px;
  text-decoration: none;
  background: #fff;
  transition: box-shadow 0.2s, border-color 0.2s;
  overflow: hidden;
}

.brand-item:hover {
  border-color: #1a73e8;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.brand-text {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.5px;
  font-family: 'Arial', sans-serif;
  text-transform: uppercase;
}

.brand-icon {
  width: auto;
  height: 24px;
  max-width: 100%;
  object-fit: contain;
}

@media (max-width: 1200px) {
  .brands-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 900px) {
  .brands-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 600px) {
  .bh-title { font-size: 18px; }
  .brands-grid { grid-template-columns: repeat(2, 1fr); gap: 8px;}
  .brand-text { font-size: 13px; }
  .brand-item { height: 48px; }
  .brand-icon { height: 18px; }
}
</style>
