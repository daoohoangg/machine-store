import { watch, computed } from 'vue'

export interface CartItem {
  id: string; // Real numeric ID from Abaha CRM
  title: string;
  price: number;
  oldPrice: number | null;
  gift: boolean;
  image: string;
  quantity: number;
  selected: boolean;
  raw?: any; // The entire original product object from Abaha
}

export const useCart = () => {
  const cart = useState<CartItem[]>('tuanminh_cart_data', () => [])
  const isInitialized = useState<boolean>('tuanminh_cart_init', () => false)

  // 1. Initialize from localStorage on client side
  if (!isInitialized.value && process.client) {
    const savedCart = localStorage.getItem('tuanminh_cart')
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart)
        cart.value = parsed.map((item: any) => ({
          ...item,
          selected: item.selected !== undefined ? item.selected : true
        }))
      } catch (e) {
        console.error('Không thể đọc giỏ hàng từ bộ nhớ cục bộ')
      }
    }
    isInitialized.value = true
  }

  // 2. Watchers to sync with localStorage
  if (process.client) {
    watch(cart, (newCart) => {
      localStorage.setItem('tuanminh_cart', JSON.stringify(newCart))
    }, { deep: true })
  }

  // 3. Computed Properties
  const totalItems = computed(() => {
    return cart.value.reduce((acc, item) => acc + item.quantity, 0)
  })

  const selectedItemsCount = computed(() => {
    return cart.value.filter(item => item.selected).reduce((acc, item) => acc + item.quantity, 0)
  })

  const totalPrice = computed(() => {
    return cart.value
      .filter(item => item.selected)
      .reduce((acc, item) => acc + (item.price * item.quantity), 0)
  })

  const isAllSelected = computed({
    get: () => cart.value.length > 0 && cart.value.every(item => item.selected),
    set: (val: boolean) => {
      cart.value.forEach(item => item.selected = val)
    }
  })

  const { userPhone, userName, userTier } = useAdminAuth()
  const { abahaOrderId } = useOrder()
  const { calculateAdjustedPrice } = useMembershipPrices()

    // Sync helper
    const syncCartToBackend = () => {
      const phone = userPhone.value || (process.client ? localStorage.getItem('user_phone') : null)
      if (!phone) return Promise.resolve(null)

      const endpoint = abahaOrderId.value ? '/api/order/update' : '/api/order/create'
      
      return $fetch(endpoint, {
        method: 'POST',
        body: {
          id: abahaOrderId.value,
          receiver: {
            fullName: userName.value || 'Khách hàng',
            phone: phone,
            address: 'Chưa có địa chỉ'
          },
          items: cart.value,
          note: `Đang xem giỏ hàng`,
          paymentMethod: 'cod',
          status: 1,
          skipUpdate: true
        }
      }).then((resp: any) => {
          if (resp && resp.data && resp.data.id) {
              abahaOrderId.value = resp.data.id;
          }
          return resp
      }).catch(err => {
        console.error('[Cart Sync] Error syncing to Abaha:', err)
        throw err
      })
    }

    // 4. Actions
    const addToCart = (product: any) => {
      const realId = String(product.id || product.item_id || product.title)
      const priceNum = product.price ? Number(product.price.toString().replace(/\./g, '')) : 0
      const oldPriceNum = product.oldPrice ? Number(product.oldPrice.toString().replace(/\./g, '')) : null
      
      const existingIndex = cart.value.findIndex(item => item.id === realId || item.title === product.title)
      
      if (existingIndex !== -1) {
        const item = cart.value[existingIndex]
        if (item) {
          item.quantity += 1
          if (!item.raw && product) item.raw = product
        }
      } else {
        const newItem: CartItem = {
          id: realId,
          title: product.title,
          price: priceNum,
          oldPrice: oldPriceNum,
          gift: product.gift || false,
          image: product.image || 'https://placehold.co/100x100?text=S%E1%BA%A3n+ph%E1%BA%A9m',
          quantity: 1,
          selected: true,
          raw: product
        }
        cart.value.push(newItem)
      }

      return syncCartToBackend()
    }

    const removeFromCart = (id: string) => {
      cart.value = cart.value.filter(item => item.id !== id)
      return syncCartToBackend()
    }

    const updateQuantity = (id: string, newQty: number) => {
      const item = cart.value.find(item => item.id === id)
      if (item && newQty > 0) {
        item.quantity = newQty
        return syncCartToBackend()
      }
      return Promise.resolve(null)
    }

  const toggleSelection = (id: string) => {
    const item = cart.value.find(item => item.id === id)
    if (item) {
      item.selected = !item.selected
    }
  }

  const clearCart = () => {
    cart.value = []
    if (process.client) {
      localStorage.removeItem('tuanminh_cart')
    }
  }

  return {
    cart,
    totalItems,
    selectedItemsCount,
    totalPrice,
    isAllSelected,
    addToCart,
    removeFromCart,
    updateQuantity,
    toggleSelection,
    clearCart
  }
}
