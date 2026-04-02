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

  const submitOrderToBackend = async () => {
    if (!currentOrder.value) return null
    
    isLoading.value = true
    try {
      const response: any = await $fetch('/api/order/create', {
        method: 'POST',
        body: {
          receiver: currentOrder.value.receiver,
          items: currentOrder.value.items,
          note: currentOrder.value.meta.note,
          paymentMethod: currentOrder.value.meta.paymentMethod
        }
      })
      
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
    hasOrder,
    isLoading,
    subtotal,
    total,
    createOrder,
    submitOrderToBackend,
    clearOrder
  }
}
