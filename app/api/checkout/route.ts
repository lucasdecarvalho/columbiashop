import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase-server'
import { mpPayment } from '@/lib/mercadopago'
import { CartItem } from '@/types'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'client') {
    return NextResponse.json({ error: 'Faça login para continuar' }, { status: 401 })
  }

  const body = await req.json()
  const { items, total, card, savedCardId } = body as {
    items: CartItem[]
    total: number
    card?: {
      number: string
      holderName: string
      expiryMonth: number
      expiryYear: number
      cvv: string
      cpf: string
    }
    savedCardId?: string
  }

  if (!items?.length) {
    return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })
  }

  const db = createServerClient()
  const clientId = (session.user as any).id

  // Get client data for MP
  const { data: client } = await db
    .from('clients')
    .select('name, email, cpf')
    .eq('id', clientId)
    .single()

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

  // Determine card token for MP
  let mpToken = null
  if (savedCardId) {
    const { data: savedCard } = await db
      .from('cards')
      .select('mp_token')
      .eq('id', savedCardId)
      .eq('client_id', clientId)
      .single()
    mpToken = savedCard?.mp_token
  }

  // Build MP payment payload
  const paymentPayload: Record<string, unknown> = {
    transaction_amount: Number(total),
    description: `ColumbiaShop - Pedido #${order.id.slice(-8).toUpperCase()}`,
    payment_method_id: 'master',
    payer: {
      email: client?.email || session.user?.email || 'test@test.com',
      identification: {
        type: 'CPF',
        number: card?.cpf || client?.cpf || '12345678909',
      },
    },
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/mercadopago`,
    external_reference: order.id,
  }

  if (mpToken) {
    paymentPayload.token = mpToken
    paymentPayload.installments = 1
  } else if (card) {
    // For sandbox testing: use card data directly (requires tokenization via MP.js in prod)
    // In sandbox, we create a token-like structure
    paymentPayload.token = await createCardToken(card)
    paymentPayload.installments = 1
  }

  try {
    const payment = await mpPayment.create({
      body: paymentPayload,
      requestOptions: { idempotencyKey: order.id },
    })

    // Update order with MP payment id
    await db
      .from('orders')
      .update({ mp_payment_id: String(payment.id), status: payment.status || 'pending' })
      .eq('id', order.id)

    // If immediately approved, subtract stock
    if (payment.status === 'approved') {
      for (const item of items) {
        await db.rpc('decrement_stock', {
          product_id: item.product.id,
          qty: item.quantity,
        })
      }
    }

    return NextResponse.json({ status: payment.status, orderId: order.id })
  } catch (err: any) {
    console.error('MP error:', err)
    await db.from('orders').update({ status: 'rejected' }).eq('id', order.id)
    return NextResponse.json(
      { error: err?.cause?.message || 'Erro ao processar pagamento' },
      { status: 422 }
    )
  }
}

async function createCardToken(card: {
  number: string
  holderName: string
  expiryMonth: number
  expiryYear: number
  cvv: string
  cpf: string
}): Promise<string> {
  const res = await fetch('https://api.mercadopago.com/v1/card_tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      card_number: card.number,
      expiration_month: card.expiryMonth,
      expiration_year: card.expiryYear,
      security_code: card.cvv,
      cardholder: {
        name: card.holderName,
        identification: { type: 'CPF', number: card.cpf },
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Erro ao tokenizar cartão')
  }

  const data = await res.json()
  return data.id
}
