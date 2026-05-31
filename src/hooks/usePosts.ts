import { useState, useEffect } from 'react'
import type { Post } from '../types'
import { postsService } from '../services'

export function usePosts(limit?: number) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    postsService.getPublished(limit)
      .then(setPosts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [limit])

  return { posts, loading, error }
}

export function useFeaturedPost() {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    postsService.getFeatured()
      .then(setPost)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { post, loading, error }
}

export function usePost(slug: string) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    postsService.getBySlug(slug)
      .then(setPost)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [slug])

  return { post, loading, error }
}

export function useRelatedPosts(postId: string, categoryId: string) {
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    if (!postId || !categoryId) return
    postsService.getRelated(postId, categoryId)
      .then(setPosts)
      .catch(() => {})
  }, [postId, categoryId])

  return { posts }
}
