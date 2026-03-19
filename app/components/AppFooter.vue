<script setup>
import { useSiteSettings } from '~/composables/useSiteSettings'
const { settings } = useSiteSettings()
</script>

<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-bg-wrapper">
    <!-- Service Badges -->
    <div class="service-badges">
      <div class="footer-inner-content badges-grid">
        <div class="badge-item">
          <span class="icon"><img src="https://meta.vn/images/icons/dich-vu-uy-tin-icon.svg" alt="Uy tín" class="badge-icon" /></span> Dịch vụ uy tín
        </div>
        <div class="badge-item">
          <span class="icon"><img src="https://meta.vn/images/icons/doi-tra-hang-icon.svg" alt="Đổi trả" class="badge-icon" /></span> Đổi trả trong 7 ngày
        </div>
        <div class="badge-item">
          <span class="icon truck-icon"><i class="fa-solid fa-truck"></i></span> Giao hàng toàn quốc
        </div>
      </div>
    </div>

    <!-- Footer Links -->
    <div class="footer-links-section">
      <div class="footer-inner-content links-grid">
        <!-- Column 1 -->
        <div class="footer-col">
          <h5>Tổng đài hỗ trợ</h5>
          <div class="contact-block">
            <p><strong>📞 Hotline</strong></p>
            <p>Mua hàng: <a :href="'tel:' + settings.hotline.replace(/[^0-9]/g, '')" class="phone-link">{{ settings.hotline }}</a></p>
            <p>Kỹ thuật: <a :href="'tel:' + settings.hotline.replace(/[^0-9]/g, '')" class="phone-link">{{ settings.hotline }}</a></p>
          </div>
          <div class="contact-block">
            <p><strong>🕒 Thời gian</strong></p>
            <p>8h - 17h30 (Thứ 2 - Thứ 7)</p>
            <p class="zalo-chat">
              Chat Zalo 
              <img src="https://meta.vn/images/icons/zalo.svg" alt="Zalo" class="zalo-icon-img" />
            </p>
          </div>
        </div>

        <!-- Column 2 -->
        <div class="footer-col">
          <h5>Hỗ trợ khách hàng</h5>
          <ul>
            <li><NuxtLink to="/chinh-sach?tab=thanh-toan">Chính Sách Thanh Toán</NuxtLink></li>
            <li><NuxtLink to="/chinh-sach?tab=khach-hang">Chính Sách Khách Hàng</NuxtLink></li>
            <li><NuxtLink to="/chinh-sach?tab=doi-tra">Chính Sách Đổi Trả</NuxtLink></li>
            <li><NuxtLink to="/chinh-sach?tab=giao-hang">Chính Sách Giao Hàng</NuxtLink></li>
          </ul>
        </div>

        <!-- Column 3 -->
        <div class="footer-col">
          <h5>Quản lý tài khoản</h5>
          <ul>
            <li><a href="#">Thay đổi thông tin</a></li>
            <li><a href="#">Lấy lại mật khẩu</a></li>
            <li><a href="#">Tra cứu đơn hàng</a></li>
            <li><a href="#">Quản lý giỏ hàng</a></li>
          </ul>
        </div>

        <!-- Column 4 -->
        <div class="footer-col">
          <h5>Về Tuấn Minh</h5>
          <ul>
            <li><a href="#">Giới thiệu về Tuấn Minh</a></li>
            <li><a href="#">Liên hệ</a></li>
            <li><a href="#">Tuyển dụng</a></li>
            <li><a href="#">Sơ đồ website</a></li>
            <li><a href="#">Đối tác doanh nghiệp</a></li>
          </ul>
        </div>

        <!-- Column 5 -->
        <div class="footer-col">
          <h5>Kết nối với chúng tôi</h5>
          <ul class="social-links">
            <li><a :href="settings.zalo"><img src="https://meta.vn/images/icons/zalo.svg" alt="Zalo" class="social-icon-img" /> Zalo</a></li>
            <li><a :href="settings.facebook"><img src="https://meta.vn/images/icons/facebook-icon.svg" alt="Facebook" class="social-icon-img" /> Facebook</a></li>
            <li><a :href="settings.youtube"><img src="https://meta.vn/images/icons/youtube-icon.svg" alt="Youtube" class="social-icon-img" /> Youtube</a></li>
            <li><a :href="settings.tiktok"><img src="https://meta.vn/Data/2025/Thang06/tiktok-meta.svg" alt="Tiktok" class="social-icon-img" /> Tiktok</a></li>
          </ul>
          <div class="language-dropdown">
            Ngôn ngữ
          </div>
        </div>
      </div>
    </div>

    <!-- App Download & Company Info -->
    <div class="company-info-section">
      <div class="footer-inner-content">
        <div class="app-download-row">
          <span>Tải app Tuấn Minh nhận ưu đãi</span>
          <div class="app-badges">
            <a href="https://apps.apple.com/vn/app/tu%E1%BA%A5n-minh-%C4%91i%E1%BB%87n-m%C3%A1y/id6757415380?l=vi" class="app-store-link" target="_blank">
              <span class="app-store">
                <img src="https://meta.vn/images/icons/apple-icon.svg" alt="Apple" class="apple-icon" />
                App Store
              </span>
            </a>
            <div class="qr-wrapper">
              <img src="~/assets/img/image.png" alt="App QR" class="app-qr-img" />
            </div>
          </div>
          <div class="bct-logo">
            <img src="https://meta.vn/images/bo-cong-thuong.png" alt="Bộ Công Thương" class="bct-img" />
          </div>
        </div>
        
        <div class="company-details-grid">
          <div class="company-desc">
            <h4>HỆ THỐNG MÁY NÔNG NGHIỆP TUẤN MINH</h4>
            <p>Trải qua 19 năm Uy tín cung cấp Dịch vụ Bán hàng & Thu tiền tại nhà toàn quốc</p>
            <p>Giấy chứng nhận ĐKDN số <strong>0102196915</strong> do Sở KH&ĐT TP. Hà Nội cấp ngày 29/03/2007.</p>
          </div>
          <div class="company-address">
            <p><strong>Địa chỉ:</strong> {{ settings.address }}</p>
            <p><strong>Điện thoại:</strong> {{ settings.hotline }}</p>
            <p><strong>Email:</strong> {{ settings.email }}</p>
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: 0;
  font-size: 13px;
  color: #333;
}
.footer-bg-wrapper {
  background: white;
  border-radius: 0 0 4px 4px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  /* The layout above it has a 240px sidebar + 15px gap that we need to skip */
}
.footer-inner-content {
  padding: 0 15px; 
  max-width: 100%;
}
.app-footer a {
  color: #333;
}
.app-footer a:hover {
  color: var(--link-color);
}

