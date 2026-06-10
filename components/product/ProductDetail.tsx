'use client'
import Image from 'next/image'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { Product } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Drawer } from '@/components/ui/Drawer'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useState } from 'react'

interface ProductDetailProps {
  product: Product | null
  onClose: () => void
  onAddToCart: (product: Product, qty: number) => void
}

function DetailBody({ product }: { product: Product }) {
  return (
    <div className="flex flex-col gap-4">
      {product.image_url && (
        <div className="relative w-full overflow-hidden rounded-xl bg-slate-50" style={{ aspectRatio: '4/3' }}>
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 500px"
          />
        </div>
      )}
      <div>
        <h2 className="text-xl font-bold text-slate-900">{product.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">{product.description}</p>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
        <span className="text-2xl font-bold text-brand-600">{formatCurrency(product.price)}</span>
        <span className="text-sm text-slate-400">{product.stock} disponíveis</span>
      </div>
    </div>
  )
}

function ActionBar({ product, onClose, onAddToCart }: ProductDetailProps) {
  const [qty, setQty] = useState(1)
  if (!product) return null
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center text-sm font-semibold text-slate-900">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
      <Button
        className="flex-1"
        disabled={product.stock === 0}
        onClick={() => { onAddToCart(product, qty); onClose() }}
      >
        <ShoppingCart size={16} />
        Adicionar
      </Button>
    </div>
  )
}

export function ProductDetail({ product, onClose, onAddToCart }: ProductDetailProps) {
  const isDesktop = useMediaQuery('(min-width: 640px)')
  const open = !!product

  if (isDesktop) {
    return (
      <Modal open={open} onClose={onClose} size="lg">
        {product && (
          <div className="flex flex-col gap-4">
            <DetailBody product={product} />
            <ActionBar product={product} onClose={onClose} onAddToCart={onAddToCart} />
          </div>
        )}
      </Modal>
    )
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      footer={<ActionBar product={product} onClose={onClose} onAddToCart={onAddToCart} />}
    >
      {product && <DetailBody product={product} />}
    </Drawer>
  )
}
