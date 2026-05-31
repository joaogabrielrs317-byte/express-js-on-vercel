import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Calendar, ArrowLeft, Tag } from 'lucide-react'
import { usePost, useRelatedPosts } from '../hooks/usePosts'
import ReadingProgress from '../components/post/ReadingProgress'
import ShareButtons from '../components/post/ShareButtons'
import RichTextRenderer from '../components/post/RichTextRenderer'
import PostCard from '../components/common/PostCard'
import Newsletter from '../components/common/Newsletter'
import { formatDate } from '../utils'

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { post, loading, error } = usePost(slug || '')
  const { posts: related } = useRelatedPosts(
    post?.id || '',
    post?.category_id || ''
  )

  if (loading) {
    return (
      <div className="pt-24 max-w-3xl mx-auto px-6 animate-pulse">
        <div className="skeleton h-4 w-24 mb-8" />
        <div className="skeleton h-12 w-full mb-3" />
        <div className="skeleton h-8 w-3/4 mb-6" />
        <div className="skeleton aspect-[16/7] mb-12" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-5" style={{ width: `${85 + Math.random() * 15}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !post) {
    return <Navigate to="/404" replace />
  }

  return (
    <>
      <ReadingProgress />

      <article className="pt-24">
        {/* Header */}
        <header className="max-w-3xl mx-auto px-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 font-sans text-xs text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors mb-8"
            >
              <ArrowLeft size={13} />
              Voltar
            </Link>

            <div className="flex items-center gap-3 mb-4">
              {post.category && (
                <Link
                  to={`/categorias/${post.category.slug}`}
                  className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400 hover:underline"
                >
                  {post.category.name}
                </Link>
              )}
              <span className="text-ink-200 dark:text-ink-700">·</span>
              <span className="font-sans text-xs text-ink-400 flex items-center gap-1">
                <Clock size={11} />
                {post.reading_time} min de leitura
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl font-bold text-ink-950 dark:text-ink-50 leading-tight mb-4">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="font-display text-xl text-ink-600 dark:text-ink-400 italic leading-relaxed mb-6">
                {post.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-t border-b border-ink-100 dark:border-ink-800">
              <div className="flex items-center gap-2 text-ink-500 dark:text-ink-400">
                <Calendar size={13} />
                <time className="font-sans text-sm">{formatDate(post.created_at)}</time>
              </div>
              <ShareButtons title={post.title} url={`/artigos/${post.slug}`} />
            </div>
          </motion.div>
        </header>

        {/* Cover image */}
        {post.cover_image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-5xl mx-auto px-6 mb-12"
          >
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full aspect-[16/7] object-cover"
            />
          </motion.div>
        )}

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-3xl mx-auto px-6 mb-16"
        >
          <RichTextRenderer content={post.content} />
        </motion.div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="max-w-3xl mx-auto px-6 mb-12">
            <div className="flex flex-wrap gap-2 pt-8 border-t border-ink-100 dark:border-ink-800">
              <Tag size={14} className="text-ink-400 mt-0.5" />
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="font-sans text-xs text-ink-500 dark:text-ink-400 bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 px-3 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Share again */}
        <div className="max-w-3xl mx-auto px-6 mb-16">
          <div className="border-t border-ink-100 dark:border-ink-800 pt-8">
            <ShareButtons title={post.title} url={`/artigos/${post.slug}`} />
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="max-w-6xl mx-auto px-6 py-16 border-t border-ink-100 dark:border-ink-800">
            <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-10">
              Leia também
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {related.map((rp, i) => (
                <PostCard key={rp.id} post={rp} index={i} />
              ))}
            </div>
          </section>
        )}
      </article>

      <Newsletter />
    </>
  )
}
