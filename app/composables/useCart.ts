import { ref, watch, computed } from 'vue'

export interface CartItem {
  id: string; // Ensure id is string (title serves as id here)
  title: string;
  price: number;
  oldPrice: number | null;
  gift: boolean;
  image: string;
  quantity: number;
  selected: boolean;
}

// Global state
const cart = ref<CartItem[]>([])
const isInitialized = ref(false)

export const useCart = () => {
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

  // 4. Actions
  const addToCart = (product: any) => {
    // Parse strings to numbers for cart calculation
    const priceNum = product.price ? parseInt(product.price.toString().replace(/\./g, '')) : 0
    const oldPriceNum = product.oldPrice ? parseInt(product.oldPrice.toString().replace(/\./g, '')) : null
    
    // Check if exists
    const existingIndex = cart.value.findIndex(item => item.title === product.title)
    
    if (existingIndex !== -1) {
      cart.value[existingIndex].quantity += 1
    } else {
      cart.value.push({
        id: product.title, // using title as unique ID for this clone
        title: product.title,
        price: priceNum,
        oldPrice: oldPriceNum,
        gift: product.gift || false,
        image: product.image || 'https://placehold.co/100x100?text=S%E1%BA%A3n+ph%E1%BA%A9m',
        quantity: 1,
        selected: true // Auto select when added
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
