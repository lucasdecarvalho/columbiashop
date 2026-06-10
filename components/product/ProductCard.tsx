'use client'
import Image from 'next/image'
import { ShoppingCart, Eye } from 'lucide-react'
import { Product } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

interface ProductCardProps {
  product: Product
  onViewDetail: (product: Product) => void
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onViewDetail, onAddToCart }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div
        className="relative aspect-square cursor-pointer overflow-hidden bg-slate-50"
        onClick={() => onViewDetail(product)}
      >
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <ShoppingCart size={48} />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 group-hover:bg-black/10 group-hover:opacity-100 transition-all duration-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
            <Eye size={16} className="text-slate-700" />
          </div>
        </div>
        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
              Esgotado
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3
          className="cursor-pointer text-sm font-semibold text-slate-900 line-clamp-2 hover:text-brand-600 transition-colors"
          onClick={() => onViewDetail(product)}
        >
          {product.title}
        </h3>
        <p className="mt-1 text-xs text-slate-400 line-clamp-2">{product.description}</p>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-brand-600">{formatCurrency(product.price)}</span>
          <span className="text-xs text-slate-400">{product.stock} em estoque</span>
        </div>

        <Button
          className="mt-3 w-full"
          size="sm"
          disabled={product.stock === 0}
          onClick={() => onAddToCart(product)}
        >
          <ShoppingCart size={14} />
          Adicionar
        </Button>
      </div>
    </motion.div>
  )
}
