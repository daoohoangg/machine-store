<template>
  <div class="order-success-page">
    <section class="left">
      <div class="success-box">
        <h1>☑ Đặt hàng thành công</h1>
        <p>
          Cám ơn Quý khách đã mua hàng tại META.vn, đơn hàng số <strong>{{ orderId }}</strong>.
          Nếu cần hỗ trợ Quý khách vui lòng liên hệ:
        </p>
        <p>
          <strong>Hà Nội:</strong> <a href="#">024.3568.6969</a>
          <strong>TP.HCM:</strong> <a href="#">028.3833.6666</a>
        </p>
        <p>
          Thời gian giao hàng dự kiến: <strong>{{ deliveryEstimate }}</strong>
          (Không tính ngày nghỉ & ngày lễ, không bao gồm sản phẩm đặt hàng trước)
        </p>

        <div class="app-box">
          <div class="qr"></div>
          <div class="store-buttons">
            <button>App Store</button>
            <button>Google Play</button>
          </div>
        </div>

        <div class="action-row">
          <NuxtLink class="btn-link" to="/order/lookup">TRA CỨU ĐƠN HÀNG</NuxtLink>
          <button class="btn-link">ĐĂNG KÝ THÀNH VIÊN</button>
        </div>
      </div>

      <section class="order-info">
        <h2>Thông tin đơn hàng</h2>

        <div class="order-grid">
          <div class="customer-info">
            <p><strong>Số đơn hàng:</strong> {{ orderId }} <span class="date">Ngày: {{ orderDate }}</span></p>
            <p><strong>Tên khách hàng:</strong> {{ receiverName }}</p>
            <p><strong>Điện thoại:</strong> {{ maskedPhone }}</p>
            <p><strong>Email:</strong></p>
            <p><strong>Địa chỉ:</strong> {{ fullAddress }}</p>
          </div>

          <div class="items-info">
            <table>
              <thead>
                <tr>
                  <th>Tên sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in orderItems" :key="item.id">
                  <td>{{ item.title }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>{{ formatPrice(item.price * item.quantity) }}đ</td>
                </tr>
              </tbody>
            </table>

            <div class="summary">
              <p><span>Tổng cộng:</span> <strong>{{ formatPrice(displaySubtotal) }}đ</strong></p>
              <p><span>Phí vận chuyển:</span> <strong>-</strong></p>
              <p><span>Thuế:</span> <strong>Đã gồm VAT</strong></p>
              <p class="paid"><span>Thanh toán:</span> <strong>{{ formatPrice(displayTotal) }}đ</strong></p>
            </div>
          </div>
        </div>
      </section>

      <section class="warning-box">
        <h3>⚠ CẢNH BÁO LỪA ĐẢO</h3>
        <p>Để tránh mất tiền vào tay kẻ lừa đảo mạo danh shipper (Nhân viên giao hàng), Quý khách tuyệt đối:</p>
        <ul>
          <li>KHÔNG chuyển khoản cho shipper khi chưa nhận hàng.</li>
          <li>KHÔNG thanh toán bất kỳ phụ phí nào phát sinh khi chưa có xác nhận từ tổng đài META.vn.</li>
          <li>KHÔNG nhập vào đường link lạ của shipper gửi.</li>
        </ul>
        <p>
          Nếu cần hỗ trợ về đơn hàng <strong>{{ orderId }}</strong> Quý khách vui lòng liên hệ:
          <strong>Hà Nội:</strong> 024.3568.6969 - <strong>TP.HCM:</strong> 028.3833.6666
        </p>
      </section>

    </section>

    <aside class="right">
      <div class="panel">
        <h4>Hỗ trợ khách hàng</h4>
        <p>☎ 024.3568.6969 - Phía Bắc & Trung</p>
        <p>☎ 028.3833.6666 - Phía Nam</p>
        <p><strong>Hà Nội:</strong> 56 Duy Tân, Phường Cầu Giấy</p>
        <p><strong>TP.HCM:</strong> 716-718 Điện Biên Phủ, Phường Vườn Lài</p>
      </div>

      <div class="panel">
        <h4>Chat với chúng tôi</h4>
        <p>meta.vn</p>
        <p>Chat Zalo</p>
      </div>

      <div class="panel">
        <h4>Chăm sóc khách hàng</h4>
        <p>Góp ý, khiếu nại: (8h00 - 17h30)</p>
        <p>Toàn quốc: (028) 3833 3222</p>
        <p>Email: care@meta.vn</p>
      </div>
    </aside>

    <section class="full-width">
      <OrderFeaturedCategories />
      <OrderRecommendedProducts />
      <OrderFlashSaleStrip />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrderFeaturedCategories from '~/components/order/FeaturedCategories.vue'
import OrderRecommendedProducts from '~/components/order/RecommendedProducts.vue'
import OrderFlashSaleStrip from '~/components/order/FlashSaleStrip.vue'
import { useOrder } from '~/composables/useOrder'

definePageMeta({
  layout: 'checkout'
})

const { currentOrder, subtotal, total } = useOrder()

const fallbackDate = '10/03/2026'

const orderId = computed(() => currentOrder.value?.id || '207585284')
const fallbackItems = [
  { id: '1', title: 'Máy cắt cỏ 2 thì Oshima TJ53', quantity: 1, price: 3440000 },
  { id: '2', title: 'Áo thun', quantity: 1, price: 0 }
]

const orderItems = computed(() => {
  if (currentOrder.value?.items?.length) return currentOrder.value.items
  return fallbackItems
})

const receiverName = computed(() => currentOrder.value?.receiver.fullName || 'Đào Trung Hoàng')
const phoneRaw = computed(() => currentOrder.value?.receiver.phone || '0********8')
const fullAddress = computed(() => {
  if (!currentOrder.value) return 'fpt.edu.vn, Phường Đông Ngạc, Quận Bắc Từ Liêm, Hà Nội'

  const r = currentOrder.value.receiver
  return [r.address, r.ward, r.district, r.city].filter(Boolean).join(', ')
})

const orderDate = computed(() => {
  if (!currentOrder.value) return `${fallbackDate} (23:31)`

  const d = new Date(currentOrder.value.createdAt)
  return `${d.toLocaleDateString('vi-VN')} (${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`
})

const deliveryEstimate = computed(() => '11/03/2026 - 15/03/2026')

const maskedPhone = computed(() => {
  const phone = phoneRaw.value
  if (phone.length < 4) return phone
  return `${phone.slice(0, 2)}******${phone.slice(-2)}`
})

const displaySubtotal = computed(() => subtotal.value || 3440000)
const displayTotal = computed(() => total.value || 3440000)

const formatPrice = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
</script>

<style scoped>
.order-success-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 12px;
  align-items: start;
}

