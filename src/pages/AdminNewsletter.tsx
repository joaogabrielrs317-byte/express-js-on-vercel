import { useState, useEffect } from 'react'
import { Download, Mail } from 'lucide-react'
import type { NewsletterSubscriber } from '../types'
import { newsletterService } from '../services'
import { formatDate } from '../utils'

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    newsletterService.getAll().then(setSubscribers).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const exportCSV = () => {
    const rows = ['email,data_inscricao', ...subscribers.map(s => `${s.email},${s.created_at}`)]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'newsletter-subscribers.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-sans text-2xl font-bold text-ink-950 dark:text-ink-50">Newsletter</h1>
          <p className="font-sans text-sm text-ink-500 dark:text-ink-400 mt-1">
            {loading ? '—' : subscribers.length} assinantes
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={loading || subscribers.length === 0}
          className="flex items-center gap-2 border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-accent-500 hover:text-accent-600 font-sans text-sm px-4 py-2.5 rounded-2xl transition-colors disabled:opacity-40"
        >
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      {/* Stat card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-3xl p-5 flex items-center gap-4">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400">
            <Mail size={18} />
          </span>
          <div>
            <p className="font-sans text-2xl font-bold text-ink-950 dark:text-ink-50">{loading ? '—' : subscribers.length}</p>
            <p className="font-sans text-xs text-ink-400">Total de assinantes</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-3xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] gap-4 px-6 py-3 border-b border-ink-100 dark:border-ink-800 font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 bg-ink-50/50 dark:bg-ink-950/30">
          <span>E-mail</span><span>Data</span>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-8 w-full rounded-2xl" />)}</div>
        ) : subscribers.length === 0 ? (
          <div className="py-20 text-center"><p className="font-sans text-sm text-ink-400">Nenhum assinante ainda.</p></div>
        ) : subscribers.map((sub, i) => (
          <div key={sub.id} className={`grid grid-cols-[1fr_auto] gap-4 items-center px-6 py-3.5 hover:bg-ink-50 dark:hover:bg-ink-800/30 transition-colors ${i !== 0 ? 'border-t border-ink-50 dark:border-ink-800' : ''}`}>
            <span className="font-sans text-sm text-ink-800 dark:text-ink-200">{sub.email}</span>
            <span className="font-sans text-xs text-ink-400 dark:text-ink-600 whitespace-nowrap">{formatDate(sub.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
