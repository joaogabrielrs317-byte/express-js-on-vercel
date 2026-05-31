import { useParams, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import PostCard from '../components/common/PostCard'
import Newsletter from '../components/common/Newsletter'
import { PostCardSkeleton } from '../components/common/Skeletons'
import type { Post, Category } from '../types'
import { postsService, categoriesService } from '../services'

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [posts, setPosts] = useState<Post[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    Promise.all([
      categoriesService.getBySlug(slug),
      postsService.getByCategory(slug),
    ])
      .then(([cat, ps]) => {
        setCategory(cat)
        setPosts(ps)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (notFound) return <Navigate to="/404" replace />

  return (
    <>
      <div className="pt-24 pb-16 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-16 border-b border-ink-100 dark:border-ink-800 pb-12"
        >
          <p className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-3">
            Categoria
          </p>
          <h1 className="font-display text-5xl font-bold text-ink-950 dark:text-ink-50 mb-3">
            {loading ? (
              <span className="skeleton inline-block w-48 h-12 rounded" />
            ) : (
              category?.name || slug
            )}
          </h1>
          {category?.description && (
            <p className="font-body text-ink-600 dark:text-ink-400 max-w-xl">
              {category.description}
            </p>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-body text-ink-400 dark:text-ink-600">
              Nenhuma publicação nesta categoria ainda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} index={i} />
            ))}
          </div>
        )}
      </div>

      <Newsletter />
    </>
  )
}
