'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { IMaskInput } from 'react-imask'
import { CreditCard, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CartItem } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { useLoader } from '@/context/LoaderContext'
import { useSession } from 'next-auth/react'

const schema = z.object({
  cardNumber: z.string().min(16, 'Número inválido'),
  holderName: z.string().min(3, 'Nome obrigatório'),
  expiryMonth: z.string().length(2, 'Mês inválido'),
  expiryYear: z.string().length(4, 'Ano inválido'),
  cvv: z.string().min(3, 'CVV inválido'),
  cpf: z.string().min(11, 'CPF obrigatório'),
})

type FormData = z.infer<typeof schema>

interface CheckoutFormProps {
  items: CartItem[]
  total: number
  onSuccess: () => void
  savedCards: Card[]
}

export function CheckoutForm({ items, total, onSuccess, savedCards }: CheckoutFormProps) {
  const { withLoader } = useLoader()
  const { data: session } = useSession()
  const [useSavedCard, setUseSavedCard] = useState(savedCards.length > 0)
  const [selectedCard, setSelectedCard] = useState<Card | null>(savedCards.find(c => c.is_default) || savedCards[0] || null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    await withLoader(async () => {
      try {
        const payload = useSavedCard && selectedCard
          ? { savedCardId: selectedCard.id, items, total }
          : {
              card: {
                number: data.cardNumber.replace(/\s/g, ''),
                holderName: data.holderName,
                expiryMonth: Number(data.expiryMonth),
                expiryYear: Number(data.expiryYear),
                cvv: data.cvv,
                cpf: data.cpf.replace(/\D/g, ''),
              },
              items,
              total,
            }

        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        const result = await res.json()

        if (!res.ok) {
          toast.error(result.error || 'Erro ao processar pagamento')
          return
        }

        if (result.status === 'approved') {
          toast.success('Pagamento aprovado! Pedido realizado com sucesso.')
          onSuccess()
        } else if (result.status === 'in_process' || result.status === 'pending') {
          toast.success('Pedido criado! Aguardando confirmação do pagamento.')
          onSuccess()
        } else {
          toast.error('Pagamento não aprovado. Verifique os dados do cartão.')
        }
      } catch {
        toast.error('Erro de conexão. Tente novamente.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-500">Total a pagar</p>
        <p className="text-3xl font-bold text-indigo-600">{formatCurrency(total)}</p>
      </div>

      {savedCards.length > 0 && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setUseSavedCard(true)}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              useSavedCard
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            Cartão salvo
          </button>
          <button
            type="button"
            onClick={() => setUseSavedCard(false)}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
              !useSavedCard
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            Novo cartão
          </button>
        </div>
      )}

      {useSavedCard && savedCards.length > 0 ? (
        <div className="flex flex-col gap-2">
          {savedCards.map((card) => (
            <label
              key={card.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-all ${
                selectedCard?.id === card.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="savedCard"
                checked={selectedCard?.id === card.id}
                onChange={() => setSelectedCard(card)}
                className="accent-indigo-600"
              />
              <CreditCard size={18} className="text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 capitalize">
                  {card.brand} •••• {card.last_four}
                </p>
                <p className="text-xs text-slate-400">
                  {card.holder_name} · {card.expiration_month}/{card.expiration_year}
                </p>
              </div>
            </label>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Número do Cartão</label>
            <IMaskInput
              mask="0000 0000 0000 0000"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="0000 0000 0000 0000"
              onAccept={(val) => setValue('cardNumber', val)}
            />
            {errors.cardNumber && <p className="text-xs text-red-500">{errors.cardNumber.message}</p>}
          </div>

          <Input
            label="Nome no Cartão"
            placeholder="Como está escrito no cartão"
            error={errors.holderName?.message}
            {...register('holderName')}
          />

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Mês</label>
              <IMaskInput
                mask="00"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="MM"
                onAccept={(val) => setValue('expiryMonth', val)}
              />
              {errors.expiryMonth && <p className="text-xs text-red-500">{errors.expiryMonth.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Ano</label>
              <IMaskInput
                mask="0000"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="AAAA"
                onAccept={(val) => setValue('expiryYear', val)}
              />
              {errors.expiryYear && <p className="text-xs text-red-500">{errors.expiryYear.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">CVV</label>
              <IMaskInput
                mask="0000"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="123"
                onAccept={(val) => setValue('cvv', val)}
              />
              {errors.cvv && <p className="text-xs text-red-500">{errors.cvv.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">CPF do Titular</label>
            <IMaskInput
              mask="000.000.000-00"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="000.000.000-00"
              onAccept={(val) => setValue('cpf', val)}
            />
            {errors.cpf && <p className="text-xs text-red-500">{errors.cpf.message}</p>}
          </div>
        </div>
      )}

      <Button type="submit" size="lg" className="w-full">
        <Lock size={16} />
        Pagar {formatCurrency(total)}
      </Button>
      <p className="text-center text-xs text-slate-400">
        Pagamento seguro processado pelo Mercado Pago
      </p>
    </form>
  )
}
