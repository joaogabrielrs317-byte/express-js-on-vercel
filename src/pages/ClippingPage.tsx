import { motion } from 'framer-motion'
import { ExternalLink, FileText, Mic, Camera, Radio } from 'lucide-react'
import Newsletter from '../components/common/Newsletter'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Format = 'texto' | 'entrevista' | 'investigativo' | 'foto' | 'audio'

interface Clip {
  id: string
  title: string
  outlet: string
  outlet_url: string
  url: string
  date: string
  format: Format
  description: string
  highlight: boolean
}

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

export default function ClippingPage() {
  const [clips, setClips] = useState<Clip[]>([])
  const [filter, setFilter] = useState<Format | 'todos'>('todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('clipping').select('*').order('sort_order').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setClips(data as Clip[]); setLoading(false) })
  }, [])

  const filtered = filter === 'todos' ? clips : clips.filter(c => c.format === filter)
  const highlights = clips.filter(c => c.highlight)

  return (
    <>
      <div className="pt-24 pb-16 max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-16 pb-12 border-b border-ink-100 dark:border-ink-800">
          <p className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-3">Clipping</p>
          <h1 className="font-display text-5xl font-bold text-ink-950 dark:text-ink-50 mb-3">Publicações externas</h1>
          <p className="font-body text-ink-500 dark:text-ink-400 max-w-xl">Matérias, reportagens e entrevistas publicadas em outros veículos.</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : clips.length === 0 ? (
          <div className="py-24 text-center"><p className="font-body text-ink-400">Nenhuma publicação externa ainda.</p></div>
        ) : (
          <>
            {highlights.length > 0 && (
              <section className="mb-16">
                <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-8">Destaques</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {highlights.map((clip, i) => (
                    <motion.a key={clip.id} href={clip.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: i * 0.07 }} className="group border border-ink-200 dark:border-ink-700 p-6 hover:border-ink-950 dark:hover:border-ink-300 transition-colors block">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400">{FORMAT_LABELS[clip.format]}</span>
                        <span className="text-ink-200 dark:text-ink-700">·</span>
                        <span className="font-sans text-xs text-ink-400 dark:text-ink-600">{clip.date}</span>
                      </div>
                      <h3 className="font-display text-xl font-semibold text-ink-950 dark:text-ink-50 leading-snug mb-2 group-hover:text-accent-700 dark:group-hover:text-accent-400 transition-colors">{clip.title}</h3>
                      {clip.description && <p className="font-body text-sm text-ink-500 dark:text-ink-400 leading-relaxed mb-4">{clip.description}</p>}
                      <div className="flex items-center justify-between">
                        <span className="font-sans text-sm font-medium text-ink-700 dark:text-ink-300">{clip.outlet}</span>
                        <ExternalLink size={14} className="text-ink-400 group-hover:text-accent-500 transition-colors" />
                      </div>
                    </motion.a>
                  ))}
                </div>
              </section>
            )}

            <div className="flex flex-wrap gap-2 mb-10">
              <button onClick={() => setFilter('todos')} className={`font-sans text-xs uppercase tracking-widest px-4 py-2 border transition-colors ${filter === 'todos' ? 'border-ink-950 dark:border-ink-100 bg-ink-950 dark:bg-ink-100 text-ink-50 dark:text-ink-950' : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-ink-500'}`}>
                Todos ({clips.length})
              </button>
              {FORMATS.filter(f => clips.some(c => c.format === f)).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`font-sans text-xs uppercase tracking-widest px-4 py-2 border transition-colors ${filter === f ? 'border-ink-950 dark:border-ink-100 bg-ink-950 dark:bg-ink-100 text-ink-50 dark:text-ink-950' : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-ink-500'}`}>
                  {FORMAT_LABELS[f]}
                </button>
              ))}
            </div>

            <section>
              <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-6">
                {filter === 'todos' ? 'Todas as publicações' : FORMAT_LABELS[filter]} — {filtered.length} {filtered.length === 1 ? 'item' : 'itens'}
              </p>
              <div className="flex flex-col divide-y divide-ink-100 dark:divide-ink-800">
                {filtered.map((clip, i) => {
                  const Icon = FORMAT_ICONS[clip.format]
                  return (
                    <motion.a key={clip.id} href={clip.url} target="_blank" rel="noopener noreferrer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: i * 0.04 }} className="group flex items-start gap-5 py-5 hover:bg-ink-50 dark:hover:bg-ink-900/50 -mx-3 px-3 transition-colors">
                      <div className="mt-0.5 flex-shrink-0"><Icon size={16} className="text-ink-300 dark:text-ink-600 group-hover:text-accent-500 transition-colors" /></div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-body text-base text-ink-900 dark:text-ink-100 group-hover:text-accent-700 dark:group-hover:text-accent-400 transition-colors leading-snug mb-1">{clip.title}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-sans text-sm font-medium text-ink-600 dark:text-ink-400">{clip.outlet}</span>
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
          </>
        )}
      </div>
      <Newsletter />
    </>
  )
}