/* Service Badges */
.service-badges {
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);
}
.badges-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  text-align: center;
}
.badge-item {
  font-size: 20px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.icon {
  font-size: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.badge-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}
.truck-icon {
  color: #e31b1b;
}

/* Footer Links */
.footer-links-section {
  padding: 40px 0;
}
.links-grid {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr;
  gap: 20px;
}
.footer-col h5 {
  font-size: 14px;
  margin-bottom: 15px;
  color: #333;
}
.footer-col ul li {
  margin-bottom: 10px;
}
.contact-block {
  margin-bottom: 15px;
}
.contact-block p {
  margin-bottom: 5px;
}
.phone-link {
  color: var(--link-color) !important;
  font-weight: bold;
}
.zalo-chat {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  font-weight: bold;
}
.zalo-icon-img {
  width: 24px;
  height: 24px;
}

/* Social Links */
.social-links li a {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}
.social-icon-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.social-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}
.social-icon.zalo { background: #0068ff; }
.social-icon.fb { background: #1877f2; }
.social-icon.yt { background: #ff0000; }
.social-icon.tt { background: #000000; }
.language-dropdown {
  margin-top: 20px;
  color: var(--link-color);
  cursor: pointer;
}

/* Company Info */
.company-info-section {
  border-top: 1px solid var(--border-color);
  padding: 20px 0 40px;
}
.app-download-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}
.app-download-row > span {
  font-size: 16px;
  font-weight: bold;
}
.app-badges {
  display: flex;
  align-items: center;
  gap: 20px;
}
.qr-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.app-qr-img {
  width: 140px;
  height: 140px;
  background: #fff;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.app-store-link {
  text-decoration: none;
}
.app-store {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #000;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s;
  font-size: 16px;
}
.apple-icon {
  width: 24px;
  height: 24px;
}
.app-store:hover {
  color: #d82323;
}
.qr-hint {
  font-size: 10px;
  color: #666;
}
.bct-logo {
  margin-left: auto;
}
.bct-img {
  height: 45px;
  width: auto;
  object-fit: contain;
}

.company-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  color: #666;
}
.company-desc h4 {
  color: #333;
  margin-bottom: 10px;
}
.company-desc p {
  margin-bottom: 5px;
}
.company-address p {
  margin-bottom: 10px;
  line-height: 1.5;
}

@media (max-width: 992px) {
  .links-grid {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }
  .company-details-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .badges-grid {
    grid-template-columns: 1fr;
    gap: 15px;
    text-align: left;
  }
  .badge-item {
    justify-content: flex-start;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .app-download-row {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .bct-logo {
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>
