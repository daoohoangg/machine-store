<template>
  <section class="category-section">
    <div class="category-grid">
      <NuxtLink
        v-for="item in displayedCategories"
        :key="item.name"
        :to="`/homepage?category=${encodeURIComponent(item.name)}`"
        class="cat-item"
      >
        <span v-if="item.discount" class="discount">{{ item.discount }}</span>
        <div class="icon-wrap">{{ item.icon }}</div>
        <p>{{ item.name }}</p>
      </NuxtLink>
    </div>

    <button
      v-if="hasMoreCategories"
      class="view-more"
      type="button"
      @click="toggleCategories"
    >
      {{ isExpanded ? 'Thu gọn chuyên mục' : 'Xem thêm chuyên mục' }}
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHomeProducts } from '~/composables/useHomeProducts'
import excelCategoriesData from '~/data/excel-categories.json'

const iconByName = (name: string) => {
  const key = name.toLowerCase()
  if (key.includes('máy phát điện') || key.includes('may phat dien')) return '⚡'
  if (key.includes('máy rửa xe') || key.includes('may rua xe')) return '🚿'
  if (key.includes('nén khí') || key.includes('nen khi')) return '💨'
  if (key.includes('cưa xăng') || key.includes('cua xang')) return '🪚'
  if (key.includes('cắt cỏ') || key.includes('cat co')) return '✂️'
  if (key.includes('xới đất') || key.includes('xoi dat')) return '🚜'
  if (key.includes('bơm nước') || key.includes('bom nuoc')) return '🌊'
  if (key.includes('đầm') || key.includes('dam')) return '🏗️'
  if (key.includes('động cơ') || key.includes('dong co')) return '⚙️'
  if (key.includes('khoan đất') || key.includes('khoan dat')) return '🕳️'
  if (key.includes('phun thuốc') || key.includes('phun thuoc')) return '🧪'
  if (key.includes('tỉa cành') || key.includes('tia canh')) return '🪴'
  if (key.includes('hút bụi') || key.includes('hut bui')) return '🧹'
  if (key.includes('cầm tay') || key.includes('cam tay')) return '🔧'
  if (key.includes('xịt') || key.includes('xit')) return '🔫'
  if (key.includes('tivi')) return '📺'
  if (key.includes('quat')) return '🌀'
  if (key.includes('hut am')) return '💧'
  if (key.includes('tu lanh') || key.includes('tủ lạnh')) return '🧊'
  if (key.includes('giat')) return '🧺'
  if (key.includes('dieu hoa') || key.includes('điều hòa')) return '❄️'
  if (key.includes('say')) return '👕'
  return '🛍️'
}

const parseDiscount = (text: string | null) => {
  if (!text) return 0
  const num = Number((text || '').replace(/[^\d]/g, ''))
  return Number.isNaN(num) ? 0 : num
}

const normalizeCategoryName = (value: string | null | undefined) => {
  return (value || '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const { products } = useHomeProducts()

const categoryDiscountMap = computed(() => {
  const grouped = new Map<string, string | null>()

  for (const item of products.value) {
    const name = normalizeCategoryName(item.category) || 'Danh mục'
    const current = grouped.get(name)
    const currentDiscountValue = parseDiscount(current || null)
    const nextDiscountValue = parseDiscount(item.discount)
    grouped.set(name, nextDiscountValue > currentDiscountValue ? item.discount : current || null)
  }

  return grouped
})

const excelCategories = computed(() => {
  const seen = new Set<string>()
  return (excelCategoriesData as string[])
    .map((name) => normalizeCategoryName(name))
    .filter((name) => {
      if (!name) return false
      const key = name.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
})

const categories = computed(() => {
  const sourceCategories = excelCategories.value.length
    ? excelCategories.value
    : Array.from(
      new Set(
        products.value
          .map((item) => normalizeCategoryName(item.category))
          .filter((name) => !!name)
      )
    )

  return sourceCategories.map((name) => ({
      name,
      icon: iconByName(name),
      discount: categoryDiscountMap.value.get(name) || null
    }))
})

const maxVisibleCategories = 16
const isExpanded = ref(false)

const displayedCategories = computed(() => {
  if (isExpanded.value) return categories.value
  return categories.value.slice(0, maxVisibleCategories)
})

const hasMoreCategories = computed(() => categories.value.length > maxVisibleCategories)

const toggleCategories = () => {
  isExpanded.value = !isExpanded.value
}
</script>

<style scoped>
.category-section {
  background: #fff;
  border: none;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
}

.cat-item {
  border-right: 1px solid #e8e8e8;
  border-bottom: 1px solid #e8e8e8;
  padding: 10px 8px;
  text-align: center;
  position: relative;
  min-height: 130px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
}

.cat-item:nth-child(8n) {
  border-right: none;
}

.discount {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: #d81e1e;
  padding: 2px 5px;
  border-radius: 2px;
}

.icon-wrap {
  font-size: 36px;
  line-height: 1;
}

.cat-item p {
  margin: 0;
  font-size: 14px;
  color: #1b1b1b;
  line-height: 1.25;
}

.view-more {
  margin: 14px auto 18px;
  display: block;
  border: 1px solid #4095e6;
  background: #fff;
  color: #1777d2;
  font-size: 16px;
  border-radius: 4px;
  padding: 8px 18px;
}

@media (max-width: 1200px) {
  .category-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .cat-item:nth-child(8n) {
    border-right: 1px solid #e8e8e8;
  }

  .cat-item:nth-child(4n) {
    border-right: none;
  }
}

@media (max-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cat-item:nth-child(4n) {
    border-right: 1px solid #e8e8e8;
  }

  .cat-item:nth-child(2n) {
    border-right: none;
  }

  .view-more {
    font-size: 14px;
  }
}
</style>
