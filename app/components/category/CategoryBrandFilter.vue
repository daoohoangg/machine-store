<template>
  <div class="brand-filter-grid" v-if="brands.length > 0">
    <button 
      v-for="brand in displayBrands" 
      :key="brand.name"
      class="brand-btn"
      :class="{ active: selectedBrands.includes(brand.name) }"
      @click="toggleBrand(brand.name)"
    >
      <span class="brand-text" :style="{ color: getBrandColor(brand.name) }">{{ brand.name }}</span>
    </button>
    
    <button v-if="brands.length > 11" class="brand-btn view-more" @click="expandBrands = !expandBrands">
      Xem thêm<br>{{ brands.length - 11 }} hãng
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps({
  availableProducts: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] }
})

const emit = defineEmits(['update:modelValue', 'brand-toggled'])
const selectedBrands = ref<string[]>([...props.modelValue as string[]])
const expandBrands = ref(false)

// Sync with parent when it changes externally (e.g. from route)
watch(() => props.modelValue, (newVal) => {
  selectedBrands.value = [...newVal as string[]]
}, { deep: true, immediate: true })

const toggleBrand = (name: string) => {
  const index = selectedBrands.value.indexOf(name)
  if (index === -1) {
    selectedBrands.value.push(name)
  } else {
    selectedBrands.value.splice(index, 1)
  }
  emit('update:modelValue', [...selectedBrands.value])
  emit('brand-toggled', [...selectedBrands.value])
}

const brands = computed(() => {
  if (!props.availableProducts) return []
  const brandSet = new Set<string>()
  
  props.availableProducts.forEach((p: any) => {
    let brandName = p.brand
    if (!brandName && p.title) {
      const firstWord = p.title.split(' ')[0]
      if (firstWord.length > 2 && firstWord.length < 12) {
        brandName = firstWord.toUpperCase()
      }
    }
    
    if (brandName) {
      brandSet.add(brandName.toUpperCase())
    }
  })
  
  return Array.from(brandSet)
    .filter(name => /^[A-Z0-9\s\-\.]+$/i.test(name))
    .map(name => ({ name }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const displayBrands = computed(() => {
  return expandBrands.value ? brands.value : brands.value.slice(0, 11)
})

const getBrandColor = (brand: string) => {
  const b = brand.toLowerCase()
  if (b.includes('bosch') || b.includes('sunhouse') || b.includes('sharp') || b.includes('stanley')) return '#e31b1b'
  if (b.includes('philips') || b.includes('panasonic') || b.includes('samsung') || b.includes('aqua')) return '#0033cc'
  if (b.includes('makita')) return '#008b8b'
  if (b.includes('lg')) return '#a50034'
  
  const hash = brand.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = ['#e31b1b', '#0033cc', '#333333', '#008b8b', '#ff6600', '#4a148c']
  return colors[hash % colors.length]
}
</script>

<style scoped>
.brand-filter-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.brand-btn {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 5px;
}

.brand-btn:hover {
  border-color: #999;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.brand-btn.active {
  border-color: #1a73e8;
  box-shadow: inset 0 0 0 1px #1a73e8;
}

.brand-text {
  font-family: 'Arial Black', Impact, sans-serif;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.5px;
}

.brand-btn.view-more {
  background: #1a73e8;
  color: #fff;
  border-color: #1a73e8;
  font-size: 12px;
  line-height: 1.2;
}

.brand-btn.view-more:hover {
  background: #1557b0;
}

@media (max-width: 900px) {
  .brand-filter-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 600px) {
  .brand-filter-grid { grid-template-columns: repeat(3, 1fr); }
  .brand-text { font-size: 11px; }
}
</style>
