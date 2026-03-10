<template>
  <aside class="app-sidebar">
    <div class="brand-section">
      <div class="brand-title">THƯƠNG HIỆU</div>
      <div class="brand-logo">
        <div class="mock-logo">OSHIMA</div>
      </div>
    </div>
    
    <div class="filter-section">
      <h3 class="filter-title">TÌM THEO DANH MỤC</h3>
      <ul class="category-list">
        <li>👉 Máy phát điện Oshima <span>(7)</span></li>
        <li>👉 Máy nổ, Đầu nổ Oshima <span>(1)</span></li>
        <li>👉 Máy khoan Oshima <span>(20)</span></li>
        <li>👉 Máy rửa xe Oshima <span>(13)</span></li>
        <li>👉 Máy nông nghiệp Oshima <span>(83)</span></li>
        <li>👉 Máy bơm nước Oshima <span>(12)</span></li>
        <li>👉 Thang nhôm Oshima <span>(7)</span></li>
        <li>👉 Máy tời, Pa lăng Oshima <span>(4)</span></li>
        <li>👉 Dụng cụ đa năng Oshima <span>(2)</span></li>
        <li>👉 Máy nén khí Oshima <span>(4)</span></li>
        <li>👉 Máy hàn điện tử Oshima <span>(13)</span></li>
        <li>👉 Máy cưa, Máy cắt gỗ Oshima <span>(24)</span></li>
      </ul>
      <div class="view-more">Xem thêm ⌄</div>
    </div>

    <div class="filter-section">
      <h3 class="filter-title">KHOẢNG GIÁ (VND)</h3>
      <ul class="price-list">
        <li><input type="checkbox"/> Dưới 100K <span>(1)</span></li>
        <li><input type="checkbox"/> 100K - 200K <span>(5)</span></li>
        <li><input type="checkbox"/> 200K - 500K <span>(17)</span></li>
        <li><input type="checkbox"/> 500K - 1 triệu <span>(103)</span></li>
        <li><input type="checkbox"/> 1 triệu - 1,5 triệu <span>(100)</span></li>
        <li><input type="checkbox"/> 1,5 triệu - 2 triệu <span>(89)</span></li>
        <li><input type="checkbox"/> 2 triệu - 3 triệu <span>(200)</span></li>
        <li><input type="checkbox"/> 3 triệu - 5 triệu <span>(157)</span></li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: var(--sidebar-w);
  background: white;
  border-right: 1px solid var(--border-color);
  padding: 15px;
}
.brand-section {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}
.brand-title {
  font-size: 13px;
  color: #333;
  font-weight: bold;
  margin-bottom: 10px;
}
.mock-logo {
  border: 2px solid red;
  border-radius: 20px;
  color: red;
  font-weight: bold;
  font-size: 24px;
  padding: 5px 20px;
  display: inline-block;
}
.filter-section {
  margin-top: 20px;
}
.filter-title {
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 10px;
  text-transform: uppercase;
}
.category-list li, .price-list li {
  font-size: 13px;
  padding: 6px 0;
  color: #333;
  display: flex;
  align-items: center;
  cursor: pointer;
}
.category-list li:hover, .price-list li:hover {
  color: var(--link-color);
}
.category-list li span, .price-list li span {
  color: #999;
  margin-left: 4px;
}
.price-list input {
  margin-right: 8px;
}
.view-more {
  color: var(--link-color);
  font-size: 12px;
  text-align: center;
  margin-top: 10px;
  cursor: pointer;
}
</style>
