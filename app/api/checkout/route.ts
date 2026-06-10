import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase-server'
import { CartItem } from '@/types'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'client') {
    return NextResponse.json({ error: 'Faça login para continuar' }, { status: 401 })
  }

  const body = await req.json()
  const { items, total } = body as { items: CartItem[]; total: number }

  if (!items?.length) {
    return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })
  }

  const db = createServerClient()
  const clientId = (session.user as any).id

  // Create order
  const { data: order, error: orderErr } = await db
    .from('orders')
    .insert({ client_id: clientId, status: 'pending', total })
    .select()
    .single()

  if (orderErr) return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })

  // Create order items
  await db.from('order_items').insert(
    items.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      quantity: i.quantity,
      unit_price: i.product.price,
    }))
  )

  // Simulate payment approval (pilot mode)
  await db
    .from('orders')
    .update({ status: 'approved', mp_payment_id: `PILOT-${order.id.slice(-8).toUpperCase()}` })
    .eq('id', order.id)

  // Subtract stock
  for (const item of items) {
    await db.rpc('decrement_stock', {
      product_id: item.product.id,
      qty: item.quantity,
    })
  }

  return NextResponse.json({ status: 'approved', orderId: order.id })
}
