import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ArrowUpRight } from 'lucide-react'
import type { Post } from '../../types'
import { formatDateShort } from '../../utils'

interface Props {
  post: Post
  index?: number
}

export default function PostCard({ post, index = 0 }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      className="group"
    >
      <Link
        to={`/artigos/${post.slug}`}
        className="block rounded-2xl overflow-hidden border border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-ink-300 dark:hover:border-ink-600 hover:shadow-lg transition-all duration-300"
      >
        {/* Imagem */}
        <div className="overflow-hidden aspect-[16/9] bg-ink-100 dark:bg-ink-800 relative">
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-ink-100 to-ink-200 dark:from-ink-800 dark:to-ink-700" />
          )}

          {/* Badge de categoria */}
          {post.category && (
            <span className="absolute top-3 left-3 font-sans text-xs uppercase tracking-widest bg-white/90 dark:bg-ink-900/90 text-accent-600 dark:text-accent-400 px-3 py-1 backdrop-blur-sm">
              {post.category.name}
            </span>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-5">
          <h3 className="font-display text-lg font-semibold text-ink-950 dark:text-ink-50 leading-snug mb-2 group-hover:text-accent-700 dark:group-hover:text-accent-400 transition-colors line-clamp-2">
            {post.title}
          </h3>

          <p className="font-body text-sm text-ink-500 dark:text-ink-400 leading-relaxed line-clamp-2 mb-4">
            {post.excerpt}
          </p>

          {/* Footer do card */}
          <div className="flex items-center justify-between text-ink-400 dark:text-ink-600">
            <div className="flex items-center gap-3">
              <time className="font-sans text-xs">{formatDateShort(post.created_at)}</time>
              <span className="text-ink-200 dark:text-ink-700">·</span>
              <span className="font-sans text-xs flex items-center gap-1">
                <Clock size={11} />
                {post.reading_time} min
              </span>
            </div>
            <span className="w-7 h-7 rounded-full border border-ink-200 dark:border-ink-700 flex items-center justify-center group-hover:border-accent-500 group-hover:bg-accent-50 dark:group-hover:bg-accent-900/20 transition-all">
              <ArrowUpRight size={13} className="text-ink-400 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
