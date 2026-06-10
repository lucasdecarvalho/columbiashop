'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/types'
import { useLoader } from '@/context/LoaderContext'
import { CreditCard, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MeusCartoesPage() {
  const [cards, setCards] = useState<Card[]>([])
  const { withLoader } = useLoader()

  useEffect(() => {
    withLoader(async () => {
      const res = await fetch('/api/cards')
      setCards(await res.json())
    })
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
          <CreditCard size={18} className="text-brand-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meus Cartões</h1>
          <p className="text-sm text-slate-400">Cartões vinculados à sua conta</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-md">
                <CreditCard size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 capitalize">
                    {card.brand} •••• {card.last_four}
                  </p>
                  {card.is_default && (
                    <span className="flex items-center gap-0.5 rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">
                      <Star size={10} className="fill-brand-600" />
                      Principal
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {card.holder_name} · {card.expiration_month}/{card.expiration_year}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {cards.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-400">
            Nenhum cartão cadastrado
          </div>
        )}
      </div>
    </div>
  )
}
