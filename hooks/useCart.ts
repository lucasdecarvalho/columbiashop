'use client'
import { useState, useEffect, useCallback } from 'react'
import { CartItem, Product } from '@/types'
import * as cartLib from '@/lib/cart'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(cartLib.getCart())
  }, [])

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

  return { items, add, remove, update, clear, total, count }
}
