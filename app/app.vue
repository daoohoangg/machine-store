<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const BRAND_NAME = 'ĐIỆN MÁY TUẤN MINH'
const route = useRoute()

const pageTitle = computed(() => {
  if (route.path === '/') return 'Trang chủ'
  if (route.path === '/homepage') {
    const category = route.query.category
    return Array.isArray(category) ? category[0] || 'Danh mục sản phẩm' : category || 'Danh mục sản phẩm'
  }

  const titleMap: Record<string, string> = {
    '/checkout': 'Thanh toán',
    '/checkout-installment': 'Thanh toán trả góp',
    '/auth/login': 'Đăng nhập',
    '/auth/register': 'Đăng ký',
    '/so-do-website': 'Sơ đồ website',
    '/order/verify': 'Xác thực đơn hàng',
    '/order/success': 'Đặt hàng thành công',
    '/order/lookup': 'Tra cứu đơn hàng'
  }

  return titleMap[route.path] || 'Trang'
})

useHead(() => ({
  title: `${pageTitle.value} | ${BRAND_NAME}`
}))
</script>
