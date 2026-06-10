'use client'
import { useEffect, useState } from 'react'
import { Client } from '@/types'
import { useLoader } from '@/context/LoaderContext'
import { User } from 'lucide-react'

export default function MeusDadosPage() {
  const [client, setClient] = useState<Client | null>(null)
  const { withLoader } = useLoader()

  useEffect(() => {
    withLoader(async () => {
      const res = await fetch('/api/client')
      setClient(await res.json())
    })
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
          <User size={18} className="text-brand-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meus Dados</h1>
          <p className="text-sm text-slate-400">Informações da sua conta</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 max-w-md">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">Nome</label>
            <p className="text-sm font-medium text-slate-900">{client?.name || '—'}</p>
          </div>
          <div className="border-t border-slate-100" />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-400">E-mail</label>
            <p className="text-sm font-medium text-slate-900">{client?.email || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
