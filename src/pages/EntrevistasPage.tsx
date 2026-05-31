import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Clock, Calendar } from 'lucide-react'
import type { Post } from '../types'
import { postsService, categoriesService } from '../services'
import { extractFirstVideoUrl } from '../utils/embed'
import { formatDateShort } from '../utils'
import Newsletter from '../components/common/Newsletter'


function VideoCard({ post, index }: { post: Post; index: number }) {
  const [playing, setPlaying] = useState(false)

  // Try to get YouTube thumbnail from content
  const videoSrcMatch = post.content.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/)
  const ytThumb = videoSrcMatch
    ? `https://img.youtube.com/vi/${videoSrcMatch[1]}/hqdefault.jpg`
    : null

  const thumb = ytThumb || post.cover_image
  const embedSrc = extractFirstVideoUrl(post.content)

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="group"
    >
      {/* Video player / thumbnail */}
      <div className="relative aspect-video bg-ink-950 mb-4 overflow-hidden">
        {playing && embedSrc ? (
          <iframe
            src={`${embedSrc}?autoplay=1`}
            title={post.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <>
            {thumb && (
              <img
                src={thumb}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
              />
            )}
            {/* Play button */}
            {embedSrc && (
              <button
                onClick={() => setPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group/btn"
                aria-label="Reproduzir vídeo"
              >
                <div className="w-14 h-14 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 group-hover/btn:scale-110">
                  <Play size={20} className="text-ink-950 ml-1" fill="currentColor" />
                </div>
              </button>
            )}
            {!embedSrc && (
              <Link to={`/artigos/${post.slug}`} className="absolute inset-0" />
            )}
          </>
        )}
      </div>

      {/* Info */}
      <Link to={`/artigos/${post.slug}`} className="block group/link">
        <h3 className="font-display text-lg font-semibold text-ink-950 dark:text-ink-50 leading-snug mb-2 group-hover/link:text-accent-700 dark:group-hover/link:text-accent-400 transition-colors line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="font-body text-sm text-ink-500 dark:text-ink-400 leading-relaxed line-clamp-2 mb-3">
            {post.excerpt}
          </p>
        )}
        <div className="flex items-center gap-3 text-ink-400 dark:text-ink-600">
          <span className="font-sans text-xs flex items-center gap-1">
            <Calendar size={11} />
            {formatDateShort(post.created_at)}
          </span>
          <span className="text-ink-200 dark:text-ink-700">·</span>
          <span className="font-sans text-xs flex items-center gap-1">
            <Clock size={11} />
            {post.reading_time} min
          </span>
        </div>
      </Link>
    </motion.article>
  )
}

export default function EntrevistasPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [featured, setFeatured] = useState<Post | null>(null)

  useEffect(() => {
    categoriesService.getBySlug('entrevistas')
      .then(cat => postsService.getByCategory(cat.slug))
      .then(ps => {
        setFeatured(ps[0] ?? null)
        setPosts(ps.slice(1))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
            Categoria
          </p>
          <h1 className="font-display text-5xl font-bold text-ink-950 dark:text-ink-50 mb-3">
            Entrevistas
          </h1>
          <p className="font-body text-ink-500 dark:text-ink-400 max-w-xl">
            Conversas com pessoas que constroem o Brasil — em vídeo e texto.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="skeleton aspect-video mb-4" />
                <div className="skeleton h-5 w-full mb-2" />
                <div className="skeleton h-4 w-3/4 mb-3" />
                <div className="skeleton h-3 w-32" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 && !featured ? (
          <div className="py-24 text-center">
            <p className="font-body text-ink-400 dark:text-ink-600">
              Nenhuma entrevista publicada ainda.
            </p>
          </div>
        ) : (
          <>
            {/* Featured interview */}
            {featured && (
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-16 pb-16 border-b border-ink-100 dark:border-ink-800"
              >
                <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-6">
                  Destaque
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                  <VideoCard post={featured} index={0} />
                  <div className="md:pt-2">
                    <Link to={`/artigos/${featured.slug}`}>
                      <h2 className="font-display text-3xl font-bold text-ink-950 dark:text-ink-50 leading-tight mb-4 hover:text-accent-700 dark:hover:text-accent-400 transition-colors">
                        {featured.title}
                      </h2>
                    </Link>
                    {featured.subtitle && (
                      <p className="font-display text-lg italic text-ink-600 dark:text-ink-400 mb-4">
                        {featured.subtitle}
                      </p>
                    )}
                    {featured.excerpt && (
                      <p className="font-body text-ink-600 dark:text-ink-400 leading-relaxed mb-5">
                        {featured.excerpt}
                      </p>
                    )}
                    <Link
                      to={`/artigos/${featured.slug}`}
                      className="font-sans text-sm uppercase tracking-widest text-accent-600 dark:text-accent-400 hover:underline"
                    >
                      Ler entrevista completa →
                    </Link>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Grid */}
            {posts.length > 0 && (
              <section>
                <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-10">
                  Todas as entrevistas
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {posts.map((post, i) => (
                    <VideoCard key={post.id} post={post} index={i} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <Newsletter />
    </>
  )
}
