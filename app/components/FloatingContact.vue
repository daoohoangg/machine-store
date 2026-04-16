<template>
  <div class="floating-contact-group" v-if="!isAdminPage">
    <a :href="settings.facebook" target="_blank" class="contact-item facebook" aria-label="Facebook">
      <i class="fa-brands fa-facebook"></i>
    </a>
    <a :href="settings.zalo" target="_blank" class="contact-item zalo" aria-label="Zalo">
      <img src="https://meta.vn/images/icons/zalo.svg" alt="Zalo" />
    </a>
    <div class="contact-item hotline" @click="toggleHotline" :class="{ active: isHotlineOpen }">
      <div class="phone-ring"></div>
      <div class="phone-circle"></div>
      <i class="fa-solid fa-phone"></i>
      
      <div v-if="isHotlineOpen" class="hotline-menu shadow-lg">
        <a :href="'tel:' + settings.hotline.replace(/[^0-9]/g, '')" class="hotline-link">
          <i class="fa-solid fa-cart-shopping"></i> Mua hàng: <strong>{{ settings.hotline }}</strong>
        </a>
        <a href="tel:19005068" class="hotline-link">
          <i class="fa-solid fa-headset"></i> Kỹ thuật: <strong>1900 5068</strong>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSiteSettings } from '~/composables/useSiteSettings'

const { settings } = useSiteSettings()
const route = useRoute()
const isHotlineOpen = ref(false)

const isAdminPage = computed(() => route.path.startsWith('/admin'))

const toggleHotline = () => {
  isHotlineOpen.value = !isHotlineOpen.value
}
</script>

<style scoped>
/* Floating Contact Icons */
.floating-contact-group {
  position: fixed;
  bottom: 25px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 15px;
  align-items: center;
}

.contact-item {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.contact-item:hover {
  transform: scale(1.15) translateY(-5px);
}

.contact-item i {
  font-size: 24px;
  color: #fff;
}

.contact-item.facebook {
  background: #1877f2;
}

.contact-item.zalo {
  background: #fff;
  border: 1px solid #eee;
}

.contact-item.zalo img {
  width: 32px;
  height: 32px;
}

.contact-item.hotline {
  background: #cc2121;
  cursor: pointer;
}

.hotline-menu {
  position: absolute;
  right: 60px;
  bottom: 0;
  background: white;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 220px;
  border: 1px solid #eee;
  animation: slide-left 0.2s ease-out;
  z-index: 1001;
}

.hotline-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #333;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 0.2s;
  font-size: 15px;
  white-space: nowrap;
}

.hotline-link:hover {
  background: #f5f5f5;
  color: #cc2121;
}

.hotline-link i {
  color: #cc2121;
  font-size: 16px;
  width: 20px;
  text-align: center;
}

@keyframes slide-left {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Hotline specific animations */
.contact-item.hotline .phone-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(204, 33, 33, 0.2);
  border-radius: 50%;
  animation: phone-scale 1.5s infinite ease-in-out;
  z-index: -1;
}

.contact-item.hotline .phone-ring {
  position: absolute;
  width: 140%;
  height: 140%;
  border: 2px solid #cc2121;
  border-radius: 50%;
  animation: phone-ring-pulse 1.5s infinite ease-out;
  opacity: 0;
  z-index: -2;
}

.contact-item.hotline i {
  animation: phone-vibrate 1.5s infinite ease-in-out;
}

@keyframes phone-scale {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); box-shadow: 0 0 20px rgba(204, 33, 33, 0.6); }
  100% { transform: scale(1); }
}

@keyframes phone-ring-pulse {
  0% { transform: scale(0.7); opacity: 0.8; }
  100% { transform: scale(1.6); opacity: 0; }
}

@keyframes phone-vibrate {
  0%, 10%, 20%, 30%, 40%, 100% { transform: rotate(0deg); }
  5%, 15%, 25%, 35% { transform: rotate(15deg); }
  12%, 22%, 32% { transform: rotate(-15deg); }
}

@media (max-width: 768px) {
  .floating-contact-group {
    bottom: 20px;
    right: 15px; 
    gap: 12px;
  }
  .contact-item {
    width: 44px;
    height: 44px;
  }
  .contact-item.zalo img {
    width: 28px;
    height: 28px;
  }
  .hotline-menu {
    right: 52px;
    bottom: -5px;
    min-width: 190px;
    padding: 10px;
  }
  .hotline-link {
    font-size: 14px;
    padding: 6px 10px;
  }
}
</style>
