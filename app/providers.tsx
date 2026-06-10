'use client'
import { SessionProvider } from 'next-auth/react'
import { LoaderProvider } from '@/context/LoaderContext'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <LoaderProvider>{children}</LoaderProvider>
    </SessionProvider>
  )
}
