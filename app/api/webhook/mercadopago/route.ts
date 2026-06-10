import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { mpPayment } from '@/lib/mercadopago'
import crypto from 'crypto'

function validateSignature(req: NextRequest): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET!
  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')
  const dataId = new URL(req.url).searchParams.get('data.id')

  if (!xSignature) return false

  const parts = xSignature.split(',')
  const tsPart = parts.find((p) => p.startsWith('ts='))
  const v1Part = parts.find((p) => p.startsWith('v1='))
  if (!tsPart || !v1Part) return false

  const ts = tsPart.split('=')[1]
  const v1 = v1Part.split('=')[1]

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'))
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  const isDev = process.env.NODE_ENV === 'development'
  if (!isDev && !validateSignature(req)) {
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  let body: { type?: string; data?: { id?: string | number } }
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  if (body.type !== 'payment') {
    return NextResponse.json({ received: true })
  }

  const paymentId = body.data?.id
  if (!paymentId) return NextResponse.json({ received: true })

  try {
    const payment = await mpPayment.get({ id: Number(paymentId) })
    const orderId = payment.external_reference
    if (!orderId) return NextResponse.json({ received: true })

    const db = createServerClient()

    const newStatus =
      payment.status === 'approved'
        ? 'approved'
        : payment.status === 'rejected'
        ? 'rejected'
        : payment.status === 'cancelled'
        ? 'cancelled'
        : 'pending'

    await db
      .from('orders')
      .update({ status: newStatus, mp_payment_id: String(paymentId) })
      .eq('id', orderId)

    if (payment.status === 'approved') {
      const { data: orderItems } = await db
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', orderId)

      if (orderItems) {
        for (const item of orderItems) {
          await db.rpc('decrement_stock', {
            product_id: item.product_id,
            qty: item.quantity,
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
