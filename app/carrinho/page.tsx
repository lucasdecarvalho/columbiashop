'use client'
import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { CartItemRow } from '@/components/cart/CartItem'
import { CheckoutForm } from '@/components/cart/CheckoutForm'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/utils'
import { ShoppingCart, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/types'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function CarrinhoPage() {
  const { items, update, remove, clear, total, count } = useCart()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [savedCards, setSavedCards] = useState<Card[]>([])
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session && (session.user as any).role === 'client') {
      fetch('/api/cards').then((r) => r.json()).then(setSavedCards)
    }
  }, [session])

  const handleCheckout = () => {
    if (!session) {
      router.push('/login')
      return
    }
    setCheckoutOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex items-center gap-3">
            <Link href="/catalogo" className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Carrinho</h1>
            {count > 0 && (
              <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center"
            >
              <ShoppingCart size={48} className="mb-4 text-slate-200" />
              <p className="text-lg font-semibold text-slate-400">Seu carrinho está vazio</p>
              <p className="mt-1 text-sm text-slate-400">Adicione produtos para continuar</p>
              <Link href="/catalogo">
                <Button className="mt-6">Ver produtos</Button>
              </Link>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex-1 flex flex-col gap-3">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                    >
                      <CartItemRow
                        item={item}
                        onUpdate={update}
                        onRemove={remove}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="lg:w-80 flex flex-col gap-4">
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                  <h2 className="mb-4 text-base font-semibold text-slate-900">Resumo</h2>
                  <div className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal ({count} itens)</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Frete</span>
                      <span className="text-green-600">Grátis</span>
                    </div>
                    <div className="my-2 border-t border-slate-100" />
                    <div className="flex justify-between text-base font-bold text-slate-900">
                      <span>Total</span>
                      <span className="text-indigo-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                  <Button className="mt-4 w-full" size="lg" onClick={handleCheckout}>
                    Finalizar Compra
                  </Button>
                  <button
                    onClick={clear}
                    className="mt-3 w-full text-center text-sm text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Limpar carrinho
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="Finalizar Compra" size="md">
        <CheckoutForm
          items={items}
          total={total}
          savedCards={savedCards}
          onSuccess={() => {
            setCheckoutOpen(false)
            clear()
            router.push('/minha-conta/pedidos')
          }}
        />
      </Modal>
    </div>
  )
}
