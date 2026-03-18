<template>
  <section class="home-feature-banner">
    <div class="container">
      <div class="feature-grid">
        <div class="feature-item">
          <div class="feature-icon">
            <i class="fa-solid fa-arrow-rotate-left"></i>
          </div>
          <div class="feature-text">
            <strong>BẢO HÀNH TẠI NHÀ</strong>
            <span>Yên tâm mua sắm</span>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <i class="fa-solid fa-truck-fast"></i>
          </div>
          <div class="feature-text">
            <strong>VẬN CHUYỂN TOÀN QUỐC</strong>
            <span>An toàn - Nhanh chóng</span>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <i class="fa-solid fa-award"></i>
          </div>
          <div class="feature-text">
            <strong>HÀNG CHÍNH HÃNG</strong>
            <span>Cam kết 100%</span>
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <i class="fa-solid fa-boxes-stacked"></i>
          </div>
          <div class="feature-text">
            <strong>SẴN HÀNG - ĐỦ LỰA CHỌN</strong>
            <span>Liên hệ tư vấn 24/24</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// This component now acts as a static feature banner
</script>

<style scoped>
.home-feature-banner {
  background: #fff;
  padding: 15px 0;
  margin-bottom: 20px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  border: 1px solid #dcdcdc;
  background: #fff;
  gap: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.feature-item:hover {
  border-color: #da251d;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid #da251d;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #da251d;
  font-size: 22px;
  flex-shrink: 0;
}

.feature-text {
  display: flex;
  flex-direction: column;
}

.feature-text strong {
  font-size: 15px;
  font-weight: 900;
  color: #222;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: -0.2px;
  line-height: 1.2;
}

.feature-text span {
  font-size: 13px;
  color: #666;
  font-style: italic;
  line-height: 1;
  font-weight: 500;
  letter-spacing: 0.3px;
}

@media (max-width: 1200px) {
  .feature-text strong {
    font-size: 13px;
  }
  .feature-text span {
    font-size: 12px;
  }
}

@media (max-width: 992px) {
  .feature-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .home-feature-banner {
    padding-top: 0 !important;
    margin-top: 0 !important;
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
  }
}

@media (max-width: 576px) {
  .home-feature-banner {
    padding-top: 0 !important; 
    margin-top: 0 !important;
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
  }
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .feature-item {
    padding: 12px 16px;
  }
}
</style>
