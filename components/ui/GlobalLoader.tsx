'use client'
import { AnimatePresence, motion } from 'framer-motion'
import { useLoader } from '@/context/LoaderContext'
import { Spinner } from './Spinner'

export function GlobalLoader() {
  const { loading } = useLoader()

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-xl"
          >
            <Spinner size="lg" />
            <span className="text-sm font-medium text-slate-500">Carregando...</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
