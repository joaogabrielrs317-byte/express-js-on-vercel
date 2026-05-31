import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import type { NewsletterSubscriber } from '../types'
import { newsletterService } from '../services'
import { formatDate } from '../utils'

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    newsletterService.getAll()
      .then(setSubscribers)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const exportCSV = () => {
    const rows = ['email,data_inscricao', ...subscribers.map(s => `${s.email},${s.created_at}`)]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'newsletter-subscribers.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-950 dark:text-ink-50">
            Newsletter
          </h1>
          <p className="font-sans text-sm text-ink-500 dark:text-ink-400 mt-1">
            {loading ? '—' : subscribers.length} assinantes
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={loading || subscribers.length === 0}
          className="flex items-center gap-2 border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-ink-400 font-sans text-sm px-4 py-2.5 transition-colors disabled:opacity-40"
        >
          <Download size={14} />
          Exportar CSV
        </button>
      </div>

      <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800">
        <div className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3 border-b border-ink-100 dark:border-ink-800 font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600">
          <span>E-mail</span>
          <span>Data</span>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-8 w-full" />
            ))}
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-sans text-sm text-ink-400 dark:text-ink-600">
              Nenhum assinante ainda.
            </p>
          </div>
        ) : (
          subscribers.map((sub, i) => (
            <div
              key={sub.id}
              className={`grid grid-cols-[1fr_auto] gap-4 items-center px-5 py-3 ${
                i !== 0 ? 'border-t border-ink-50 dark:border-ink-800' : ''
              }`}
            >
              <span className="font-sans text-sm text-ink-800 dark:text-ink-200">{sub.email}</span>
              <span className="font-sans text-xs text-ink-400 dark:text-ink-600 whitespace-nowrap">
                {formatDate(sub.created_at)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
