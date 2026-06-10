import { Navbar } from '@/components/layout/Navbar'
import { ClientSidebar } from '@/components/layout/ClientSidebar'
import { ReactNode } from 'react'

export default function MinhaContaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            <ClientSidebar />
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </main>
    </div>
  )
}
