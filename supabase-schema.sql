-- =============================================
-- SCHEMA: Portfólio Jornalístico
-- Execute no Supabase SQL Editor
-- =============================================

-- CATEGORIES
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  color text,
  created_at timestamptz default now()
);

-- POSTS
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  slug text not null unique,
  content text not null default '',
  excerpt text,
  cover_image text,
  author_id uuid references auth.users(id),
  category_id uuid references categories(id),
  tags text[] default '{}',
  published boolean default false,
  featured boolean default false,
  reading_time integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NEWSLETTER
create table if not exists newsletter (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

alter table categories enable row level security;
alter table posts enable row level security;
alter table newsletter enable row level security;

-- Categories: public read, authenticated write
create policy "Public read categories"
  on categories for select using (true);

create policy "Auth write categories"
  on categories for all using (auth.role() = 'authenticated');

-- Posts: public read published, authenticated full access
create policy "Public read published posts"
  on posts for select using (published = true);

create policy "Auth full access posts"
  on posts for all using (auth.role() = 'authenticated');

-- Newsletter: anyone can insert, only auth can read
create policy "Public subscribe newsletter"
  on newsletter for insert with check (true);

create policy "Auth read newsletter"
  on newsletter for select using (auth.role() = 'authenticated');

-- =============================================
-- STORAGE: media bucket
-- =============================================

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Public read media"
  on storage.objects for select using (bucket_id = 'media');

create policy "Auth upload media"
  on storage.objects for insert with check (
    bucket_id = 'media' and auth.role() = 'authenticated'
  );

create policy "Auth delete media"
  on storage.objects for delete using (
    bucket_id = 'media' and auth.role() = 'authenticated'
  );

-- =============================================
-- DEFAULT CATEGORIES
-- =============================================

insert into categories (name, slug, description) values
  ('Política', 'politica', 'Cobertura política, eleições e poder'),
  ('Cultura', 'cultura', 'Arte, cinema, literatura e comportamento'),
  ('Tecnologia', 'tecnologia', 'Inovação, startups e mundo digital'),
  ('Sociedade', 'sociedade', 'Questões sociais e cotidiano brasileiro'),
  ('Entrevistas', 'entrevistas', 'Conversas com pessoas que fazem história'),
  ('Opinião', 'opiniao', 'Análises e perspectivas pessoais')
on conflict (slug) do nothing;
