import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const SUGGESTIONS = [
  { to: '/', label: 'Início' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/clipping', label: 'Clipping' },
  { to: '/entrevistas', label: 'Entrevistas' },
  { to: '/contato', label: 'Contato' },
]

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <p className="font-display text-8xl font-bold text-ink-100 dark:text-ink-800 mb-6 select-none">
          404
        </p>
        <h1 className="font-display text-2xl font-semibold text-ink-950 dark:text-ink-50 mb-3">
          Página não encontrada
        </h1>
        <p className="font-body text-ink-500 dark:text-ink-400 mb-10">
          O artigo ou página que você procura não existe ou foi movido.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {SUGGESTIONS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="font-sans text-sm text-ink-600 dark:text-ink-400 border border-ink-200 dark:border-ink-700 px-4 py-2 hover:border-ink-950 dark:hover:border-ink-300 hover:text-ink-950 dark:hover:text-ink-50 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>

        <Link
          to="/"
          className="font-sans text-sm uppercase tracking-widest bg-ink-950 dark:bg-ink-100 text-ink-50 dark:text-ink-950 px-6 py-3 hover:bg-accent-700 transition-colors inline-block"
        >
          Voltar ao início
        </Link>
      </motion.div>
    </div>
  )
}
