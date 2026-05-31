import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import type { Post } from '../types'
import { postsService } from '../services'
import { formatDateShort } from '../utils'

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    postsService.getAll()
      .then(setPosts)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) return
    await postsService.delete(id)
    load()
  }

  const handleToggle = async (id: string, published: boolean) => {
    await postsService.togglePublished(id, !published)
    load()
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-ink-950 dark:text-ink-50">Artigos</h1>
        <Link
          to="/admin/artigos/novo"
          className="flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-sans text-sm px-4 py-2.5 transition-colors"
        >
          <Plus size={15} />
          Novo artigo
        </Link>
      </div>

      <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-10 w-full" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-sans text-sm text-ink-400 dark:text-ink-600 mb-4">
              Nenhum artigo criado ainda.
            </p>
            <Link
              to="/admin/artigos/novo"
              className="font-sans text-sm text-accent-600 dark:text-accent-400 hover:underline"
            >
              Criar primeiro artigo
            </Link>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 border-b border-ink-100 dark:border-ink-800 text-xs font-sans uppercase tracking-widest text-ink-400 dark:text-ink-600">
              <span>Título</span>
              <span className="hidden md:block">Categoria</span>
              <span className="hidden sm:block">Data</span>
              <span>Status</span>
              <span>Ações</span>
            </div>

            {posts.map((post, i) => (
              <div
                key={post.id}
                className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3 ${
                  i !== 0 ? 'border-t border-ink-50 dark:border-ink-800' : ''
                }`}
              >
                <div className="min-w-0">
                  <p className="font-sans text-sm text-ink-800 dark:text-ink-200 truncate">{post.title}</p>
                </div>

                <span className="hidden md:block font-sans text-xs text-ink-400 dark:text-ink-600 whitespace-nowrap">
                  {post.category?.name || '—'}
                </span>

                <span className="hidden sm:block font-sans text-xs text-ink-400 dark:text-ink-600 whitespace-nowrap">
                  {formatDateShort(post.created_at)}
                </span>

                <span className={`font-sans text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${
                  post.published
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-ink-50 dark:bg-ink-800 text-ink-500 dark:text-ink-400'
                }`}>
                  {post.published ? 'Publicado' : 'Rascunho'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggle(post.id, post.published)}
                    className="p-1.5 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
                    title={post.published ? 'Despublicar' : 'Publicar'}
                  >
                    {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <Link
                    to={`/admin/artigos/${post.id}`}
                    className="p-1.5 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
                    title="Editar"
                  >
                    <Edit size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    className="p-1.5 text-ink-400 hover:text-red-600 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
