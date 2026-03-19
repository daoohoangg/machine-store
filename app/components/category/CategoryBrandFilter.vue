<template>
  <div class="brand-filter-grid" v-if="brands.length > 0">
    <button 
      v-for="brand in displayBrands" 
      :key="brand.name"
      class="brand-btn"
      :class="{ active: selectedBrands.includes(brand.name) }"
      @click="toggleBrand(brand.name)"
    >
      <img :src="getBrandImage(brand.name)" alt="" class="brand-icon" />
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
    .filter(name => getBrandImage(name))
    .map(name => ({ name }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const displayBrands = computed(() => {
  return expandBrands.value ? brands.value : brands.value.slice(0, 11)
})

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
  height: 48px; /* Slightly increased to fit logos well */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 8px 12px;
  overflow: hidden;
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

.brand-icon {
  width: auto;
  height: 32px;
  max-width: 100%;
  object-fit: contain;
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
  .brand-btn { height: 42px; }
}
</style>
