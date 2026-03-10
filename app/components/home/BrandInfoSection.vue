<template>
  <section class="brand-info-section">
    <h4 class="brand-title">Thông tin thương hiệu Oshima</h4>
    <div class="brand-content">
      <div class="brand-logo-large">OSHIMA</div>
      <div class="brand-text">
        <p>
          <strong>Oshima</strong> là thương hiệu cung cấp hàng ngàn sản phẩm đến tay người tiêu dùng mỗi năm.
          Với các sản phẩm chủ đạo như: <a href="#">máy hàn</a>, <a href="#">máy bơm</a>, <a href="#">máy rửa xe</a>,
          máy cắt cỏ, máy nén khí,...
        </p>
        <p>
          Với mục tiêu cung cấp cho người tiêu dùng những sản phẩm công nghệ tiên tiến với giá thành phải chăng.
          Oshima cam kết hỗ trợ khách hàng dựa trên mục đích duy trì lợi ích lâu dài, luôn luôn thực hiện trách
          nhiệm của nhà cung cấp một cách triệt để nhất.
        </p>
        <p>Xem thêm <a href="#">trung tâm bảo hành Oshima</a> khi cần hỗ trợ.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.brand-info-section {
  background: #f9f9f9;
  border: 1px solid var(--border-color);
  padding: 20px;
}

.brand-title {
  font-size: 16px;
  margin-bottom: 16px;
}

.brand-content {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.brand-logo-large {
  border: 3px solid red;
  color: red;
  border-radius: 30px;
  padding: 10px 40px;
  font-size: 32px;
  font-weight: 900;
  background: white;
  flex-shrink: 0;
}

.brand-text p {
  margin-bottom: 10px;
  line-height: 1.6;
}

.brand-text a {
  color: var(--link-color);
}

@media (max-width: 1200px) {
  .brand-content {
    flex-direction: column;
    gap: 14px;
  }

  .brand-logo-large {
    font-size: 24px;
  }
}
</style>
