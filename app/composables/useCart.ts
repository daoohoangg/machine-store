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
        cart.value = JSON.parse(savedCart)
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

  // 4. Actions
  const addToCart = (product: any) => {
    // Determine the real ID (numeric ID from CRM preferred over title)
    const realId = String(product.id || product.item_id || product.title)
    
    // Parse strings to numbers for cart calculation
    // Note: product.price is already adjusted in useHomeProducts if it came from there
    const priceNum = product.price ? Number(product.price.toString().replace(/\./g, '')) : 0
    const oldPriceNum = product.oldPrice ? Number(product.oldPrice.toString().replace(/\./g, '')) : null
    
    // Check if exists
    const existingIndex = cart.value.findIndex(item => item.id === realId || item.title === product.title)
    
    let itemToSync: CartItem | null = null

    if (existingIndex !== -1) {
      const item = cart.value[existingIndex]
      if (item) {
        item.quantity += 1
        // Update metadata if it was missing
        if (!item.raw && product) {
          item.raw = product
        }
        itemToSync = item
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
        raw: product // Store entire object
      }
      cart.value.push(newItem)
      itemToSync = newItem
    }

    // Call Abaha API for cart sync if user is logged in
    if (userPhone.value && itemToSync) {
      console.log('[Cart Sync] Syncing to Abaha...', itemToSync.title)
      $fetch('/api/order/create', {
        method: 'POST',
        body: {
          id: abahaOrderId.value, // Continue current session order if available
          receiver: {
            fullName: userName.value || 'Khách hàng',
            phone: userPhone.value,
            address: 'Chưa có địa chỉ'
          },
          items: cart.value, // Pass all items to ensure cart is synced correctly
          note: `Đang xem giỏ hàng`,
          paymentMethod: 'cod',
          status: 1, // Created
          skipUpdate: true // Don't push to KiotViet/final status yet
        }
      }).then((resp: any) => {
          if (resp && resp.data && resp.data.id) {
              abahaOrderId.value = resp.data.id;
          }
      }).catch(err => {
        console.error('[Cart Sync] Error syncing to Abaha:', err)
      })
    }
  }

  const removeFromCart = (id: string) => {
    cart.value = cart.value.filter(item => item.id !== id)
  }

  const updateQuantity = (id: string, newQty: number) => {
    const item = cart.value.find(item => item.id === id)
    if (item && newQty > 0) {
      item.quantity = newQty
    }
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
