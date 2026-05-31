import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowDown } from 'lucide-react'

export default function Hero() {
  return (
    <section className="min-h-[85vh] flex flex-col justify-center pt-20 pb-12 px-6">
      <div className="max-w-4xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-6"
        >
          Jornalismo — Análise — Investigação
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-bold text-ink-950 dark:text-ink-50 leading-[1.05] tracking-tight mb-6"
        >
          Histórias que
          <br />
          <em className="text-accent-600 dark:text-accent-400 not-italic">precisam ser</em>
          <br />
          contadas.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="font-body text-xl text-ink-600 dark:text-ink-400 max-w-xl leading-relaxed mb-10"
        >
          Estudante de Jornalismo apaixonada por política, cultura e as histórias que moldam o mundo.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-wrap items-center gap-4"
        >
          <Link
            to="#publicacoes"
            className="font-sans text-sm uppercase tracking-widest bg-ink-950 dark:bg-ink-100 text-ink-50 dark:text-ink-950 px-7 py-4 hover:bg-accent-700 dark:hover:bg-accent-300 transition-colors"
          >
            Ler matérias
          </Link>
          <Link
            to="/sobre"
            className="font-sans text-sm uppercase tracking-widest text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors flex items-center gap-2"
          >
            Sobre mim <ArrowDown size={14} className="rotate-[-45deg]" />
          </Link>
        </motion.div>
      </div>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: 'easeInOut' }}
        className="max-w-4xl mx-auto w-full mt-16"
      >
        <div className="h-px bg-ink-100 dark:bg-ink-800 origin-left" />
      </motion.div>
    </section>
  )
}
