import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase-server'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'client') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const db = createServerClient()
  const { data, error } = await db
    .from('cards')
    .select('*')
    .eq('client_id', (session.user as any).id)
    .order('is_default', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'client') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const db = createServerClient()
  const clientId = (session.user as any).id

  // Create MP card token from full card data
  const { card_number, cvv, cpf, holder_name, expiration_month, expiration_year, brand, is_default } = body

  let mpToken: string | null = null
  try {
    const tokenRes = await fetch('https://api.mercadopago.com/v1/card_tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        card_number: card_number.replace(/\s/g, ''),
        expiration_month: Number(expiration_month),
        expiration_year: Number(expiration_year),
        security_code: cvv,
        cardholder: {
          name: holder_name,
          identification: { type: 'CPF', number: cpf.replace(/\D/g, '') },
        },
      }),
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) {
      const msg = tokenData?.cause?.[0]?.description || tokenData?.message || 'Erro ao tokenizar cartão'
      return NextResponse.json({ error: msg }, { status: 422 })
    }
    mpToken = tokenData.id
  } catch {
    return NextResponse.json({ error: 'Erro de conexão com o Mercado Pago' }, { status: 502 })
  }

  const last_four = card_number.replace(/\s/g, '').slice(-4)

  if (is_default) {
    await db.from('cards').update({ is_default: false }).eq('client_id', clientId)
  }

  const { data, error } = await db
    .from('cards')
    .insert({ holder_name, last_four, brand, expiration_month: Number(expiration_month), expiration_year: Number(expiration_year), is_default: is_default || false, mp_token: mpToken, client_id: clientId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'client') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await req.json()
  const db = createServerClient()
  const { error } = await db
    .from('cards')
    .delete()
    .eq('id', id)
    .eq('client_id', (session.user as any).id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
