'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Product } from '@/types'

const schema = z.object({
  title: z.string().min(3, 'Título obrigatório'),
  description: z.string().min(10, 'Descrição obrigatória'),
  price: z.string().min(1, 'Preço inválido'),
  stock: z.string().min(1, 'Estoque inválido'),
  image_url: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ProductFormProps {
  initial?: Partial<Product>
  onSubmit: (data: any) => Promise<void>
  loading?: boolean
}

export function ProductForm({ initial, onSubmit, loading }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title || '',
      description: initial?.description || '',
      price: initial?.price ? String(initial.price) : '',
      stock: initial?.stock !== undefined ? String(initial.stock) : '',
      image_url: initial?.image_url || '',
    },
  })

  const handleFormSubmit = (data: FormData) =>
    onSubmit({ ...data, price: Number(data.price), stock: Number(data.stock) })

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4">
      <Input label="Título" error={errors.title?.message} {...register('title')} />
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Descrição</label>
        <textarea
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          rows={3}
          placeholder="Descreva o produto..."
          {...register('description')}
        />
        {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Preço (R$)" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
        <Input label="Estoque" type="number" error={errors.stock?.message} {...register('stock')} />
      </div>
      <Input label="URL da Imagem" placeholder="https://..." error={errors.image_url?.message} {...register('image_url')} />
      <Button type="submit" loading={loading} className="mt-2">
        {initial?.id ? 'Salvar Alterações' : 'Criar Produto'}
      </Button>
    </form>
  )
}
