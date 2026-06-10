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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
            <Package size={18} className="text-brand-600" />
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

      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
            >
              {product.image_url ? (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                  <Package size={20} className="text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{product.title}</p>
                <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-400">
                  <span className="font-semibold text-brand-600">{formatCurrency(product.price)}</span>
                  <span className={product.stock === 0 ? 'text-red-500' : ''}>
                    {product.stock} em estoque
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => setEditProduct(product)}>
                  <Pencil size={12} />
                  Editar
                </Button>
                <Button variant="danger" size="sm" onClick={() => setDeleteId(product.id)}>
                  <Trash2 size={12} />
                </Button>
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
