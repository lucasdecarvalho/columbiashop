'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Product } from '@/types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ProductForm } from '@/components/admin/ProductForm'
import { toast } from 'sonner'
import { useLoader } from '@/context/LoaderContext'
import { Package, Plus, Pencil, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const { withLoader } = useLoader()

  const fetchProducts = () =>
    withLoader(async () => {
      const res = await fetch('/api/products')
      setProducts(await res.json())
    })

  useEffect(() => { fetchProducts() }, [])

  const handleCreate = async (data: any) => {
    setFormLoading(true)
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setFormLoading(false)
    if (res.ok) {
      toast.success('Produto criado!')
      setCreateOpen(false)
      fetchProducts()
    } else {
      toast.error('Erro ao criar produto.')
    }
  }

  const handleEdit = async (data: any) => {
    if (!editProduct) return
    setFormLoading(true)
    const res = await fetch(`/api/products/${editProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setFormLoading(false)
    if (res.ok) {
      toast.success('Produto atualizado!')
      setEditProduct(null)
      fetchProducts()
    } else {
      toast.error('Erro ao atualizar produto.')
    }
  }

  const handleDelete = async (id: string) => {
    await withLoader(async () => {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Produto excluído.')
        setDeleteId(null)
        fetchProducts()
      } else {
        toast.error('Erro ao excluir produto.')
      }
    })
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
            <Package size={18} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Produtos</h1>
            <p className="text-sm text-slate-400">{products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={14} />
          Novo Produto
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden"
            >
              {product.image_url && (
                <div className="relative aspect-video w-full bg-slate-50">
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 350px"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 line-clamp-1">{product.title}</h3>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">{product.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-base font-bold text-indigo-600">{formatCurrency(product.price)}</span>
                  <span className={`text-xs font-medium ${product.stock === 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    {product.stock} em estoque
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditProduct(product)}
                  >
                    <Pencil size={12} />
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteId(product.id)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {products.length === 0 && (
        <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-400">
          Nenhum produto cadastrado
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Novo Produto" size="lg">
        <ProductForm onSubmit={handleCreate} loading={formLoading} />
      </Modal>

      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Editar Produto" size="lg">
        {editProduct && (
          <ProductForm initial={editProduct} onSubmit={handleEdit} loading={formLoading} />
        )}
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Confirmar exclusão" size="sm">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-slate-600">Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.</p>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="danger" className="flex-1" onClick={() => deleteId && handleDelete(deleteId)}>Excluir</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
