<template>
  <section class="auth-page container">
    <div class="auth-grid">
      <div class="hero-side">
        <div class="hero-logo">META.vn</div>
        <h2>ĐIỆN MÁY GIÁ CỰC TỐT<br/>HÀNG HIỆU CHÍNH HÃNG</h2>
        <div class="hero-icons">
          <span>DỊCH VỤ<br/>UY TÍN</span>
          <span>MIỄN PHÍ<br/>VẬN CHUYỂN</span>
          <span>GIAO HÀNG<br/>TOÀN QUỐC</span>
        </div>
        <div class="hero-appliances"></div>
      </div>

      <div class="form-card">
        <h1>Đăng ký</h1>

        <input type="text" placeholder="Nhập số điện thoại" />

        <div class="captcha-box">
          <div class="checkbox"></div>
          <p>Tôi không phải là người máy</p>
          <small>reCAPTCHA</small>
        </div>

        <p class="right-link"><a href="#">Đăng ký bằng email</a></p>

        <button class="main-btn" disabled>TIẾP THEO</button>

        <p class="switch-text">Bạn đã có tài khoản? <NuxtLink to="/auth/login">Đăng nhập</NuxtLink></p>

        <div class="divider">HOẶC</div>

        <button class="social-btn">Zalo Đăng ký bằng Zalo</button>
        <button class="social-btn">G Đăng ký bằng Google</button>

        <p class="policy">Khi Quý khách "Đăng ký" có nghĩa là đồng ý với <a href="#">các chính sách của META.vn</a>.</p>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  layout: 'auth'
})
</script>

<style scoped>
.auth-page {
  padding: 58px 10px;
}

.auth-grid {
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 30px;
  align-items: center;
  min-height: 680px;
}

.hero-side {
  color: #fff;
  text-align: center;
}

.hero-logo {
  font-size: 54px;
  font-weight: 900;
  margin-bottom: 12px;
}

.hero-side h2 {
  margin: 0;
  font-size: 44px;
  line-height: 1.25;
}

.hero-icons {
  margin: 20px auto;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  max-width: 520px;
}

.hero-icons span {
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  padding: 12px 6px;
  font-size: 15px;
}

.hero-appliances {
  margin: 20px auto 0;
  width: min(560px, 100%);
  height: 300px;
  border-radius: 18px;
  background:
    radial-gradient(circle at 20% 20%, #ffe082 0 12%, transparent 13%),
    radial-gradient(circle at 80% 30%, #80d8ff 0 15%, transparent 16%),
    linear-gradient(150deg, #fff, #d8e6ff);
}

.form-card {
  background: #f5f5f5;
  border-radius: 6px;
  padding: 20px;
}

h1 {
  margin: 0 0 16px;
  font-size: 37px;
  font-weight: 500;
}

input {
  width: 100%;
  border: 1px solid #bbb;
  border-radius: 4px;
  height: 48px;
  padding: 0 12px;
  margin-bottom: 10px;
  font-size: 29px;
}

.captcha-box {
  display: grid;
  grid-template-columns: 30px 1fr auto;
  align-items: center;
  gap: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  padding: 10px;
}

.checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid #666;
}

.captcha-box p {
  margin: 0;
  font-size: 29px;
}

.captcha-box small {
  color: #666;
  font-size: 23px;
}

.right-link {
  text-align: right;
  margin: 8px 0 14px;
}

.right-link a,
.switch-text a,
.policy a {
  color: #0a67c7;
  text-decoration: none;
}

.main-btn {
  width: 100%;
  border: none;
  border-radius: 6px;
  height: 52px;
  background: #ddd;
  color: #999;
  font-size: 39px;
  font-weight: 700;
}

.switch-text {
  text-align: center;
  margin: 14px 0;
  font-size: 31px;
}

.divider {
  text-align: center;
  margin: 10px 0;
  color: #888;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 42%;
  height: 1px;
  background: #ddd;
}

.divider::before { left: 0; }
.divider::after { right: 0; }

.social-btn {
  width: 100%;
  border: 1px solid #bbb;
  border-radius: 6px;
  background: #fff;
  height: 46px;
  margin-bottom: 8px;
  font-size: 29px;
}

.policy {
  margin: 12px 0 0;
  text-align: center;
  color: #555;
  font-size: 24px;
}

@media (max-width: 1200px) {
  .auth-grid {
    grid-template-columns: 1fr;
  }

  .hero-side {
    display: none;
  }

  h1 {
    font-size: 28px;
  }

  input,
  .captcha-box p,
  .captcha-box small,
  .main-btn,
  .switch-text,
  .social-btn,
  .policy {
    font-size: 14px;
  }
}
</style>
