<template>
  <div class="order-success-wrapper">
    <div class="success-header-card">
      <div class="success-icon">
        <div class="circle-outer">
          <div class="circle-inner">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2dd4bf" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
      </div>
      <h1>Đặt hàng thành công!</h1>
      <p class="subtitle">Cảm ơn bạn đã đặt hàng tại Tuấn Minh. Đơn hàng của bạn sẽ được xử lý trong thời gian sớm nhất.</p>
      <p class="order-number-text">Vui lòng ghi nhớ mã số đơn hàng của bạn là <strong class="order-id">{{ orderId }}</strong></p>
      <p class="email-text">Bạn sẽ sớm nhận được thông báo xác nhận đơn hàng của mình.</p>

      <div class="action-buttons">
        <NuxtLink to="/" class="btn btn-secondary">Tiếp tục mua sắm</NuxtLink>
        <NuxtLink to="/order/lookup" class="btn btn-primary">Tra cứu đơn hàng</NuxtLink>
      </div>
    </div>

    <div class="order-success-page">
      <section class="left">
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
            <li>KHÔNG thanh toán bất kỳ phụ phí nào phát sinh khi chưa có xác nhận từ tổng đài Tuấn Minh.</li>
            <li>KHÔNG nhập vào đường link lạ của shipper gửi.</li>
          </ul>
            Nếu cần hỗ trợ về đơn hàng <strong>{{ orderId }}</strong> Quý khách vui lòng liên hệ hotline:
            <strong>{{ settings.hotline }}</strong>
        </section>

      </section>

      <aside class="right">
        <div class="panel app-download-panel">
          <h4>Tải ứng dụng</h4>
          <div class="app-box">
            <div class="qr"></div>
            <div class="store-buttons">
              <button>Tải trên App Store</button>
              <button>Tải trên Google Play</button>
            </div>
          </div>
        </div>

        <div class="panel">
          <h4>Hỗ trợ khách hàng</h4>
          <p>☎ Hotline: {{ settings.hotline }}</p>
          <p><strong>Địa chỉ:</strong> {{ settings.address }}</p>
        </div>

        <div class="panel">
          <h4>Chat với chúng tôi</h4>
          <p><a href="https://huspanda.vn/" target="_blank" style="color: #0d6dc4; text-decoration: none;">huspanda.vn</a></p>
        </div>

        <div class="panel">
          <h4>Chăm sóc khách hàng</h4>
          <p>Góp ý, khiếu nại: (8h00 - 17h30)</p>
          <p>Toàn quốc: {{ settings.hotline }}</p>
          <p>Email: {{ settings.email }}</p>
        </div>
      </aside>

      <section class="full-width">
        <OrderOutletShopStrip />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import OrderOutletShopStrip from '~/components/order/OutletShopStrip.vue'
import { useOrder } from '~/composables/useOrder'
import { useSiteSettings } from '~/composables/useSiteSettings'

definePageMeta({
  layout: 'checkout'
})

const { currentOrder, subtotal, total } = useOrder()
const { settings } = useSiteSettings()

const orderId = computed(() => currentOrder.value?.id || 'TM-' + Date.now().toString().slice(-6))

const orderItems = computed(() => {
  if (currentOrder.value?.items?.length) return currentOrder.value.items
  return []
})

const receiverName = computed(() => currentOrder.value?.receiver.fullName || 'Khách hàng')
const phoneRaw = computed(() => currentOrder.value?.receiver.phone || '')
const fullAddress = computed(() => {
  if (!currentOrder.value) return 'Đang cập nhật...'

  const r = currentOrder.value.receiver
  return r.address
})

const orderDate = computed(() => {
  const d = currentOrder.value ? new Date(currentOrder.value.createdAt) : new Date()
  return `${d.toLocaleDateString('vi-VN')} (${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})`
})

const deliveryEstimate = computed(() => {
  const d = currentOrder.value ? new Date(currentOrder.value.createdAt) : new Date()
  const start = new Date(d)
  start.setDate(d.getDate() + 1)
  const end = new Date(d)
  end.setDate(d.getDate() + 3)
  
  return `${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`
})

const maskedPhone = computed(() => {
  const phone = phoneRaw.value
  if (!phone) return '...'
  if (phone.length < 4) return phone
  return `${phone.slice(0, 3)}****${phone.slice(-3)}`
})

const displaySubtotal = computed(() => subtotal.value || 0)
const displayTotal = computed(() => total.value || 0)

const formatPrice = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
</script>

<style scoped>
.order-success-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.success-header-card {
  text-align: center;
  padding: 50px 20px;
  background: #ffffff;
  border-radius: 12px;
  margin-bottom: 24px;
}

.success-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.circle-outer {
  width: 90px;
  height: 90px;
  background-color: #f5f6fa; /* very light gray/blue */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle-inner {
  width: 60px;
  height: 60px;
  background-color: #ffffff;
  border-radius: 50%;
  border: 3px solid #7c62e4; /* purple/blue rim */
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* Offset teal border/shadow effect */
.circle-inner::after {
  content: '';
  position: absolute;
  top: -3px; left: -3px; right: -3px; bottom: -3px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-bottom-color: #2dd4bf; /* teal */
  border-right-color: #2dd4bf;
  transform: rotate(15deg);
  pointer-events: none;
}

.success-header-card h1 {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 16px;
  border: none;
  background: transparent;
  padding: 0;
}

.success-header-card p {
  color: #6b7280;
  font-size: 16px;
  margin: 0 0 8px;
  line-height: 1.5;
}

.order-id {
  color: #111827;
  font-weight: 700;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-secondary {
  background-color: #f8f9fa;
  color: #111827;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-primary {
  background-color: #1a2b4c;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #111c33;
}

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

.order-info,
.warning-box,
.panel {
  border: 1px solid #d6d6d6;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.app-download-panel .app-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-top: 10px;
}

.qr {
  width: 100px;
  height: 100px;
  background:
    linear-gradient(90deg, #000 50%, #fff 0) 0 0/10px 10px,
    linear-gradient(#000 50%, #fff 0) 0 0/10px 10px;
}

.store-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.store-buttons button {
  border: 1px solid #aaa;
  background: #fff;
  border-radius: 8px;
  padding: 8px 16px;
  width: 100%;
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
