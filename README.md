# Portfólio Jornalístico — Ana Beatriz Ferreira

Plataforma editorial premium. React + Vite + TypeScript + TailwindCSS + Supabase + Netlify.

## Setup rápido

### 1. Supabase
1. Crie um projeto em supabase.com
2. Execute `supabase-schema.sql` no SQL Editor
3. Copie a Project URL e a anon key

### 2. Variáveis de ambiente
Crie `.env` na raiz:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

### 3. Local
```bash
npm install
npm run dev
```

### 4. Deploy Netlify
1. Suba para GitHub
2. Netlify > Import from Git
3. Configure as env vars no painel Netlify
4. Deploy automático

## Admin
Acesse `/admin/login`. Crie o usuário admin em Supabase > Authentication > Users.

## Personalização
- Textos da autora: `src/components/home/Hero.tsx` e `AuthorCard.tsx`
- Redes sociais: `src/components/common/Footer.tsx`
