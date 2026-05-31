import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Eye, Upload, Loader, ArrowLeft, Bold, Italic, Heading2, List, Quote, Link as LinkIcon, Video, X } from 'lucide-react'
import { postsService, categoriesService } from '../services'
import { slugify, estimateReadingTime } from '../utils'
import { buildEmbedHtml } from '../utils/embed'
import type { Category } from '../types'

const INPUT = "w-full font-sans text-sm bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl px-4 py-2.5 text-ink-900 dark:text-ink-100 focus:outline-none focus:border-accent-500 transition-colors"
const CARD = "bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-3xl p-5"

export default function AdminPostEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id || id === 'novo'
  const fileRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const [videoModal, setVideoModal] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoTitle, setVideoTitle] = useState('')

  const [form, setForm] = useState({
    title: '', subtitle: '', slug: '', excerpt: '', content: '',
    cover_image: '', category_id: '', tags: '',
    published: false, featured: false, reading_time: 1,
  })

  const set = (key: keyof typeof form, value: any) => {
    setForm(f => {
      const next = { ...f, [key]: value }
      if (key === 'title' && isNew) next.slug = slugify(value)
      if (key === 'content') next.reading_time = estimateReadingTime(value)
      return next
    })
  }

  useEffect(() => {
    categoriesService.getAll().then(setCategories).catch(() => {})
    if (!isNew) {
      postsService.getById(id!).then(post => {
        setForm({
          title: post.title || '', subtitle: post.subtitle || '', slug: post.slug || '',
          excerpt: post.excerpt || '', content: post.content || '', cover_image: post.cover_image || '',
          category_id: post.category_id || '', tags: post.tags?.join(', ') || '',
          published: post.published || false, featured: post.featured || false, reading_time: post.reading_time || 1,
        })
      }).catch(() => navigate('/admin/artigos')).finally(() => setLoading(false))
    }
  }, [id])

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { const url = await postsService.uploadCover(file); set('cover_image', url) }
    catch { setError('Erro ao fazer upload da imagem.') }
    finally { setUploading(false) }
  }

  const insertFormat = (before: string, after: string = '') => {
    const ta = document.getElementById('content-area') as HTMLTextAreaElement
    if (!ta) return
    const start = ta.selectionStart; const end = ta.selectionEnd
    const selected = form.content.slice(start, end)
    set('content', form.content.slice(0, start) + before + selected + after + form.content.slice(end))
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + before.length, end + before.length) }, 0)
  }

  const handleInsertVideo = () => {
    if (!videoUrl.trim()) return
    const html = buildEmbedHtml(videoUrl, videoTitle)
    if (!html) { alert('URL de vídeo inválida. Use YouTube ou Vimeo.'); return }
    set('content', form.content + '\n' + html + '\n')
    setVideoModal(false); setVideoUrl(''); setVideoTitle('')
  }

  const handleSave = async (publish?: boolean) => {
    if (!form.title.trim()) { setError('O título é obrigatório.'); return }
    setError(''); setSaving(true)
    try {
      const data = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [], published: publish !== undefined ? publish : form.published }
      if (isNew) { const created = await postsService.create(data); navigate(`/admin/artigos/${created.id}`) }
      else await postsService.update(id!, data)
    } catch (e: any) { setError(e.message || 'Erro ao salvar.') }
    finally { setSaving(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-ink-300 border-t-accent-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/artigos')} className="p-2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 rounded-2xl transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-sans text-xl font-bold text-ink-950 dark:text-ink-50">
            {isNew ? 'Novo artigo' : 'Editar artigo'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPreview(v => !v)} className={`flex items-center gap-1.5 font-sans text-sm px-3 py-2 rounded-2xl border transition-colors ${preview ? 'border-accent-500 text-accent-600 bg-accent-50 dark:bg-accent-900/20' : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400'}`}>
            <Eye size={14} /> Preview
          </button>
          <button onClick={() => handleSave(false)} disabled={saving} className="flex items-center gap-1.5 font-sans text-sm px-3 py-2 rounded-2xl border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-ink-400 transition-colors disabled:opacity-50">
            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />} Rascunho
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="flex items-center gap-1.5 font-sans text-sm px-4 py-2 rounded-2xl bg-accent-600 hover:bg-accent-700 text-white transition-colors disabled:opacity-50">
            {saving ? <Loader size={14} className="animate-spin" /> : null} Publicar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl font-sans text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* Editor */}
        <div className="space-y-4">
          <div className={CARD + ' space-y-4'}>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Título do artigo"
              className="w-full font-sans text-2xl font-bold text-ink-950 dark:text-ink-50 bg-transparent placeholder-ink-200 dark:placeholder-ink-700 outline-none border-b border-ink-100 dark:border-ink-800 pb-3" />
            <input type="text" value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Subtítulo (opcional)"
              className="w-full font-sans text-base italic text-ink-600 dark:text-ink-400 bg-transparent placeholder-ink-200 dark:placeholder-ink-700 outline-none" />
          </div>

          <div className={CARD + ' !p-0 overflow-hidden'}>
            <div className="flex items-center gap-1 px-4 py-2.5 border-b border-ink-100 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-950/30 flex-wrap">
              {[
                { icon: Bold, label: 'Negrito', action: () => insertFormat('<strong>', '</strong>') },
                { icon: Italic, label: 'Itálico', action: () => insertFormat('<em>', '</em>') },
                { icon: Heading2, label: 'Título', action: () => insertFormat('<h2>', '</h2>') },
                { icon: List, label: 'Lista', action: () => insertFormat('<ul>\n  <li>', '</li>\n</ul>') },
                { icon: Quote, label: 'Citação', action: () => insertFormat('<blockquote>', '</blockquote>') },
                { icon: LinkIcon, label: 'Link', action: () => insertFormat('<a href="">', '</a>') },
                { icon: Video, label: 'Vídeo', action: () => setVideoModal(true) },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={action} title={label}
                  className="p-2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 rounded-xl transition-colors">
                  <Icon size={15} />
                </button>
              ))}
            </div>
            {preview ? (
              <div className="p-6 min-h-[400px]">
                <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-ink-400">Sem conteúdo ainda.</p>' }} />
              </div>
            ) : (
              <textarea id="content-area" value={form.content} onChange={e => set('content', e.target.value)}
                placeholder="Escreva o conteúdo em HTML…" rows={22}
                className="w-full font-mono text-sm text-ink-800 dark:text-ink-200 bg-transparent p-5 outline-none resize-none placeholder-ink-300 dark:placeholder-ink-700" />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className={CARD}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Status</h3>
            {[{ key: 'published', label: 'Publicado' }, { key: 'featured', label: 'Destaque' }].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer mb-2">
                <input type="checkbox" checked={form[key as 'published' | 'featured']} onChange={e => set(key as any, e.target.checked)} className="accent-accent-600 w-4 h-4 rounded" />
                <span className="font-sans text-sm text-ink-700 dark:text-ink-300">{label}</span>
              </label>
            ))}
          </div>

          <div className={CARD}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Imagem de capa</h3>
            {form.cover_image && <img src={form.cover_image} alt="Capa" className="w-full aspect-video object-cover rounded-2xl mb-3" />}
            <input type="text" value={form.cover_image} onChange={e => set('cover_image', e.target.value)} placeholder="URL da imagem" className={INPUT + ' mb-2'} />
            <input ref={fileRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 font-sans text-xs text-ink-600 dark:text-ink-400 hover:text-accent-600 transition-colors">
              {uploading ? <Loader size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? 'Enviando…' : 'Fazer upload'}
            </button>
          </div>

          <div className={CARD}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">URL</h3>
            <input type="text" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="slug-do-artigo" className={INPUT} />
            <p className="font-sans text-xs text-ink-400 mt-1.5">/artigos/{form.slug || 'slug'}</p>
          </div>

          <div className={CARD}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Categoria</h3>
            <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className={INPUT + ' cursor-pointer'}>
              <option value="">Sem categoria</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div className={CARD}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Resumo</h3>
            <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Breve descrição do artigo…" rows={3} className={INPUT + ' resize-none'} />
          </div>

          <div className={CARD}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Tags</h3>
            <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="tag1, tag2, tag3" className={INPUT} />
            <p className="font-sans text-xs text-ink-400 mt-1.5">Separadas por vírgula</p>
          </div>

          <div className="bg-ink-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-2xl p-3">
            <p className="font-sans text-xs text-ink-400">Leitura estimada: <strong className="text-ink-700 dark:text-ink-300">{form.reading_time} min</strong></p>
          </div>
        </div>
      </div>

      {/* Video modal */}
      {videoModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-3xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-sans text-sm font-semibold text-ink-950 dark:text-ink-50">Inserir vídeo</h3>
              <button onClick={() => setVideoModal(false)} className="p-2 text-ink-400 hover:text-ink-700 rounded-xl transition-colors"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-sans text-xs uppercase tracking-widest text-ink-400 mb-1.5 block">URL do vídeo *</label>
                <input type="text" autoFocus value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." className={INPUT} />
                <p className="font-sans text-xs text-ink-400 mt-1">Suporta YouTube e Vimeo</p>
              </div>
              <div>
                <label className="font-sans text-xs uppercase tracking-widest text-ink-400 mb-1.5 block">Título (opcional)</label>
                <input type="text" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} placeholder="Ex: Entrevista com João Silva" className={INPUT} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleInsertVideo} className="flex-1 bg-accent-600 hover:bg-accent-700 text-white font-sans text-sm py-2.5 rounded-2xl transition-colors">Inserir vídeo</button>
                <button onClick={() => setVideoModal(false)} className="px-4 border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 font-sans text-sm rounded-2xl hover:border-ink-400 transition-colors">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
