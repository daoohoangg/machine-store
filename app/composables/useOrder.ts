import { computed } from 'vue'
import type { CartItem } from '~/composables/useCart'

interface OrderReceiver {
  fullName: string
  phone: string
  address: string
  city?: string
  district?: string
  ward?: string
}

interface OrderMeta {
  paymentMethod: string
  note: string
  type: 'normal' | 'installment'
}

export interface OrderData {
  id: string
  createdAt: string
  receiver: OrderReceiver
  items: CartItem[]
  shippingFee: number
  meta: OrderMeta
}

const now = () => new Date().toISOString()

const generateOrderId = () => {
  const stamp = Date.now().toString()
  return stamp.slice(-9)
}

export const useOrder = () => {
  const currentOrder = useState<OrderData | null>('current_order', () => null)
  const abahaOrderId = useState<number | string | null>('abaha_order_id', () => null)
  
  if (process.client) {
    const savedId = localStorage.getItem('abaha_order_id')
    if (savedId && !abahaOrderId.value) {
      abahaOrderId.value = savedId
    }
    
    watch(abahaOrderId, (newId) => {
      if (newId) localStorage.setItem('abaha_order_id', String(newId))
      else localStorage.removeItem('abaha_order_id')
    })
  }

  const hasOrder = computed(() => !!currentOrder.value)
  const isLoading = useState<boolean>('order_loading', () => false)

  const createOrder = (payload: {
    receiver: OrderReceiver
    items: CartItem[]
    paymentMethod: string
    note?: string
    type?: 'normal' | 'installment'
  }) => {
    const selectedItems = payload.items.filter((item) => item.selected)

    currentOrder.value = {
      id: generateOrderId(),
      createdAt: now(),
      receiver: payload.receiver,
      items: selectedItems,
      shippingFee: 0,
      meta: {
        paymentMethod: payload.paymentMethod,
        note: payload.note || '',
        type: payload.type || 'normal'
      }
    }

    return currentOrder.value
  }

  const submitOrderToBackend = async (extra?: { discountAmount?: number, voucherCode?: string }) => {
    if (!currentOrder.value) return null
    
    // Use Update if we have an existing ID from cart sync, otherwise Create a new one
    const endpoint = abahaOrderId.value ? '/api/order/update' : '/api/order/create'
    
    isLoading.value = true
    try {
      const body = {
        id: abahaOrderId.value,
        product_items: currentOrder.value.items.map(item => ({
          price: Number(item.price) || 0,
          product_code: String(item.raw?.productCode || item.raw?.product_code || ''),
          quantity: Number(item.quantity) || 1
        })),
        discount: {
          price: extra?.discountAmount || 0,
          name: extra?.voucherCode ? "giảm giá sản phẩm" : "không"
        },
        fee: {
          price: 0,
          name: "Phí ship"
        },
        tel: currentOrder.value.receiver.phone,
        address_receiver: {
          address_default: null,
          name: currentOrder.value.receiver.fullName,
          tel: currentOrder.value.receiver.phone,
          address: currentOrder.value.receiver.address
        },
        user_note: currentOrder.value.meta.note,
        orders_time: (() => { const d = new Date(currentOrder.value.createdAt); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}` })(),
        status: 5,
        pos_id: "",
        pos_type: "",
        check_product_inventory: false,
        check_product_status: false
      }

      console.log(`[useOrder] FINAL SUBMISSION JSON for ${endpoint}:`, JSON.stringify(body, null, 2))

      const response: any = await $fetch(endpoint, {
        method: 'POST',
        body: body
      })
      
      console.log('[useOrder] Submit response:', response)
      
      if (response.success && response.data?.id) {
        abahaOrderId.value = response.data.id
      }
      
      isLoading.value = false
      return response
    } catch (error: any) {
      isLoading.value = false
      console.error('[useOrder] Error submitting order:', error)
      throw error
    }
  }

  const clearOrder = () => {
    currentOrder.value = null
    abahaOrderId.value = null
  }

  const subtotal = computed(() => {
    if (!currentOrder.value) return 0

    return currentOrder.value.items.reduce((acc, item) => {
      return acc + item.price * item.quantity
    }, 0)
  })

  const total = computed(() => subtotal.value + (currentOrder.value?.shippingFee || 0))

  return {
    currentOrder,
    abahaOrderId,
    hasOrder,
    isLoading,
    subtotal,
    total,
    createOrder,
    submitOrderToBackend,
    clearOrder
  }
}
