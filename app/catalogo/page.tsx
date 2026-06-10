'use client'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductDetail } from '@/components/product/ProductDetail'
import { Product } from '@/types'
import { useCart } from '@/hooks/useCart'
import { useLoader } from '@/context/LoaderContext'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [selected, setSelected] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const { add } = useCart()
  const { withLoader } = useLoader()

  useEffect(() => {
    withLoader(async () => {
      const res = await fetch('/api/products')
      const data = await res.json()
      setProducts(data)
      setFiltered(data)
    })
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(products.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)))
  }, [search, products])

  const handleAddToCart = (product: Product, qty = 1) => {
    add(product, qty)
    toast.success(`${product.title} adicionado ao carrinho!`)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 py-16 px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white sm:text-4xl"
          >
            Bem-vindo à ColumbiaShop
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-brand-200"
          >
            Produtos de qualidade com entrega rápida
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-lg"
          >
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder-slate-400"
            />
          </motion.div>
        </div>

        {/* Products */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {filtered.length} produto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </h2>
          </div>
          {filtered.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-slate-400">
              Nenhum produto encontrado
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewDetail={setSelected}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <ProductDetail
        product={selected}
        onClose={() => setSelected(null)}
        onAddToCart={handleAddToCart}
      />
    </div>
  )
}
