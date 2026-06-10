'use client'
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'
import { CartItem, Product } from '@/types'
import * as cartLib from '@/lib/cart'

interface CartContextValue {
  items: CartItem[]
  add: (product: Product, qty?: number) => void
  remove: (productId: string) => void
  update: (productId: string, qty: number) => void
  clear: () => void
  total: number
  count: number
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => { setItems(cartLib.getCart()) }, [])

  const add = useCallback((product: Product, qty = 1) => {
    setItems(cartLib.addToCart(product, qty))
  }, [])

  const remove = useCallback((productId: string) => {
    setItems(cartLib.removeFromCart(productId))
  }, [])

  const update = useCallback((productId: string, qty: number) => {
    setItems(cartLib.updateQuantity(productId, qty))
  }, [])

  const clear = useCallback(() => {
    cartLib.clearCart()
    setItems([])
  }, [])

  const total = cartLib.cartTotal(items)
  const count = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
