import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const role = (session.user as any).role
  const id = (session.user as any).id
  const db = createServerClient()

  let query = db
    .from('orders')
    .select('*, order_items(*, products(*)), clients(name, email)')
    .order('created_at', { ascending: false })

  if (role === 'client') {
    query = query.eq('client_id', id)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
