'use client'
import { SessionProvider } from 'next-auth/react'
import { LoaderProvider } from '@/context/LoaderContext'
import { CartProvider } from '@/context/CartContext'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LoaderProvider>
        <CartProvider>{children}</CartProvider>
      </LoaderProvider>
    </SessionProvider>
  )
}
