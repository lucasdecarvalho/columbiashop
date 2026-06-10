import { CartItem, Product } from '@/types'

const CART_KEY = 'columbia_cart'

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function addToCart(product: Product, quantity = 1): CartItem[] {
  const cart = getCart()
  const idx = cart.findIndex((i) => i.product.id === product.id)
  if (idx >= 0) {
    cart[idx].quantity = Math.min(cart[idx].quantity + quantity, product.stock)
  } else {
    cart.push({ product, quantity })
  }
  saveCart(cart)
  return cart
}

export function removeFromCart(productId: string): CartItem[] {
  const cart = getCart().filter((i) => i.product.id !== productId)
  saveCart(cart)
  return cart
}

export function updateQuantity(productId: string, quantity: number): CartItem[] {
  const cart = getCart().map((i) =>
    i.product.id === productId ? { ...i, quantity } : i
  )
  saveCart(cart)
  return cart
}

export function clearCart() {
  localStorage.removeItem(CART_KEY)
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
}
