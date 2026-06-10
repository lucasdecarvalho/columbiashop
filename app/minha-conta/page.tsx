'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { IMaskInput } from 'react-imask'
import { Client } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from 'sonner'
import { useLoader } from '@/context/LoaderContext'
import { User } from 'lucide-react'

const schema = z.object({
  name: z.string().min(3, 'Nome obrigatório'),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  password: z.string().min(6, 'Mínimo 6 caracteres').optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export default function MeusDadosPage() {
  const [client, setClient] = useState<Client | null>(null)
  const { withLoader } = useLoader()
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    withLoader(async () => {
      const res = await fetch('/api/client')
      const data = await res.json()
      setClient(data)
      setValue('name', data.name)
      setValue('phone', data.phone || '')
      setValue('cpf', data.cpf || '')
    })
  }, [])

  const onSubmit = async (data: FormData) => {
    await withLoader(async () => {
      const res = await fetch('/api/client', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        toast.success('Dados atualizados com sucesso!')
        const updated = await res.json()
        setClient(updated)
      } else {
        toast.error('Erro ao atualizar dados.')
      }
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
          <User size={18} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meus Dados</h1>
          <p className="text-sm text-slate-400">Atualize suas informações pessoais</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-md">
          <Input label="Nome completo" error={errors.name?.message} {...register('name')} />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Celular</label>
            <IMaskInput
              mask="(00) 00000-0000"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="(11) 99999-9999"
              defaultValue={client?.phone || ''}
              onAccept={(val) => setValue('phone', val)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">CPF</label>
            <IMaskInput
              mask="000.000.000-00"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="000.000.000-00"
              defaultValue={client?.cpf || ''}
              onAccept={(val) => setValue('cpf', val)}
            />
          </div>

          <div className="border-t border-slate-100 pt-4">
            <Input
              label="Nova senha (opcional)"
              type="password"
              placeholder="Deixe em branco para manter"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            <p><strong className="text-slate-700">Email:</strong> {client?.email}</p>
          </div>

          <Button type="submit">Salvar Alterações</Button>
        </form>
      </div>
    </div>
  )
}
