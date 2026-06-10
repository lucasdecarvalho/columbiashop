'use client'
import { useSession } from 'next-auth/react'
import { User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AdminDadosPage() {
  const { data: session } = useSession()
  const user = session?.user as any

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
          <User size={18} className="text-brand-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meus Dados</h1>
          <p className="text-sm text-slate-400">Informações da conta administradora</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 max-w-md">
        <div className="flex flex-col gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-bold text-white shadow-md">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Nome</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">{user?.name}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Email</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">{user?.email}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Perfil</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
