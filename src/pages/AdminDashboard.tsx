import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Eye, EyeOff, Plus } from 'lucide-react'
import type { Post } from '../types'
import { postsService, newsletterService } from '../services'
import { formatDateShort } from '../utils'

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([postsService.getAll(), newsletterService.getAll()])
      .then(([ps, subs]) => {
        setPosts(ps)
        setSubscriberCount(subs.length)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const published = posts.filter(p => p.published).length
  const drafts = posts.filter(p => !p.published).length

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink-950 dark:text-ink-50">
          Painel
        </h1>
        <Link
          to="/admin/artigos/novo"
          className="flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-sans text-sm px-4 py-2.5 transition-colors"
        >
          <Plus size={15} />
          Novo artigo
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total de artigos', value: posts.length, icon: FileText },
          { label: 'Publicados', value: published, icon: Eye },
          { label: 'Rascunhos', value: drafts, icon: EyeOff },
          { label: 'Assinantes', value: subscriberCount, icon: FileText },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="font-sans text-xs text-ink-500 dark:text-ink-400">{label}</p>
              <Icon size={14} className="text-ink-300 dark:text-ink-600" />
            </div>
            <p className="font-display text-3xl font-bold text-ink-950 dark:text-ink-50">
              {loading ? '—' : value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent posts */}
      <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800">
        <div className="px-5 py-4 border-b border-ink-100 dark:border-ink-800 flex items-center justify-between">
          <h2 className="font-sans text-sm font-medium text-ink-700 dark:text-ink-300">
            Artigos recentes
          </h2>
          <Link to="/admin/artigos" className="font-sans text-xs text-accent-600 dark:text-accent-400 hover:underline">
            Ver todos
          </Link>
        </div>
        <div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-5 w-full" />
              ))}
            </div>
          ) : posts.slice(0, 8).map((post, i) => (
            <div
              key={post.id}
              className={`flex items-center justify-between px-5 py-3 ${
                i !== 0 ? 'border-t border-ink-50 dark:border-ink-800' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  post.published ? 'bg-green-400' : 'bg-ink-300 dark:bg-ink-600'
                }`} />
                <span className="font-sans text-sm text-ink-800 dark:text-ink-200 truncate">
                  {post.title}
                </span>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                <span className="font-sans text-xs text-ink-400 dark:text-ink-600 hidden sm:block">
                  {formatDateShort(post.created_at)}
                </span>
                <Link
                  to={`/admin/artigos/${post.id}`}
                  className="font-sans text-xs text-accent-600 dark:text-accent-400 hover:underline"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
