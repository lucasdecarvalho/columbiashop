'use client'
import { useEffect, useState } from 'react'
import { Order } from '@/types'
import { OrdersTable } from '@/components/admin/OrdersTable'
import { useLoader } from '@/context/LoaderContext'
import { ShoppingBag } from 'lucide-react'

export default function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const { withLoader } = useLoader()

  useEffect(() => {
    withLoader(async () => {
      const res = await fetch('/api/orders')
      setOrders(await res.json())
    })
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
          <ShoppingBag size={18} className="text-brand-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pedidos</h1>
          <p className="text-sm text-slate-400">{orders.length} pedido{orders.length !== 1 ? 's' : ''} no total</p>
        </div>
      </div>
      <OrdersTable orders={orders} showClient />
    </div>
  )
}
