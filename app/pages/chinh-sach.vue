<template>
  <div class="policy-page">
    <nav class="breadcrumb" aria-label="breadcrumb">
      <NuxtLink to="/">Trang chủ</NuxtLink>
      <span>/</span>
      <strong>Chính sách</strong>
    </nav>

    <div class="policy-layout">
      <!-- Sidebar / Tabs -->
      <aside class="policy-sidebar">
        <h2 class="sidebar-title">Danh mục chính sách</h2>
        <ul class="policy-nav" v-if="tabs.length > 0">
          <li v-for="tab in tabs" :key="tab.id">
            <button 
              class="nav-btn" 
              :class="{ active: activeTab === tab.id }"
              @click="changeTab(tab.id)"
            >
              <i class="fa-solid" :class="tab.icon"></i>
              {{ tab.title }}
            </button>
          </li>
        </ul>
      </aside>

      <!-- Content Area -->
      <main class="policy-content" v-if="currentTab">
        <div class="content-header">
          <h1>{{ currentTab.title }}</h1>
          <div class="meta">
            <span><i class="fa-solid fa-location-dot"></i> TuấnMinh</span>
            <span><i class="fa-regular fa-clock"></i> {{ currentTab.updatedAt }}</span>
          </div>
        </div>

        <div class="content-body" v-html="currentTab.content"></div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSiteSettings } from '~/composables/useSiteSettings'

useHead({
  title: 'Chính sách | Tuấn Minh'
})

const route = useRoute()
const router = useRouter()
const { settings, defaultPolicies } = useSiteSettings()

// Dynamically generate tabs from global store
const tabs = computed(() => {
  const p = settings.value?.policies || defaultPolicies
  return [p.thanhToan, p.khachHang, p.doiTra, p.giaoHang].filter(Boolean)
})

const activeTab = ref('thanh-toan')

const currentTab = computed(() => {
  if (tabs.value.length === 0) return null
  return tabs.value.find(t => t.id === activeTab.value) || tabs.value[0]
})

const changeTab = (tabId: string) => {
  activeTab.value = tabId
  router.push({ query: { tab: tabId } })
}

onMounted(() => {
  if (route.query.tab) {
    const tabExists = tabs.value.find(t => t.id === route.query.tab)
    if (tabExists) {
      activeTab.value = route.query.tab as string
    }
  }
})

watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    const tabExists = tabs.value.find(t => t.id === newTab)
    if (tabExists) {
      activeTab.value = newTab as string
    }
  }
})
</script>

<style scoped>
.policy-page {
  padding: 15px;
  min-height: 600px;
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

.policy-layout {
  display: flex;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.policy-sidebar {
  width: 280px;
  background: #f9f9f9;
  border-right: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  padding: 16px 20px;
  margin: 0;
  border-bottom: 1px solid #e0e0e0;
  background: #f0f0f0;
  text-transform: uppercase;
}

.policy-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-btn {
  width: 100%;
  text-align: left;
  padding: 16px 20px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #eee;
  font-size: 15px;
  font-weight: 500;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn i {
  width: 20px;
  text-align: center;
  color: #888;
  font-size: 16px;
}

.nav-btn:hover {
  background: #fff;
  color: #0066cc;
}

.nav-btn.active {
  background: #fff;
  color: #e31b1b;
  border-left: 4px solid #e31b1b;
  padding-left: 16px;
}

.nav-btn.active i {
  color: #e31b1b;
}

.policy-content {
  flex: 1;
  padding: 24px 32px;
}

.content-header {
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.content-header h1 {
  font-size: 28px;
  color: #222;
  margin: 0 0 12px;
}

.meta {
  font-size: 13px;
  color: #888;
  display: flex;
  gap: 16px;
}

.meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.content-body {
  font-size: 15px;
  line-height: 1.6;
  color: #333;
}

.content-body :deep(h2), .content-body :deep(h3) {
  color: #222;
  margin-top: 24px;
  margin-bottom: 12px;
}

.content-body :deep(p) {
  margin-bottom: 12px;
}

.content-body :deep(ul) {
  margin-bottom: 16px;
  padding-left: 20px;
}

.content-body :deep(li) {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .policy-layout {
    flex-direction: column;
    gap: 0;
  }
  
  .policy-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .policy-nav {
    display: flex;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .policy-nav::-webkit-scrollbar {
    display: none;
  }
  
  .nav-btn {
    border-bottom: none;
    border-right: 1px solid #eee;
    padding: 12px 16px;
  }
  
  .nav-btn.active {
    border-left: none;
    border-bottom: 3px solid #e31b1b;
    padding-left: 20px;
  }
  
  .policy-content {
    padding: 20px 16px;
  }
  
  .content-header h1 {
    font-size: 22px;
  }
}
</style>
