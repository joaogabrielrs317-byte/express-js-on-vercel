import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://znpqdizqjhzpsgqtylwj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpucHFkaXpxamh6cHNncXR5bHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMjY5NTIsImV4cCI6MjA5NTgwMjk1Mn0.RpZszxe9eNxwZ484aCN5wO_KHLKqHksWD383QvCMOpI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
