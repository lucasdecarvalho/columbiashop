'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, CreditCard, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/minha-conta', label: 'Meus Dados', icon: User },
  { href: '/minha-conta/cartoes', label: 'Meus Cartões', icon: CreditCard },
  { href: '/minha-conta/pedidos', label: 'Meus Pedidos', icon: ShoppingBag },
]

export function ClientSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-full sm:w-56 flex-shrink-0">
      <nav className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all whitespace-nowrap',
              pathname === href
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
