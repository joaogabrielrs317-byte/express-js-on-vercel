import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
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
      <Link to={`/artigos/${post.slug}`} className="block">
        {post.cover_image && (
          <div className="overflow-hidden aspect-[16/9] mb-4">
            <img
              src={post.cover_image}
              alt={post.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        )}

        {post.category && (
          <span className="inline-block font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-2">
            {post.category.name}
          </span>
        )}

        <h3 className="font-display text-xl font-semibold text-ink-950 dark:text-ink-50 leading-snug mb-2 group-hover:text-accent-700 dark:group-hover:text-accent-400 transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="font-body text-sm text-ink-600 dark:text-ink-400 leading-relaxed line-clamp-3 mb-3">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-3 text-ink-400 dark:text-ink-600">
          <time className="font-sans text-xs">{formatDateShort(post.created_at)}</time>
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
