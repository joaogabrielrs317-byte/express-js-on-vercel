import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, Eye, EyeOff, Users, Plus, UserCircle,
  Newspaper, FolderOpen, ArrowRight, TrendingUp
} from 'lucide-react'
import type { Post } from '../types'
import { postsService, newsletterService } from '../services'
import { formatDateShort } from '../utils'

// ─── Bento primitives ────────────────────────────────────────────────────────

function BentoCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-3xl border border-ink-100
        bg-white dark:bg-ink-900 dark:border-ink-800
        p-6 flex flex-col transition-shadow hover:shadow-lg
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  accent = false,
  loading,
}: {
  label: string
  value: number
  icon: React.ElementType
  accent?: boolean
  loading: boolean
}) {
  return (
    <BentoCard className={accent ? 'bg-accent-600 dark:bg-accent-700 border-accent-500' : ''}>
      <div className="flex items-start justify-between mb-auto">
        <span
          className={`
            inline-flex items-center justify-center w-10 h-10 rounded-2xl
            ${accent
              ? 'bg-accent-500/40 text-white'
              : 'bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400'}
          `}
        >
          <Icon size={18} />
        </span>
        <TrendingUp
          size={14}
          className={accent ? 'text-accent-200' : 'text-ink-300 dark:text-ink-600'}
        />
      </div>
      <div className="mt-6">
        <p
          className={`
            font-display text-4xl font-bold leading-none mb-1
            ${accent ? 'text-white' : 'text-ink-950 dark:text-ink-50'}
          `}
        >
          {loading ? '—' : value}
        </p>
        <p
          className={`
            font-sans text-xs
            ${accent ? 'text-accent-200' : 'text-ink-400 dark:text-ink-500'}
          `}
        >
          {label}
        </p>
      </div>
    </BentoCard>
  )
}

// ─── Quick access links ───────────────────────────────────────────────────────

const QUICK_LINKS = [
  { to: '/admin/perfil',     label: 'Meu Perfil',   icon: UserCircle,  desc: 'Edite sua bio e redes' },
  { to: '/admin/artigos',    label: 'Artigos',       icon: FileText,    desc: 'Gerencie publicações' },
  { to: '/admin/clipping',   label: 'Clipping',      icon: Newspaper,   desc: 'Publicações externas' },
  { to: '/admin/categorias', label: 'Categorias',    icon: FolderOpen,  desc: 'Organize por tema' },
  { to: '/admin/newsletter', label: 'Newsletter',    icon: Users,       desc: 'Lista de assinantes' },
]

// ─── Dashboard ───────────────────────────────────────────────────────────────

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
  const drafts    = posts.filter(p => !p.published).length

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink-950 dark:text-ink-50">
            Painel
          </h1>
          <p className="font-sans text-sm text-ink-400 dark:text-ink-500 mt-1">
            Bem-vinda de volta, Karol ✦
          </p>
        </div>
        <Link
          to="/admin/artigos/novo"
          className="flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white
                     font-sans text-sm px-4 py-2.5 rounded-2xl transition-colors"
        >
          <Plus size={15} />
          Novo artigo
        </Link>
      </div>

      {/* ── Bento grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Stat cards – row 1 */}
        <StatCard label="Total de artigos" value={posts.length}    icon={FileText} loading={loading} accent />
        <StatCard label="Publicados"        value={published}       icon={Eye}      loading={loading} />
        <StatCard label="Rascunhos"         value={drafts}          icon={EyeOff}   loading={loading} />
        <StatCard label="Assinantes"        value={subscriberCount} icon={Users}    loading={loading} />

        {/* Quick links – spans full width */}
        <BentoCard className="col-span-2 md:col-span-4">
          <p className="font-sans text-xs font-medium text-ink-400 dark:text-ink-500 uppercase tracking-widest mb-5">
            Acesso rápido
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {QUICK_LINKS.map(({ to, label, icon: Icon, desc }) => (
              <Link
                key={to}
                to={to}
                className="
                  group flex flex-col gap-3 rounded-2xl border border-ink-100 dark:border-ink-800
                  bg-ink-50 dark:bg-ink-950 p-4 hover:border-accent-300 dark:hover:border-accent-700
                  hover:bg-accent-50 dark:hover:bg-accent-950/30 transition-all
                "
              >
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl
                                 bg-white dark:bg-ink-900 text-accent-600 dark:text-accent-400
                                 border border-ink-100 dark:border-ink-800 shadow-sm
                                 group-hover:bg-accent-600 group-hover:text-white dark:group-hover:bg-accent-600
                                 transition-all">
                  <Icon size={16} />
                </span>
                <div>
                  <p className="font-sans text-sm font-medium text-ink-800 dark:text-ink-200 leading-tight">
                    {label}
                  </p>
                  <p className="font-sans text-xs text-ink-400 dark:text-ink-600 mt-0.5 leading-tight">
                    {desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </BentoCard>

        {/* Recent posts – col-span 3 */}
        <BentoCard className="col-span-2 md:col-span-3 p-0">
          <div className="px-6 py-4 border-b border-ink-100 dark:border-ink-800 flex items-center justify-between">
            <h2 className="font-sans text-sm font-medium text-ink-700 dark:text-ink-300">
              Artigos recentes
            </h2>
            <Link
              to="/admin/artigos"
              className="flex items-center gap-1 font-sans text-xs text-accent-600 dark:text-accent-400 hover:underline"
            >
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-ink-50 dark:divide-ink-800">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="px-6 py-3.5 flex gap-3 items-center">
                    <div className="skeleton h-2 w-2 rounded-full flex-shrink-0" />
                    <div className="skeleton h-4 flex-1 rounded-xl" />
                    <div className="skeleton h-3 w-16 rounded-xl" />
                  </div>
                ))
              : posts.slice(0, 8).map(post => (
                  <div key={post.id} className="flex items-center justify-between px-6 py-3.5 group">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
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
                        className="font-sans text-xs text-accent-600 dark:text-accent-400
                                   hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Editar
                      </Link>
                    </div>
                  </div>
                ))}
          </div>
        </BentoCard>

        {/* Status card – col-span 1 */}
        <BentoCard className="col-span-2 md:col-span-1 justify-between bg-ink-950 dark:bg-ink-800 border-ink-900">
          <div>
            <p className="font-sans text-xs text-ink-500 uppercase tracking-widest mb-4">
              Publicação
            </p>
            {loading ? (
              <div className="space-y-3">
                <div className="skeleton h-3 w-full rounded-xl" />
                <div className="skeleton h-3 w-3/4 rounded-xl" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Published bar */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-sans text-xs text-ink-400">Publicados</span>
                    <span className="font-sans text-xs font-medium text-ink-100">{published}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent-500 transition-all duration-700"
                      style={{ width: posts.length ? `${(published / posts.length) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                {/* Drafts bar */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="font-sans text-xs text-ink-400">Rascunhos</span>
                    <span className="font-sans text-xs font-medium text-ink-100">{drafts}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-ink-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-ink-500 transition-all duration-700"
                      style={{ width: posts.length ? `${(drafts / posts.length) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link
            to="/admin/artigos/novo"
            className="
              mt-6 flex items-center justify-center gap-2
              rounded-2xl bg-accent-600 hover:bg-accent-500
              text-white font-sans text-sm py-2.5 transition-colors
            "
          >
            <Plus size={14} /> Novo artigo
          </Link>
        </BentoCard>

      </div>
    </div>
  )
}
