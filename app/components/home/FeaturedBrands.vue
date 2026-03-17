<template>
  <section class="featured-brands">
    <div class="brands-header">
      <div class="bh-left">
        <h2 class="bh-title">Thương hiệu nổi bật</h2>
      </div>
    </div>

    <div class="brands-grid">
      <div 
        v-for="(brand, index) in topBrands" 
        :key="index" 
        class="brand-item"
      >
        <span class="brand-text" :style="{ color: getBrandColor(brand) }">{{ brand }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const { products } = useHomeProducts()

const topBrands = computed(() => {
  if (!products.value) return []
  
  // Extract unique brands from product titles 
  // (Assuming first word or specific patterns could be brands if no explicit brand field exists)
  // For better visual, we'll use a mix of extracted and common hardcoded brands if needed
  
  const extracted = new Set<string>()
  products.value.forEach(p => {
    if (p.title) {
      const firstWord = p.title.split(' ')[0]
      if (firstWord && firstWord.length > 2 && firstWord.length < 12) {
        extracted.add(firstWord.toUpperCase())
      }
    }
  })
  
  let brandsList = Array.from(extracted)
  
  // Fallback to some common brands if not enough extracted
  const commonBrands = [
    'SUNHOUSE', 'BOSCH', 'LG', 'SHARP', 'SAMSUNG', 
    'PANASONIC', 'TOSHIBA', 'MAKITA', 'PHILIPS', 'FUNIKI',
    'AQUA', 'HITACHI', 'CASPER', 'DAIKIN'
  ]
  
  if (brandsList.length < 14) {
    brandsList = [...new Set([...brandsList, ...commonBrands])]
  }
  
  return brandsList.slice(0, 14)
})

const getBrandColor = (brand: string) => {
  const b = brand.toLowerCase()
  if (b.includes('bosch') || b.includes('sunhouse') || b.includes('sharp')) return '#e31b1b' // Red
  if (b.includes('philips') || b.includes('panasonic') || b.includes('samsung')) return '#0033cc' // Blue
  if (b.includes('makita')) return '#008b8b' // Teal
  if (b.includes('lg')) return '#a50034' // LG red
  
  // Random color based on string hash for others
  const hash = brand.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = ['#e31b1b', '#0033cc', '#333333', '#008b8b', '#ff6600', '#4a148c']
  return colors[hash % colors.length]
}
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
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  margin: 0;
  color: #333;
  border-left: 4px solid #ffcc00;
  padding-left: 10px;
}

.brands-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 20px;
  gap: 20px 10px;
}

.brand-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding: 10px;
  text-align: center;
}

.brand-text {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.5px;
  font-family: 'Arial Black', Impact, sans-serif;
  text-transform: uppercase;
}

@media (max-width: 1200px) {
  .brands-grid { grid-template-columns: repeat(5, 1fr); }
}

@media (max-width: 900px) {
  .brands-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 600px) {
  .brands-grid { grid-template-columns: repeat(3, 1fr); }
  .brand-text { font-size: 16px; }
}
</style>
