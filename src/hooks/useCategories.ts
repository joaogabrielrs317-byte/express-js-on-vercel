import { useState, useEffect } from 'react'
import type { Category } from '../types'
import { categoriesService } from '../services'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    categoriesService.getAll()
      .then(setCategories)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const reload = () => {
    setLoading(true)
    categoriesService.getAll()
      .then(setCategories)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }

  return { categories, loading, error, reload }
}
