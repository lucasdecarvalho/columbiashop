'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Package, Eye, EyeOff } from 'lucide-react'
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

export default function LoginForm() {
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
      const result = await signIn('client', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Email ou senha incorretos. Verifique os dados e tente novamente.')
        return
      }

      toast.success('Login realizado com sucesso!')
      router.push('/catalogo')
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-200">
            <Package size={24} className="text-white" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            Columbia<span className="text-indigo-600">Shop</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">Entre na sua conta para continuar</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="tester@columbia.shop"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="relative">
              <Input
                label="Senha"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" size="lg" className="mt-2 w-full">
              Entrar
            </Button>
          </form>

          {searchParams.get('error') === 'unauthorized' && (
            <p className="mt-4 text-center text-sm text-red-500">
              Você não tem permissão para acessar essa área.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
