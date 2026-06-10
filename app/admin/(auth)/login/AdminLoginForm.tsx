'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { useLoader } from '@/context/LoaderContext'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

type FormData = z.infer<typeof schema>

export default function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { withLoader } = useLoader()
  const [showPass, setShowPass] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    await withLoader(async () => {
      const result = await signIn('admin', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Email ou senha incorretos.')
        return
      }

      toast.success('Bem-vindo, administrador!')
      router.push('/admin')
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <Shield size={24} className="text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">
            Columbia<span className="text-indigo-400">Shop</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">Área administrativa</p>
        </div>

        <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                placeholder="admin@columbia.shop"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                {...register('email')}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="relative flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-300">Senha</label>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••••"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-8 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <Button type="submit" size="lg" className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700">
              Entrar no painel
            </Button>
          </form>

          {searchParams.get('error') === 'unauthorized' && (
            <p className="mt-4 text-center text-sm text-red-400">
              Você não tem permissão para acessar essa área.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
