<template>
  <div class="order-lookup-page">
    <section class="left">
      <div class="lookup-box">
        <h1>Tra cứu đơn hàng</h1>

        <div class="form-row">
          <label>Số đơn hàng (Mã vận đơn)</label>
          <input v-model="lookupId" type="text" placeholder="Số đơn hàng" />
        </div>
        <div class="form-row">
          <label>Số điện thoại đặt hàng</label>
          <input v-model="lookupPhone" type="text" placeholder="Nhập số điện thoại đặt hàng" />
        </div>

        <button class="search-btn" @click="searched = true">Tra cứu</button>
      </div>

      <div v-if="searched" class="order-box">
        <h2>Thông tin đơn hàng</h2>

        <div class="order-content">
          <h3>Đơn hàng đang xử lý</h3>
          <p>Số đơn hàng: {{ orderId }}</p>

          <h3>Thông tin người nhận</h3>
          <p>Họ tên: {{ maskedName }}</p>
          <p>Điện thoại: {{ maskedPhone }}</p>
          <p>Địa chỉ: {{ fullAddress }}</p>

          <h3>Thông tin sản phẩm</h3>
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

          <div class="sum">
            <p><span>Tổng tiền hàng:</span> <strong>{{ formatPrice(displaySubtotal) }}đ</strong></p>
            <p><span>Phí vận chuyển:</span> <strong>-</strong></p>
            <p class="total"><span>Thanh toán:</span> <strong>{{ formatPrice(displayTotal) }}đ</strong></p>
          </div>

          <div class="actions">
            <button class="reorder">Đặt hàng lại</button>
          </div>

          <textarea rows="2" placeholder="Để lại lời nhắn cho Tuấn Minh (nếu có)..."></textarea>

          <h3>Tiến trình giao hàng</h3>
          <div class="timeline-top">
            <p><strong>Gửi từ:</strong> Tuấn Minh</p>
            <p><strong>Đến:</strong> Quận Bắc Từ Liêm, Hà Nội</p>
            <p><strong>Thời gian giao hàng dự kiến:</strong> 11/03/2026 - 15/03/2026 (Không tính ngày nghỉ & ngày lễ, không bao gồm sản phẩm đặt hàng trước)</p>
          </div>

          <div class="timeline-item">
            <span class="date">Thứ 3, 10/03/2026</span>
            <div class="dot"></div>
            <p>23:31 | Đặt hàng</p>
          </div>

          <div class="actions">
            <NuxtLink class="reorder" to="/">Tiếp tục mua hàng</NuxtLink>
          </div>
        </div>
      </div>

      <OrderFeaturedCategories />
    </section>

    <aside class="right">
      <div class="panel" v-for="box in rightBoxes" :key="box.title">
        <h4>{{ box.title }}</h4>
        <ul>
          <li v-for="item in box.items" :key="item">{{ item }}</li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import OrderFeaturedCategories from '~/components/order/FeaturedCategories.vue'
import { useOrder } from '~/composables/useOrder'

definePageMeta({
  layout: 'order'
})

const { currentOrder, subtotal, total } = useOrder()

const searched = ref(true)

const lookupId = ref(currentOrder.value?.id || '207585284')
const lookupPhone = ref(currentOrder.value?.receiver.phone || '')

const orderId = computed(() => currentOrder.value?.id || lookupId.value)
const fallbackItems = [
  { id: '1', title: 'Máy cắt cỏ 2 thì Oshima TJ53', quantity: 1, price: 3440000 },
  { id: '2', title: 'Áo thun', quantity: 1, price: 0 }
]

const orderItems = computed(() => {
  if (currentOrder.value?.items?.length) return currentOrder.value.items
  return fallbackItems
})

const fullAddress = computed(() => {
  if (!currentOrder.value) return '**** Quận Bắc Từ Liêm, Hà Nội'
  const r = currentOrder.value.receiver
  return [r.address, r.ward, r.district, r.city].filter(Boolean).join(', ')
})

const maskedPhone = computed(() => {
  const phone = currentOrder.value?.receiver.phone || '*********'
  if (phone.length < 4) return phone
  return `${phone.slice(0, 2)}******${phone.slice(-1)}`
})

const maskedName = computed(() => {
  const name = currentOrder.value?.receiver.fullName || '******ung******'
  if (name.length < 4) return name
  return `${name.slice(0, 2)}****${name.slice(-2)}`
})

