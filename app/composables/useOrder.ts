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
  const abahaOrderId = useState<number | string | null>('abaha_order_id', () => {
    if (process.client) {
      return localStorage.getItem('abaha_order_id')
    }
    return null
  })
  
  if (process.client) {
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
    
    // Always use the create endpoint as requested by the user
    const endpoint = '/api/order/create'
    
    isLoading.value = true
    try {
      const body = {
        id: abahaOrderId.value,
        receiver: currentOrder.value.receiver,
        items: currentOrder.value.items,
        note: currentOrder.value.meta.note,
        paymentMethod: currentOrder.value.meta.paymentMethod,
        discount: extra?.discountAmount || 0,
        voucher_code: extra?.voucherCode || '',
        status: 5 // Final submit
      }

      console.log(`[useOrder] Payload for ${endpoint}:`, JSON.stringify(body, null, 2))

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
