import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ArrowRight } from 'lucide-react'
import type { Post } from '../../types'
import { formatDate } from '../../utils'

interface Props {
  post: Post
}

export default function FeaturedPost({ post }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="group"
    >
      <Link to={`/artigos/${post.slug}`}>
        {post.cover_image && (
          <div className="overflow-hidden aspect-[21/9] md:aspect-[3/1] mb-6">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
            />
          </div>
        )}

        <div className="flex items-center gap-4 mb-3">
          {post.category && (
            <span className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400">
              {post.category.name}
            </span>
          )}
          <span className="font-sans text-xs text-ink-400 flex items-center gap-1">
            <Clock size={11} />
            {post.reading_time} min de leitura
          </span>
        </div>

        <h2 className="font-display text-3xl md:text-4xl font-bold text-ink-950 dark:text-ink-50 leading-tight mb-3 group-hover:text-accent-700 dark:group-hover:text-accent-400 transition-colors">
          {post.title}
        </h2>

        {post.subtitle && (
          <p className="font-display text-xl text-ink-600 dark:text-ink-400 italic mb-4 leading-relaxed">
            {post.subtitle}
          </p>
        )}

        <div className="flex items-center gap-4">
          <time className="font-sans text-sm text-ink-500 dark:text-ink-400">
            {formatDate(post.created_at)}
          </time>
          <span className="flex items-center gap-1 font-sans text-sm text-accent-600 dark:text-accent-400 group-hover:gap-2 transition-all">
            Ler matéria <ArrowRight size={14} />
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
