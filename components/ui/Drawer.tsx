'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function Drawer({ open, onClose, children, title }: DrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) onClose()
            }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl" style={{ height: '93dvh' }}
          >
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="h-1 w-12 rounded-full bg-slate-300" />
            </div>
            {title && (
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
                <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-6 pb-8">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
