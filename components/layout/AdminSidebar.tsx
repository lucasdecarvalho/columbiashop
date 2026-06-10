'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Package, ShoppingBag, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

const links = [
  { href: '/admin', label: 'Meus Dados', icon: User },
  { href: '/admin/produtos', label: 'Produtos', icon: Package },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full sm:w-56 flex-shrink-0">
      <div className="mb-4 hidden sm:block px-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Administração</p>
      </div>
      <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap',
              pathname === href
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-all mt-auto"
        >
          <LogOut size={16} />
          Sair
        </button>
      </nav>
    </aside>
  )
}
