'use client'
import { CreditCard, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CartItem } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import { useLoader } from '@/context/LoaderContext'

interface CheckoutFormProps {
  items: CartItem[]
  total: number
  onSuccess: () => void
  savedCards: Card[]
}

export function CheckoutForm({ items, total, onSuccess, savedCards }: CheckoutFormProps) {
  const { withLoader } = useLoader()
  const card = savedCards.find(c => c.is_default) || savedCards[0] || null

  const handlePay = async () => {
    await withLoader(async () => {
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, total, savedCardId: card?.id }),
        })

        const result = await res.json()

        if (!res.ok) {
          toast.error(result.error || 'Erro ao processar pagamento')
          return
        }

        toast.success('Pagamento aprovado! Pedido realizado com sucesso.')
        onSuccess()
      } catch {
        toast.error('Erro de conexão. Tente novamente.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-500">Total a pagar</p>
        <p className="text-3xl font-bold text-brand-600">{formatCurrency(total)}</p>
      </div>

      {card ? (
        <div className="flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50 p-4">
          <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-md">
            <CreditCard size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 capitalize">
              {card.brand} •••• {card.last_four}
            </p>
            <p className="text-xs text-slate-400">
              {card.holder_name} · {card.expiration_month}/{card.expiration_year}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
          Nenhum cartão vinculado à conta
        </div>
      )}

      <Button type="button" size="lg" className="w-full" onClick={handlePay} disabled={!card}>
        <Lock size={16} />
        Pagar {formatCurrency(total)}
      </Button>
      <p className="text-center text-xs text-slate-400">
        Pagamento seguro processado pelo Mercado Pago
      </p>
    </div>
  )
}
