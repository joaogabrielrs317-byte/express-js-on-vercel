import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import PostCard from '../components/common/PostCard'
import { PostCardSkeleton } from '../components/common/Skeletons'
import type { Post } from '../types'
import { postsService } from '../services'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [query, setQuery] = useState(q)
  const [results, setResults] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    postsService.search(q.trim())
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [q])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setSearchParams({ q: query.trim() })
    }
  }

  return (
    <div className="pt-24 pb-24 max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-6">
          Busca
        </p>
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-xl border-b-2 border-ink-950 dark:border-ink-100 pb-1">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            placeholder="Buscar artigos, entrevistas…"
            className="flex-1 bg-transparent font-display text-2xl text-ink-950 dark:text-ink-50 placeholder-ink-300 dark:placeholder-ink-700 outline-none"
          />
          <button type="submit" className="text-ink-500 dark:text-ink-400">
            <Search size={20} />
          </button>
        </form>
      </motion.div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)}
        </div>
      )}

      {!loading && searched && (
        <>
          <p className="font-sans text-sm text-ink-500 dark:text-ink-400 mb-8">
            {results.length} {results.length === 1 ? 'resultado' : 'resultados'} para "{q}"
          </p>
          {results.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-body text-ink-400 dark:text-ink-600">Nenhum resultado encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {results.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