.left,
.right {
  min-width: 0;
}

.left {
  overflow: hidden;
}

.full-width {
  grid-column: 1 / -1;
  min-width: 0;
}

.success-box,
.order-info,
.warning-box,
.panel {
  border: 1px solid #d6d6d6;
  background: #fff;
}

.success-box {
  padding: 12px;
}

h1 {
  margin: 0 0 10px;
  font-size: 20px;
  color: #0d6dc4;
}

.success-box p {
  margin: 6px 0;
  line-height: 1.5;
}

.success-box a {
  color: #0d6dc4;
  text-decoration: none;
}

.app-box {
  margin: 10px 0;
  display: flex;
  justify-content: center;
  gap: 14px;
}

.qr {
  width: 100px;
  height: 100px;
  background:
    linear-gradient(90deg, #000 50%, #fff 0) 0 0/10px 10px,
    linear-gradient(#000 50%, #fff 0) 0 0/10px 10px;
}

.store-buttons {
  display: grid;
  gap: 8px;
}

.store-buttons button {
  border: 1px solid #aaa;
  background: #fff;
  border-radius: 8px;
  padding: 8px 16px;
}

.action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn-link {
  border: none;
  background: #4da4df;
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  font-weight: 600;
}

.order-info {
  margin-top: 10px;
}

.order-info h2 {
  margin: 0;
  padding: 8px;
  text-align: center;
  font-size: 20px;
  background: #f3f3f3;
  border-bottom: 1px solid #d6d6d6;
}

.order-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 10px;
  padding: 10px;
}

.customer-info p {
  margin: 6px 0;
}

.date {
  margin-left: 6px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #d6d6d6;
  padding: 6px;
}

th {
  background: #f7f7f7;
}

.summary {
  width: 300px;
  margin-left: auto;
  margin-top: 8px;
}

.summary p {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
}

.paid {
  font-size: 16px;
}

.warning-box {
  margin-top: 10px;
  background: #f5fbc8;
  border-color: #d65959;
  padding: 10px;
}

.warning-box h3 {
  margin: 0 0 8px;
  color: #c11d1d;
  font-size: 18px;
}

.warning-box ul {
  margin: 8px 0;
  padding-left: 18px;
}

.panel {
  margin-bottom: 10px;
  padding: 10px;
}

.panel h4 {
  margin: 0 0 8px;
  font-size: 20px;
  text-align: center;
}

.panel p {
  margin: 6px 0;
  line-height: 1.45;
}

@media (max-width: 1200px) {
  .order-success-page {
    grid-template-columns: 1fr;
  }

  .order-grid {
    grid-template-columns: 1fr;
  }

  .action-row {
    grid-template-columns: 1fr;
  }

  .summary {
    width: 100%;
  }

  .order-info h2,
  .panel h4 {
    font-size: 20px;
  }

  .warning-box h3,
  .paid {
    font-size: 16px;
  }

}
</style>
