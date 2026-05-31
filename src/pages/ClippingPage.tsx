import { motion } from 'framer-motion'
import { ExternalLink, FileText, Mic, Camera, Radio } from 'lucide-react'
import Newsletter from '../components/common/Newsletter'

// ─────────────────────────────────────────────
// EDITE AQUI: suas publicações externas
// Adicione cada matéria publicada em outro veículo
// ─────────────────────────────────────────────

type Format = 'texto' | 'entrevista' | 'investigativo' | 'foto' | 'audio'

interface Clip {
  title: string
  outlet: string          // nome do veículo
  outletUrl?: string
  url: string             // link da matéria
  date: string            // ex: "março 2024"
  format: Format
  description?: string
  highlight?: boolean     // aparece em destaque
}

const CLIPS: Clip[] = [
  {
    title: 'Invisíveis do Asfalto: como a cracolândia de SP se tornou um problema de gestão',
    outlet: 'Agência Pública',
    outletUrl: 'https://apublica.org',
    url: '#',
    date: 'outubro 2024',
    format: 'investigativo',
    description: 'Reportagem investigativa premiada sobre a gestão da crise da cracolândia em São Paulo.',
    highlight: true,
  },
  {
    title: 'Encarceramento em massa: os números que o estado prefere esconder',
    outlet: 'Ponte Jornalismo',
    outletUrl: 'https://ponte.org',
    url: '#',
    date: 'julho 2024',
    format: 'investigativo',
    description: 'Análise de dados sobre superlotação no sistema prisional paulista.',
    highlight: true,
  },
  {
    title: '"Não existe democracia sem imprensa livre" — entrevista com pesquisadora de mídia',
    outlet: 'Jornal do Campus USP',
    outletUrl: 'https://www.jornaldocampus.usp.br',
    url: '#',
    date: 'abril 2024',
    format: 'entrevista',
  },
  {
    title: 'O silêncio das mulheres negras na política brasileira',
    outlet: 'Nexo Jornal',
    outletUrl: 'https://nexojornal.com.br',
    url: '#',
    date: 'março 2024',
    format: 'texto',
    description: 'Análise sobre sub-representação de mulheres negras em cargos eletivos.',
  },
  {
    title: 'Cobertura das eleições municipais 2024 — ao vivo da apuração',
    outlet: 'Rádio USP',
    outletUrl: 'https://radio.usp.br',
    url: '#',
    date: 'outubro 2024',
    format: 'audio',
  },
  {
    title: 'Fotorreportagem: manifestação pela moradia no centro de SP',
    outlet: 'Brasil de Fato',
    outletUrl: 'https://www.brasildefato.com.br',
    url: '#',
    date: 'agosto 2023',
    format: 'foto',
  },
]

// ─────────────────────────────────────────────

const FORMAT_LABELS: Record<Format, string> = {
  texto: 'Texto',
  entrevista: 'Entrevista',
  investigativo: 'Investigativo',
  foto: 'Fotorreportagem',
  audio: 'Áudio / Rádio',
}

const FORMAT_ICONS: Record<Format, React.ElementType> = {
  texto: FileText,
  entrevista: Mic,
  investigativo: FileText,
  foto: Camera,
  audio: Radio,
}

const FORMATS: Format[] = ['texto', 'entrevista', 'investigativo', 'foto', 'audio']

import { useState } from 'react'

