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

  // Sync helper - nhận snapshot ID để tránh bị ảnh hưởng bởi thay đổi reactive async
  const syncCartToBackend = (forceCreate = false, snapshotOrderId?: string | number | null) => {
    const phone = userPhone.value || (process.client ? localStorage.getItem('user_phone') : '')

    // Ưu tiên snapshotOrderId -> reactive state -> localStorage (fallback khi chưa hydrate)
    let orderId = snapshotOrderId || abahaOrderId.value
    if (!orderId && process.client) {
      const localId = localStorage.getItem('abaha_order_id')
      if (localId && localId !== 'null') {
        orderId = localId
      }
    }

    // Quyết định endpoint: 
    // - Nếu forceCreate = true -> Chắc chắn gọi create.
    // - Nếu đã có orderId -> Gọi update.
    // - Còn lại -> Gọi create.
    const endpoint = (forceCreate || !orderId) ? '/api/order/create' : '/api/order/update'
    const isCreate = endpoint.includes('create')

    const formattedProductItems = cart.value.map(item => ({
      price: Number(item.price) || 0,
      product_code: String(item.raw?.productCode || item.raw?.product_code || ''),
      quantity: Number(item.quantity) || 1
    }))

    console.log(`[Cart Sync] Mode: ${isCreate ? 'CREATE' : 'UPDATE'}. Order ID:`, orderId)

    return $fetch(endpoint, {
      method: 'POST',
      body: {
        id: isCreate ? null : orderId,
        product_items: formattedProductItems,
        discount: {
          price: 0,
          name: "không"
        },
        fee: {
          price: 0,
          name: "Phí ship"
        },
        tel: phone,
        address_receiver: {
          address_default: null,
          name: userName.value || 'Khách hàng',
          tel: phone,
          address: 'Chưa có địa chỉ'
        },
        user_note: "Đang xem giỏ hàng",
        orders_time: (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}` })(),
        status: 1,
        pos_id: "DH981",
        pos_type: "kiotviet",
        check_product_inventory: false,
        check_product_status: false,
        skipUpdate: true
      }
    }).then((resp: any) => {
      if (resp && resp.data && resp.data.id && cart.value.length > 0) {
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
    // Kiểm tra giỏ hàng có trống TRƯỚC KHI thêm không
    const wasEmpty = cart.value.length === 0

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

    // Chỉ ép gọi create nếu ban đầu giỏ hàng trống
    return syncCartToBackend(wasEmpty)
  }

  const removeFromCart = (id: string) => {
    // Lưu snapshot ID TRƯỚC KHI xóa và reset (lấy cả từ localStorage nếu cần)
    let currentOrderId = abahaOrderId.value
    if (!currentOrderId && process.client) {
      const localId = localStorage.getItem('abaha_order_id')
      if (localId && localId !== 'null') currentOrderId = localId
    }

    cart.value = cart.value.filter(item => item.id !== id)

    // Nếu xóa hết, reset ID để lần sau tạo mới
    if (cart.value.length === 0) {
      abahaOrderId.value = null
    }

    // Truyền snapshot ID vào để đảm bảo gọi UPDATE dù abahaOrderId có thể đã bị reset
    return syncCartToBackend(false, currentOrderId)
  }

  const updateQuantity = (id: string, newQty: number) => {
    const item = cart.value.find(item => item.id === id)
    if (item && newQty > 0) {
      item.quantity = newQty
      return syncCartToBackend(false) // Luôn dùng update nếu có thể
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
