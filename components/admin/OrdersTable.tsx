'use client'
import { Order } from '@/types'
import { formatCurrency, formatDate, statusLabel, statusColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface OrdersTableProps {
  orders: Order[]
  showClient?: boolean
}

export function OrdersTable({ orders, showClient }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-400">
        Nenhum pedido encontrado
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50 text-left">
            <th className="px-4 py-3 font-medium text-slate-500">Pedido</th>
            {showClient && <th className="px-4 py-3 font-medium text-slate-500">Cliente</th>}
            <th className="px-4 py-3 font-medium text-slate-500">Data</th>
            <th className="px-4 py-3 font-medium text-slate-500">Status</th>
            <th className="px-4 py-3 font-medium text-slate-500 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-slate-500">
                #{order.id.slice(-8).toUpperCase()}
              </td>
              {showClient && (
                <td className="px-4 py-3 text-slate-700">
                  {order.clients?.name || '—'}
                </td>
              )}
              <td className="px-4 py-3 text-slate-500">{formatDate(order.created_at)}</td>
              <td className="px-4 py-3">
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', statusColor[order.status])}>
                  {statusLabel[order.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-slate-900">
                {formatCurrency(order.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