export default function ClippingPage() {
  const [filter, setFilter] = useState<Format | 'todos'>('todos')

  const filtered = filter === 'todos' ? CLIPS : CLIPS.filter(c => c.format === filter)
  const highlights = CLIPS.filter(c => c.highlight)

  return (
    <>
      <div className="pt-24 pb-16 max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-16 pb-12 border-b border-ink-100 dark:border-ink-800"
        >
          <p className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-3">
            Clipping
          </p>
          <h1 className="font-display text-5xl font-bold text-ink-950 dark:text-ink-50 mb-3">
            Publicações externas
          </h1>
          <p className="font-body text-ink-500 dark:text-ink-400 max-w-xl">
            Matérias, reportagens e entrevistas publicadas em outros veículos — um registro do trabalho que foi além deste portfólio.
          </p>
        </motion.div>

        {/* Destaques */}
        {highlights.length > 0 && (
          <section className="mb-16">
            <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-8">
              Destaques
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {highlights.map((clip, i) => (
                <motion.a
                  key={i}
                  href={clip.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="group border border-ink-200 dark:border-ink-700 p-6 hover:border-ink-950 dark:hover:border-ink-300 transition-colors block"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400">
                      {FORMAT_LABELS[clip.format]}
                    </span>
                    <span className="text-ink-200 dark:text-ink-700">·</span>
                    <span className="font-sans text-xs text-ink-400 dark:text-ink-600">{clip.date}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink-950 dark:text-ink-50 leading-snug mb-2 group-hover:text-accent-700 dark:group-hover:text-accent-400 transition-colors">
                    {clip.title}
                  </h3>
                  {clip.description && (
                    <p className="font-body text-sm text-ink-500 dark:text-ink-400 leading-relaxed mb-4">
                      {clip.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-sm font-medium text-ink-700 dark:text-ink-300">
                      {clip.outlet}
                    </span>
                    <ExternalLink size={14} className="text-ink-400 group-hover:text-accent-500 transition-colors" />
                  </div>
                </motion.a>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            onClick={() => setFilter('todos')}
            className={`font-sans text-xs uppercase tracking-widest px-4 py-2 border transition-colors ${
              filter === 'todos'
                ? 'border-ink-950 dark:border-ink-100 bg-ink-950 dark:bg-ink-100 text-ink-50 dark:text-ink-950'
                : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-ink-500'
            }`}
          >
            Todos ({CLIPS.length})
          </button>
          {FORMATS.filter(f => CLIPS.some(c => c.format === f)).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-sans text-xs uppercase tracking-widest px-4 py-2 border transition-colors ${
                filter === f
                  ? 'border-ink-950 dark:border-ink-100 bg-ink-950 dark:bg-ink-100 text-ink-50 dark:text-ink-950'
                  : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-ink-500'
              }`}
            >
              {FORMAT_LABELS[f]}
            </button>
          ))}
        </div>

        {/* All clips list */}
        <section>
          <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-6">
            {filter === 'todos' ? 'Todas as publicações' : FORMAT_LABELS[filter]} — {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
          </p>
          <div className="flex flex-col divide-y divide-ink-100 dark:divide-ink-800">
            {filtered.map((clip, i) => {
              const Icon = FORMAT_ICONS[clip.format]
              return (
                <motion.a
                  key={i}
                  href={clip.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="group flex items-start gap-5 py-5 hover:bg-ink-50 dark:hover:bg-ink-900/50 -mx-3 px-3 transition-colors"
                >
                  <div className="mt-0.5 flex-shrink-0">
                    <Icon size={16} className="text-ink-300 dark:text-ink-600 group-hover:text-accent-500 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-body text-base text-ink-900 dark:text-ink-100 group-hover:text-accent-700 dark:group-hover:text-accent-400 transition-colors leading-snug mb-1">
                      {clip.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-sans text-sm font-medium text-ink-600 dark:text-ink-400">
                        {clip.outlet}
                      </span>
                      <span className="text-ink-200 dark:text-ink-700">·</span>
                      <span className="font-sans text-xs text-ink-400 dark:text-ink-600">{clip.date}</span>
                      <span className="text-ink-200 dark:text-ink-700">·</span>
                      <span className="font-sans text-xs text-ink-400 dark:text-ink-600">{FORMAT_LABELS[clip.format]}</span>
                    </div>
                  </div>
                  <ExternalLink size={13} className="flex-shrink-0 mt-1 text-ink-300 dark:text-ink-700 group-hover:text-accent-500 transition-colors" />
                </motion.a>
              )
            })}
          </div>
        </section>
      </div>

      <Newsletter />
    </>
  )
}
