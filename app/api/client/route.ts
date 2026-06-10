import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase-server'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'client') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const db = createServerClient()
  const { data, error } = await db
    .from('clients')
    .select('id, name, email, phone, cpf, created_at')
    .eq('id', (session.user as any).id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'client') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const db = createServerClient()
  const update: Record<string, unknown> = {}

  if (body.name) update.name = body.name
  if (body.phone) update.phone = body.phone
  if (body.cpf) update.cpf = body.cpf
  if (body.password) update.password = await bcrypt.hash(body.password, 12)

  const { data, error } = await db
    .from('clients')
    .update(update)
    .eq('id', (session.user as any).id)
    .select('id, name, email, phone, cpf, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
