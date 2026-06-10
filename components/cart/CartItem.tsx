'use client'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { CartItem as CartItemType } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface CartItemProps {
  item: CartItemType
  onUpdate: (productId: string, qty: number) => void
  onRemove: (productId: string) => void
}

export function CartItemRow({ item, onUpdate, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-4 rounded-xl border border-slate-100 bg-white p-4">
      {item.product.image_url && (
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-50">
          <Image
            src={item.product.image_url}
            alt={item.product.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">{item.product.title}</h3>
          <p className="text-sm text-brand-600 font-medium mt-0.5">
            {formatCurrency(item.product.price)}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-lg border border-slate-200">
            <button
              onClick={() =>
                item.quantity <= 1 ? onRemove(item.product.id) : onUpdate(item.product.id, item.quantity - 1)
              }
              className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
            >
              {item.quantity <= 1 ? <Trash2 size={13} className="text-red-400" /> : <Minus size={13} />}
            </button>
            <span className="w-7 text-center text-sm font-semibold text-slate-900">{item.quantity}</span>
            <button
              onClick={() => onUpdate(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
              className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Plus size={13} />
            </button>
          </div>
          <p className="text-sm font-bold text-slate-900">
            {formatCurrency(item.product.price * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  )
}
