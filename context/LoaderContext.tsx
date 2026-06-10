'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface LoaderContextType {
  loading: boolean
  showLoader: () => void
  hideLoader: () => void
  withLoader: <T>(fn: () => Promise<T>) => Promise<T>
}

const LoaderContext = createContext<LoaderContextType | null>(null)

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0)
  const loading = count > 0

  const showLoader = useCallback(() => setCount((c) => c + 1), [])
  const hideLoader = useCallback(() => setCount((c) => Math.max(0, c - 1)), [])

  const withLoader = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      showLoader()
      try {
        return await fn()
      } finally {
        hideLoader()
      }
    },
    [showLoader, hideLoader]
  )

  return (
    <LoaderContext.Provider value={{ loading, showLoader, hideLoader, withLoader }}>
      {children}
    </LoaderContext.Provider>
  )
}

export function useLoader() {
  const ctx = useContext(LoaderContext)
  if (!ctx) throw new Error('useLoader must be used within LoaderProvider')
  return ctx
}
