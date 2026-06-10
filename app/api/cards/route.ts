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

  if (body.is_default) {
    await db.from('cards').update({ is_default: false }).eq('client_id', clientId)
  }

  const { data, error } = await db
    .from('cards')
    .insert({ ...body, client_id: clientId })
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
