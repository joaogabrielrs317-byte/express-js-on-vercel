import { supabase } from '../lib/supabase'
import type { Post, Category, NewsletterSubscriber } from '../types'

export const postsService = {
  async getPublished(limit?: number) {
    let query = supabase
      .from('posts')
      .select('*, category:categories(*)')
      .eq('published', true)
      .order('created_at', { ascending: false })
    if (limit) query = query.limit(limit)
    const { data, error } = await query
    if (error) throw error
    return data as Post[]
  },

  async getFeatured() {
    const { data, error } = await supabase
      .from('posts')
      .select('*, category:categories(*)')
      .eq('published', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (error) throw error
    return data as Post
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .eq('published', true)
      .single()
    if (error) throw error
    return data as Post
  },

  async getByCategory(categorySlug: string, limit?: number) {
    let query = supabase
      .from('posts')
      .select('*, category:categories(*)')
      .eq('published', true)
      .eq('categories.slug', categorySlug)
      .order('created_at', { ascending: false })
    if (limit) query = query.limit(limit)
    const { data, error } = await query
    if (error) throw error
    return data as Post[]
  },

  async getRelated(postId: string, categoryId: string, limit = 3) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, category:categories(*)')
      .eq('published', true)
      .eq('category_id', categoryId)
      .neq('id', postId)
      .limit(limit)
    if (error) throw error
    return data as Post[]
  },

  async search(query: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, category:categories(*)')
      .eq('published', true)
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Post[]
  },

  // Admin
  async getAll() {
    const { data, error } = await supabase
      .from('posts')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Post[]
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*, category:categories(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return data as Post
  },

  async create(post: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .insert([post])
      .select()
      .single()
    if (error) throw error
    return data as Post
  },

  async update(id: string, post: Partial<Post>) {
    const { data, error } = await supabase
      .from('posts')
      .update({ ...post, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as Post
  },

  async delete(id: string) {
    const { error } = await supabase.from('posts').delete().eq('id', id)
    if (error) throw error
  },

  async togglePublished(id: string, published: boolean) {
    const { error } = await supabase
      .from('posts')
      .update({ published, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },

  async uploadCover(file: File) {
    const ext = file.name.split('.').pop()
    const filename = `covers/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('media').upload(filename, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('media').getPublicUrl(filename)
    return data.publicUrl
  },
}

export const categoriesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    if (error) throw error
    return data as Category[]
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error) throw error
    return data as Category
  },

  async create(category: Partial<Category>) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single()
    if (error) throw error
    return data as Category
  },

  async delete(id: string) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  },
}

export const newsletterService = {
  async subscribe(email: string) {
    const { error } = await supabase
      .from('newsletter')
      .insert([{ email }])
    if (error) {
      if (error.code === '23505') throw new Error('Este e-mail já está cadastrado.')
      throw error
    }
  },

  async getAll() {
    const { data, error } = await supabase
      .from('newsletter')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as NewsletterSubscriber[]
  },
}
