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
  let mpToken: string | null = null
  let cardBrand = 'master'

  if (savedCardId) {
    const { data: savedCard } = await db
      .from('cards')
      .select('mp_token, brand')
      .eq('id', savedCardId)
      .eq('client_id', clientId)
      .single()
    mpToken = savedCard?.mp_token ?? null
    if (savedCard?.brand) cardBrand = brandToMpId(savedCard.brand)

    if (!mpToken) {
      await db.from('orders').update({ status: 'rejected' }).eq('id', order.id)
      return NextResponse.json(
        { error: 'Cartão salvo sem token de pagamento. Use um novo cartão.' },
        { status: 422 }
      )
    }
  }

  if (!mpToken && card) {
    cardBrand = detectBrand(card.number)
    try {
      mpToken = await createCardToken(card)
    } catch (err: any) {
      console.error('Card token error:', err)
      await db.from('orders').update({ status: 'rejected' }).eq('id', order.id)
      const msg = extractMpError(err)
      return NextResponse.json({ error: msg }, { status: 422 })
    }
  }

  if (!mpToken) {
    await db.from('orders').update({ status: 'rejected' }).eq('id', order.id)
    return NextResponse.json({ error: 'Dados do cartão não informados.' }, { status: 400 })
  }

  // Build MP payment payload
  const paymentPayload: Record<string, unknown> = {
    transaction_amount: Number(total),
    description: `ColumbiaShop - Pedido #${order.id.slice(-8).toUpperCase()}`,
    payment_method_id: cardBrand,
    token: mpToken,
    installments: 1,
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

  try {
    const payment = await mpPayment.create({
      body: paymentPayload,
      requestOptions: { idempotencyKey: order.id },
    })

    await db
      .from('orders')
      .update({ mp_payment_id: String(payment.id), status: payment.status || 'pending' })
      .eq('id', order.id)

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
    console.error('MP error:', JSON.stringify(err, null, 2))
    await db.from('orders').update({ status: 'rejected' }).eq('id', order.id)
    return NextResponse.json({ error: extractMpError(err) }, { status: 422 })
  }
}

function extractMpError(err: any): string {
  // MP SDK v2: cause is an array of {description, code}
  const causes: any[] = Array.isArray(err?.cause) ? err.cause : []
  if (causes.length > 0) return causes.map((c: any) => c.description || c.message || c.code).join('; ')
  return err?.message || 'Erro ao processar pagamento'
}

function detectBrand(number: string): string {
  const n = number.replace(/\s/g, '')
  if (/^4/.test(n)) return 'visa'
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'master'
  if (/^3[47]/.test(n)) return 'amex'
  if (/^636368|^438935|^504175|^451416|^509048|^509067|^509049/.test(n)) return 'elo'
  if (/^606282/.test(n)) return 'hipercard'
  return 'master'
}

function brandToMpId(brand: string): string {
  const map: Record<string, string> = {
    mastercard: 'master', visa: 'visa', elo: 'elo',
    amex: 'amex', hipercard: 'hipercard',
  }
  return map[brand.toLowerCase()] ?? 'master'
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
