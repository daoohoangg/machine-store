<template>
  <div class="orders-page">
    <div class="orders-card">
      <div class="header-back">
        <button class="back-btn" @click="$router.push('/auth/profile')"><i class="fa-solid fa-arrow-left"></i> Trang cá nhân</button>
        <h1>Đơn hàng của tôi</h1>
      </div>
      
      <p class="subtitle">Theo dõi trạng thái và lịch sử đơn hàng của bạn</p>

      <div v-if="loading" class="loading-state">
        <i class="fa-solid fa-spinner fa-spin"></i> Đang tải danh sách đơn hàng...
      </div>

      <div v-else-if="orders.length === 0" class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-box-open"></i></div>
        <h3>Bạn chưa có đơn hàng nào</h3>
        <p>Các sản phẩm bạn mua sẽ xuất hiện tại đây.</p>
        <NuxtLink to="/" class="btn-shop">Tiếp tục mua sắm</NuxtLink>
      </div>

      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order.id" class="order-item">
          <div class="order-header">
            <div class="order-info">
              <span class="order-id">Mã đơn: #{{ order.id }}</span>
              <span class="order-date">{{ formatDate(order.created_at) }}</span>
            </div>
            <div :class="['order-status', getStatusClass(order.status)]">
              {{ getStatusName(order.status) }}
            </div>
          </div>
          
          <div class="order-body">
            <div v-if="order.product_items && order.product_items.length" class="product-preview">
              <div v-for="(item, idx) in order.product_items.slice(0, 3)" :key="idx" class="product-mini">
                 <div class="product-name">{{ item.product_name || item.name || 'Sản phẩm' }}</div>
                 <div class="product-qty">x{{ item.quantity || 1 }}</div>
              </div>
              <div v-if="order.product_items.length > 3" class="more-items">
                ...và {{ order.product_items.length - 3 }} sản phẩm khác
              </div>
            </div>
            <div v-else class="no-items-preview">Đang xử lý thông tin sản phẩm...</div>
          </div>

          <div class="order-footer">
            <div class="order-total">
              <span class="label">Tổng cộng:</span>
              <span class="value">{{ formatPrice(order.total_final || order.total_price || order.amount || order.total || 0) }}đ</span>
            </div>
            <div class="order-actions">
              <button class="btn-detail" @click="viewDetail(order)">Chi tiết</button>
              <button 
                v-if="isCancellable(order.status)" 
                class="btn-cancel" 
                @click="confirmCancel(order)"
              >
                <i class="fa-solid fa-xmark"></i> Hủy đơn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Detail Modal -->
    <div v-if="selectedOrder" class="modal-overlay" @click="selectedOrder = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Chi tiết đơn hàng #{{ selectedOrder.id }}</h3>
          <button class="close-btn" @click="selectedOrder = null">&times;</button>
        </div>
        <div class="modal-body">
          <div class="detail-section">
            <h4>Thông tin giao hàng</h4>
            <div class="info-row"><strong>Người nhận:</strong> {{ selectedOrder.address_receiver?.name || selectedOrder.name || 'N/A' }}</div>
            <div class="info-row"><strong>Số điện thoại:</strong> {{ selectedOrder.address_receiver?.tel || selectedOrder.tel || 'N/A' }}</div>
            <div class="info-row"><strong>Địa chỉ:</strong> {{ selectedOrder.address_receiver?.address || selectedOrder.address || 'N/A' }}</div>
            <div class="info-row" v-if="selectedOrder.user_note"><strong>Ghi chú:</strong> {{ selectedOrder.user_note }}</div>
          </div>

          <div class="detail-section">
            <h4>Danh sách sản phẩm</h4>
            <div v-if="selectedOrder.product_items && selectedOrder.product_items.length">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th class="text-center">SL</th>
                    <th class="text-right">Giá</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in selectedOrder.product_items" :key="idx">
                    <td>{{ item.product_name || item.name }}</td>
                    <td class="text-center">{{ item.quantity }}</td>
                    <td class="text-right">{{ formatPrice(item.price) }}đ</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="empty-items">Không có thông tin chi tiết sản phẩm.</div>
          </div>

          <div class="detail-summary">
            <div class="row"><span>Tạm tính:</span> <span>{{ formatPrice(selectedOrder.total_price || selectedOrder.amount || 0) }}đ</span></div>
            <div class="row" v-if="selectedOrder.discount?.price"><span>Giảm giá:</span> <span>-{{ formatPrice(selectedOrder.discount?.price || 0) }}đ</span></div>
            <div class="row" v-if="selectedOrder.fee?.price"><span>Phí ship:</span> <span>{{ formatPrice(selectedOrder.fee?.price || 0) }}đ</span></div>
            <div class="row total">
              <span>Tổng cộng:</span> 
              <span>{{ formatPrice(selectedOrder.total_final || selectedOrder.total_price || selectedOrder.amount || selectedOrder.total || 0) }}đ</span>
            </div>
          </div>

          <!-- Cancel button in detail modal -->
          <div v-if="isCancellable(selectedOrder.status)" class="modal-cancel-action">
            <button class="btn-cancel-modal" @click="confirmCancel(selectedOrder); selectedOrder = null" :disabled="cancellingId === selectedOrder.id">
              <i class="fa-solid fa-ban"></i> Hủy đơn hàng này
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cancel Confirmation Dialog -->
    <div v-if="cancelTarget" class="modal-overlay" @click="cancelTarget = null">
      <div class="confirm-dialog" @click.stop>
        <div class="confirm-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <h3>Xác nhận hủy đơn hàng</h3>
        <p>Bạn có chắc muốn hủy đơn hàng <strong>#{{ cancelTarget.id }}</strong> không?</p>
        <p class="confirm-note">Hành động này không thể hoàn tác sau khi xác nhận.</p>
        <div class="confirm-actions">
          <button class="btn-keep" @click="cancelTarget = null">Không, giữ lại</button>
          <button class="btn-confirm-cancel" @click="executeCancel" :disabled="cancellingId !== null">
            <i v-if="cancellingId !== null" class="fa-solid fa-spinner fa-spin"></i>
            <i v-else class="fa-solid fa-xmark"></i>
            {{ cancellingId !== null ? 'Đang hủy...' : 'Xác nhận hủy' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const orders = ref<any[]>([])
const loading = ref(true)
const selectedOrder = ref<any>(null)
const cancelTarget = ref<any>(null)
const cancellingId = ref<number | null>(null)
const cancelError = ref('')

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const formatPrice = (price: number | string) => {
  if (!price) return '0'
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

const getStatusName = (status: number) => {
  const map: Record<number, string> = {
    1: 'Giỏ hàng',
    5: 'Đặt hàng',
    10: 'Đã duyệt',
    15: 'Đóng gói',
    20: 'Xuất kho',
    25: 'Hoàn thành',
    0: 'Đã hủy',
    [-2]: 'Hoàn hàng'
  }
  return map[status] || `Trạng thái ${status}`
}

const getStatusClass = (status: number) => {
  if (status === 25) return 'status-done'
  if (status === 0 || status === -2) return 'status-cancel'
  if (status === 1) return 'status-new'
  return 'status-processing'
}

onMounted(async () => {
  try {
    const phone = localStorage.getItem('user_phone')
    if (!phone) {
       window.location.href = '/auth/login'
       return
    }

    // First get customer info to get the numeric customer_id from Abaha
    const customerRes = await $fetch<any>('/api/abaha/customer-info', {
        method: 'POST',
        body: { tel: phone }
    })

    let customerId = ''
    if (customerRes?.data) {
        let ad = customerRes.data;
        // Handle various response nesting patterns from Abaha
        if (ad?.customer) ad = ad.customer;
        if (Array.isArray(ad)) ad = ad[0];
        
        // Extract the numeric ID (example format: 45278714)
        customerId = ad?.id || ad?.customer_id || ad?.id_customer || '';
    }

    if (!customerId) {
        console.warn('[Orders List] No numeric customer ID found for phone:', phone);
        loading.value = false;
        return;
    }

    console.log('[Orders List] Fetching for customerId:', customerId);

    // Now fetch orders using the numeric ID as requested
    const res = await $fetch<any>('/api/order/list', {
      method: 'POST',
      body: { 
        customer_id: String(customerId),
        limit: 100,
        order_by: 'ID',
        order_direction: 'DESC'
      }
    })

    if (res?.success && res.data) {
      // Handles different nesting: data: [{...}] or data: { orders: [{...}] }
      let fetchedOrders = res.data;
      if (typeof fetchedOrders === 'object' && !Array.isArray(fetchedOrders)) {
        if (fetchedOrders.orders) fetchedOrders = fetchedOrders.orders;
        else if (fetchedOrders.data) fetchedOrders = fetchedOrders.data;
      }
      
      if (Array.isArray(fetchedOrders)) {
        orders.value = fetchedOrders;
      }
    }
  } catch (error) {
    console.error('Failed to load orders:', error)
  } finally {
    loading.value = false
  }
})

const viewDetail = (order: any) => {
  selectedOrder.value = order
}

const isCancellable = (status: number) => {
  return status === 1 || status === 5
}

const confirmCancel = (order: any) => {
  cancelError.value = ''
  cancelTarget.value = order
}

const executeCancel = async () => {
  if (!cancelTarget.value || cancellingId.value !== null) return
  cancellingId.value = cancelTarget.value.id
  cancelError.value = ''
  try {
    await $fetch('/api/order/cancel', {
      method: 'POST',
      body: cancelTarget.value
    })
    // Cập nhật trạng thái trong danh sách
    const idx = orders.value.findIndex(o => o.id === cancelTarget.value.id)
    if (idx !== -1) {
      orders.value[idx] = { ...orders.value[idx], status: 0 }
    }
    cancelTarget.value = null
  } catch (err: any) {
    cancelError.value = err?.statusMessage || err?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
  } finally {
    cancellingId.value = null
  }
}
</script>

<style scoped>
.orders-page {
  padding: 40px 15px;
  background: #f8f9fa;
  min-height: 80vh;
  width: 100%;
}

.orders-card {
  width: 100%;
  max-width: 850px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  padding: 30px;
}

.header-back {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 5px;
}

.back-btn {
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

h1 {
  margin: 0;
  font-size: 28px;
  color: #333;
}

.subtitle {
  color: #888;
  margin-bottom: 30px;
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: #666;
  font-size: 18px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #ddd;
  margin-bottom: 20px;
}

.btn-shop {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 24px;
  background: #007bff;
  color: #fff;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-item {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.2s;
  background: #fff;
}

.order-item:hover {
  border-color: #007bff44;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f5f5f5;
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-id {
  font-weight: 700;
  font-size: 16px;
  color: #333;
}

.order-date {
  font-size: 13px;
  color: #888;
}

.order-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-new { background: #e3f2fd; color: #1976d2; }
.status-done { background: #e8f5e9; color: #2e7d32; }
.status-cancel { background: #ffebee; color: #c62828; }
.status-processing { background: #fff3e0; color: #f57c00; }

.product-preview {
  margin-bottom: 15px;
}

.product-mini {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 6px;
  color: #555;
}

.no-items-preview {
  font-size: 13px;
  color: #aaa;
  font-style: italic;
  margin-bottom: 12px;
}

.product-qty {
  color: #999;
  font-weight: 600;
}

.more-items {
  font-size: 13px;
  color: #888;
  font-style: italic;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f5f5f5;
  padding-top: 12px;
}

.order-total .label {
  font-size: 14px;
  color: #666;
}

.order-total .value {
  font-size: 18px;
  font-weight: 700;
  color: #d4161c;
  margin-left: 8px;
}

.btn-detail {
  background: #f8f9fa;
  border: 1px solid #ddd;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-detail:hover {
  background: #eee;
  border-color: #ccc;
}

.btn-cancel {
  background: #fff0f0;
  border: 1px solid #ffb3b3;
  color: #d4161c;
  padding: 6px 14px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-cancel:hover {
  background: #ffe0e0;
  border-color: #f44336;
}

.order-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-content {
  background: #fff;
  width: 100%;
  max-width: 600px;
  border-radius: 12px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { margin: 0; font-size: 18px; }

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #888;
}

.modal-body {
  padding: 20px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  font-size: 15px;
  margin-bottom: 10px;
  color: #333;
  border-left: 3px solid #007bff;
  padding-left: 10px;
}

.info-row {
  margin: 8px 0;
  font-size: 14px;
  color: #555;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.items-table th {
  text-align: left;
  background: #f8f9fa;
  padding: 10px;
  font-weight: 600;
}

.items-table td {
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.text-right { text-align: right; }
.text-center { text-align: center; }

.empty-items {
  padding: 10px;
  color: #999;
  font-style: italic;
  font-size: 13px;
}

.detail-summary {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
}

.detail-summary .row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
}

.detail-summary .total {
  border-top: 1px solid #ddd;
  padding-top: 8px;
  margin-top: 8px;
  font-weight: 700;
  color: #333;
  font-size: 16px;
}

.detail-summary .total span:last-child {
  color: #d4161c;
}

/* Cancel confirmation dialog */
.confirm-dialog {
  background: #fff;
  border-radius: 16px;
  padding: 36px 28px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.confirm-icon {
  font-size: 48px;
  color: #f59e0b;
  margin-bottom: 16px;
}

.confirm-dialog h3 {
  margin: 0 0 12px;
  font-size: 20px;
  color: #333;
}

.confirm-dialog p {
  color: #555;
  margin: 0 0 8px;
  font-size: 15px;
}

.confirm-note {
  font-size: 13px !important;
  color: #999 !important;
  font-style: italic;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
}

.btn-keep {
  padding: 10px 22px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: #555;
  transition: all 0.2s;
}

.btn-keep:hover {
  background: #eee;
}

.btn-confirm-cancel {
  padding: 10px 22px;
  background: linear-gradient(135deg, #e53e3e, #c53030);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-confirm-cancel:hover:not(:disabled) {
  background: linear-gradient(135deg, #c53030, #9b2c2c);
  transform: translateY(-1px);
}

.btn-confirm-cancel:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Cancel button in detail modal */
.modal-cancel-action {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #fee;
  text-align: center;
}

.btn-cancel-modal {
  background: linear-gradient(135deg, #fff0f0, #ffe0e0);
  border: 1.5px solid #ffb3b3;
  color: #d4161c;
  padding: 10px 28px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel-modal:hover:not(:disabled) {
  background: linear-gradient(135deg, #ffe0e0, #ffcccc);
  border-color: #f44336;
  transform: translateY(-1px);
}

.btn-cancel-modal:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  h1 { font-size: 22px; }
  .orders-card { padding: 15px; }
  .order-item { padding: 15px; }
}
</style>
