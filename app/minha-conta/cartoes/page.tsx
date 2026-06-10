'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { IMaskInput } from 'react-imask'
import { Card } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { toast } from 'sonner'
import { useLoader } from '@/context/LoaderContext'
import { CreditCard, Plus, Trash2, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const schema = z.object({
  holderName: z.string().min(3, 'Nome obrigatório'),
  lastFour: z.string().length(4, '4 dígitos'),
  brand: z.string().min(1, 'Bandeira obrigatória'),
  expiryMonth: z.string().min(1, 'Obrigatório'),
  expiryYear: z.string().min(4, 'Obrigatório'),
  isDefault: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

const brands = ['mastercard', 'visa', 'elo', 'amex', 'hipercard']

export default function MeusCartoesPage() {
  const [cards, setCards] = useState<Card[]>([])
  const [addOpen, setAddOpen] = useState(false)
  const { withLoader } = useLoader()

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const fetchCards = () =>
    withLoader(async () => {
      const res = await fetch('/api/cards')
      setCards(await res.json())
    })

  useEffect(() => { fetchCards() }, [])

  const onAddCard = async (data: FormData) => {
    await withLoader(async () => {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holder_name: data.holderName,
          last_four: data.lastFour,
          brand: data.brand,
          expiration_month: Number(data.expiryMonth),
          expiration_year: Number(data.expiryYear),
          is_default: data.isDefault || false,
        }),
      })
      if (res.ok) {
        toast.success('Cartão adicionado!')
        setAddOpen(false)
        reset()
        fetchCards()
      } else {
        toast.error('Erro ao adicionar cartão.')
      }
    })
  }

  const handleDelete = async (id: string) => {
    await withLoader(async () => {
      const res = await fetch('/api/cards', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast.success('Cartão removido.')
        fetchCards()
      } else {
        toast.error('Erro ao remover cartão.')
      }
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
            <CreditCard size={18} className="text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Meus Cartões</h1>
            <p className="text-sm text-slate-400">Gerencie seus cartões de pagamento</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={14} />
          Adicionar
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
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
              </div>
              <button
                onClick={() => handleDelete(card.id)}
                className="rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {cards.length === 0 && (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-400">
            Nenhum cartão cadastrado
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Adicionar Cartão">
        <form onSubmit={handleSubmit(onAddCard)} className="flex flex-col gap-4">
          <Input label="Nome no cartão" error={errors.holderName?.message} {...register('holderName')} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Últimos 4 dígitos</label>
            <IMaskInput
              mask="0000"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              placeholder="6351"
              onAccept={(val) => setValue('lastFour', val)}
            />
            {errors.lastFour && <p className="text-xs text-red-500">{errors.lastFour.message}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Bandeira</label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500"
              {...register('brand')}
            >
              <option value="">Selecione...</option>
              {brands.map((b) => (
                <option key={b} value={b} className="capitalize">{b}</option>
              ))}
            </select>
            {errors.brand && <p className="text-xs text-red-500">{errors.brand.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Mês</label>
              <IMaskInput
                mask="00"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                placeholder="11"
                onAccept={(val) => setValue('expiryMonth', val)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Ano</label>
              <IMaskInput
                mask="0000"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                placeholder="2030"
                onAccept={(val) => setValue('expiryYear', val)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" className="accent-brand-600" {...register('isDefault')} />
            Definir como cartão principal
          </label>

          <Button type="submit">Adicionar Cartão</Button>
        </form>
      </Modal>
    </div>
  )
}
