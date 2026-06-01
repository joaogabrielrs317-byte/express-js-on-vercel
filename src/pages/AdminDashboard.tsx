import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FileText, Eye, EyeOff, Users, Plus, UserCircle,
  Newspaper, FolderOpen, ArrowRight, TrendingUp,
  LayoutDashboard, PenSquare
} from 'lucide-react'
import type { Post } from '../types'
import { postsService, newsletterService } from '../services'
import { formatDateShort } from '../utils'
import GooeyNav from '../components/ui/GooeyNav'

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

// ─── GooeyNav items ──────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Painel',      href: '/admin',             icon: <LayoutDashboard size={15} /> },
  { label: 'Perfil',      href: '/admin/perfil',       icon: <UserCircle size={15} /> },
  { label: 'Artigos',     href: '/admin/artigos',      icon: <FileText size={15} /> },
  { label: 'Novo artigo', href: '/admin/artigos/novo', icon: <PenSquare size={15} /> },
  { label: 'Clipping',    href: '/admin/clipping',     icon: <Newspaper size={15} /> },
  { label: 'Categorias',  href: '/admin/categorias',   icon: <FolderOpen size={15} /> },
  { label: 'Newsletter',  href: '/admin/newsletter',   icon: <Users size={15} /> },
]

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
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

      {/* ── GooeyNav ── */}
      <GooeyNav
        items={NAV_ITEMS}
        activeIndex={0}
        onItemClick={(_, item) => navigate(item.href)}
        particleCount={14}
        particleSize={7}
        colors={['#4f46e5', '#818cf8', '#6366f1', '#a5b4fc', '#c7d2fe']}
        className="w-full overflow-hidden"
      />

      {/* ── Bento grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Stat cards */}
        <StatCard label="Total de artigos" value={posts.length}    icon={FileText} loading={loading} accent />
        <StatCard label="Publicados"        value={published}       icon={Eye}      loading={loading} />
        <StatCard label="Rascunhos"         value={drafts}          icon={EyeOff}   loading={loading} />
        <StatCard label="Assinantes"        value={subscriberCount} icon={Users}    loading={loading} />

        {/* Recent posts — col-span 3 */}
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

        {/* Status card — col-span 1 */}
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
            className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-accent-600
                       hover:bg-accent-500 text-white font-sans text-sm py-2.5 transition-colors"
          >
            <Plus size={14} /> Novo artigo
          </Link>
        </BentoCard>

      </div>
    </div>
  )
}
