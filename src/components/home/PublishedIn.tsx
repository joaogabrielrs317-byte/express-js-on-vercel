import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

// ─────────────────────────────────────────────
// EDITE AQUI: veículos onde já foi publicada
// ─────────────────────────────────────────────
const OUTLETS = [
  { name: 'Agência Pública', url: 'https://apublica.org' },
  { name: 'Nexo Jornal', url: 'https://nexojornal.com.br' },
  { name: 'Ponte Jornalismo', url: 'https://ponte.org' },
  { name: 'Brasil de Fato', url: 'https://brasildefato.com.br' },
  { name: 'Jornal do Campus USP', url: 'https://jornaldocampus.usp.br' },
  { name: 'Rádio USP', url: 'https://radio.usp.br' },
]

export default function PublishedIn() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="py-12 border-t border-b border-ink-100 dark:border-ink-800"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 flex-shrink-0">
          Publicado em
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {OUTLETS.map(({ name, url }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1 font-sans text-sm font-medium text-ink-500 dark:text-ink-500 hover:text-ink-950 dark:hover:text-ink-100 transition-colors"
            >
              {name}
              <ExternalLink
                size={10}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </a>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
