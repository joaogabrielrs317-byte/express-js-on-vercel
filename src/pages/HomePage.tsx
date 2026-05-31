
import { Link } from 'react-router-dom'
import Hero from '../components/home/Hero'
import FeaturedPost from '../components/home/FeaturedPost'
import PostCard from '../components/common/PostCard'
import AuthorCard from '../components/home/AuthorCard'
import PublishedIn from '../components/home/PublishedIn'
import Newsletter from '../components/common/Newsletter'
import { PostCardSkeleton, FeaturedPostSkeleton } from '../components/common/Skeletons'
import { usePosts, useFeaturedPost } from '../hooks/usePosts'
import { useCategories } from '../hooks/useCategories'

export default function HomePage() {
  const { post: featured, loading: featuredLoading } = useFeaturedPost()
  const { posts, loading: postsLoading } = usePosts(9)
  const { categories } = useCategories()

  const recent = featured ? posts.filter(p => p.id !== featured.id).slice(0, 6) : posts.slice(0, 6)

  return (
    <>
      <Hero />

      <div className="max-w-6xl mx-auto px-6">
      {/* Published in */}
        <PublishedIn />

        {/* Featured */}
        {(featuredLoading || featured) && (
          <section className="py-12 border-b border-ink-100 dark:border-ink-800">
            <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-8">
              Destaque
            </p>
            {featuredLoading ? <FeaturedPostSkeleton /> : featured && <FeaturedPost post={featured} />}
          </section>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <section className="py-10 border-b border-ink-100 dark:border-ink-800">
            <div className="flex flex-wrap gap-3">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  to={`/categorias/${cat.slug}`}
                  className="font-sans text-xs uppercase tracking-widest text-ink-600 dark:text-ink-400 border border-ink-200 dark:border-ink-700 px-4 py-2 hover:border-ink-950 dark:hover:border-ink-300 hover:text-ink-950 dark:hover:text-ink-50 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest posts */}
        <section id="publicacoes" className="py-16">
          <div className="flex items-baseline justify-between mb-12">
            <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600">
              Últimas publicações
            </p>
          </div>

          {postsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)}
            </div>
          ) : recent.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-body text-ink-400 dark:text-ink-600">Nenhuma publicação ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {recent.map((post, i) => (
                <PostCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Author */}
        <div className="border-t border-ink-100 dark:border-ink-800">
          <AuthorCard />
        </div>
      </div>

      <Newsletter />
    </>
  )
}