const rightBoxes = [
  {
    title: 'Thông tin Công ty',
    items: ['Giới thiệu về Tuấn Minh', 'Liên hệ', 'Tuyển dụng']
  },
  {
    title: 'Chính sách và quy định',
    items: [
      'Chính sách và quy định chung',
      'Chính sách bán hàng & Chất lượng hàng hóa',
      'Giao nhận hàng hóa',
      'Chính sách Đổi - Trả hàng hóa',
      'Bảo mật dữ liệu cá nhân',
      'Quy định về đặt cọc và giữ hàng',
      'Khiếu nại bồi thường',
      'Điều khoản thanh toán trả góp',
      'Khu vực miễn phí vận chuyển'
    ]
  },
  {
    title: 'Bảo hành và Khiếu nại',
    items: ['Chính sách bảo hành', 'Khiếu nại bồi thường', 'Tra cứu địa chỉ bảo hành', 'Kiểm tra tiến độ bảo hành']
  },
  {
    title: 'Hỗ trợ khách hàng',
    items: [
      'Hướng dẫn mua hàng',
      'Hình thức thanh toán',
      'Hướng dẫn mua trả góp',
      'Hướng dẫn mua trước trả sau',
      'Hướng dẫn tìm kiếm sản phẩm',
      'Hướng dẫn hủy đơn hàng',
      'Tra cứu đơn hàng'
    ]
  },
  {
    title: 'Thông tin về hoá đơn GTGT điện tử',
    items: [
      'Thông báo sử dụng hóa đơn điện tử',
      'Hóa đơn điện tử là gì?',
      'Thông tư, Quyết định về hóa đơn điện tử',
      'Biên bản điều chỉnh, hủy, thu hồi hóa đơn',
      'Hướng dẫn tra cứu hóa đơn'
    ]
  }
]

const formatPrice = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const displaySubtotal = computed(() => subtotal.value || 3440000)
const displayTotal = computed(() => total.value || 3440000)
</script>

<style scoped>
.order-lookup-page {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 12px;
}

.lookup-box,
.order-box,
.panel {
  background: #fff;
  border: 1px solid #d4d4d4;
}

.lookup-box {
  padding: 12px;
}

h1 {
  margin: 0 0 12px;
  font-size: 19px;
}

.form-row {
  max-width: 620px;
  margin: 10px auto;
  display: grid;
  grid-template-columns: 230px 1fr;
  align-items: center;
  gap: 8px;
}

input,
textarea {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px 10px;
  font-size: 14px;
}

.search-btn {
  display: block;
  margin: 16px auto 6px;
  width: 180px;
  border: none;
  background: #0f6eb9;
  color: #fff;
  padding: 8px 10px;
  border-radius: 4px;
  font-weight: 600;
}

.order-box {
  margin-top: 10px;
}

h2 {
  margin: 0;
  padding: 8px 12px;
  background: #ededed;
  font-size: 18px;
}

.order-content {
  padding: 12px;
}

.order-content h3 {
  margin: 0 0 6px;
  font-size: 18px;
}

.order-content p {
  margin: 6px 0;
}

table {
  margin-top: 8px;
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #d4d4d4;
  padding: 6px;
}

th {
  background: #f2f2f2;
}

.sum {
  margin-top: 8px;
  width: 320px;
  margin-left: auto;
}

.sum p {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
}

.sum .total {
  font-weight: 700;
}

.actions {
  text-align: center;
  margin: 12px 0;
}

.reorder {
  display: inline-block;
  border: none;
  background: #e12626;
  color: #fff;
  padding: 8px 30px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
}

.timeline-top {
  margin-top: 8px;
  background: #35a847;
  color: #fff;
  border-radius: 4px;
  padding: 8px;
}

.timeline-item {
  margin-top: 10px;
  position: relative;
  padding-left: 52px;
  min-height: 56px;
}

.timeline-item .date {
  display: inline-block;
  background: #c1c4cb;
  padding: 4px 8px;
  border-radius: 4px;
  color: #fff;
}

.timeline-item .dot {
  position: absolute;
  left: 24px;
  top: 26px;
  bottom: 0;
  width: 4px;
  background: #3ba84a;
}

.panel {
  margin-bottom: 10px;
  padding: 10px;
}

.panel h4 {
  margin: 0 0 8px;
  font-size: 21px;
  text-align: center;
}

.panel ul {
  margin: 0;
  padding-left: 14px;
}

.panel li {
  margin: 8px 0;
  line-height: 1.4;
}

@media (max-width: 1200px) {
  .order-lookup-page {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .sum {
    width: 100%;
  }

  .order-content h3,
  .panel h4 {
    font-size: 18px;
  }
}
</style>
