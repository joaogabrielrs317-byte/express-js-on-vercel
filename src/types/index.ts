export interface Post {
  id: string
  title: string
  subtitle: string
  slug: string
  content: string
  excerpt: string
  cover_image: string
  author_id: string
  category_id: string
  category?: Category
  tags: string[]
  published: boolean
  featured: boolean
  reading_time: number
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
}

export interface Author {
  id: string
  name: string
  bio: string
  avatar: string
  email: string
  twitter?: string
  instagram?: string
  linkedin?: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  created_at: string
}
