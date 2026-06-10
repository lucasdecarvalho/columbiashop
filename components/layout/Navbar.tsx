'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, User, LogOut, Package, Menu, X } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export function Navbar() {
  const { data: session } = useSession()
  const { count } = useCart()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { href: '/catalogo', label: 'Catálogo' },
    { href: '/carrinho', label: 'Carrinho' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/catalogo" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Package size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">Columbia<span className="text-brand-600">Shop</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-brand-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {link.href === '/carrinho' ? (
                <span className="flex items-center gap-1.5">
                  <ShoppingCart size={16} />
                  Carrinho
                  {count > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </span>
              ) : (
                link.label
              )}
            </Link>
          ))}

          {session ? (
            <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-2">
              <Link
                href="/minha-conta"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <User size={16} />
                {session.user?.name?.split(' ')[0]}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="ml-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              Entrar
            </Link>
          )}
        </nav>

        {/* Mobile */}
        <div className="flex items-center gap-2 sm:hidden">
          <Link href="/carrinho" className="relative p-2 text-slate-600">
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 text-slate-600"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-slate-100 bg-white sm:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              <Link
                href="/catalogo"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                Catálogo
              </Link>
              {session ? (
                <>
                  <Link
                    href="/minha-conta"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => setMobileOpen(false)}
                  >
                    Minha Conta
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-red-50"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-brand-600"
                  onClick={() => setMobileOpen(false)}
                >
                  Entrar
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
