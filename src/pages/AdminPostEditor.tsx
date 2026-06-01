import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Save, Eye, Upload, Loader, ArrowLeft,
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Link as LinkIcon,
  Video, X, Unlink
} from 'lucide-react'
import { postsService, categoriesService } from '../services'
import { slugify, estimateReadingTime } from '../utils'
import { buildEmbedHtml } from '../utils/embed'
import type { Category } from '../types'

const INPUT = "w-full font-sans text-sm bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl px-4 py-2.5 text-ink-900 dark:text-ink-100 focus:outline-none focus:border-accent-500 transition-colors"
const CARD = "bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-3xl p-5"

interface ToolbarButtonProps {
  onClick: () => void
  title: string
  active?: boolean
  children: React.ReactNode
}

function ToolbarButton({ onClick, title, active, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`p-2 rounded-xl transition-colors ${
        active
          ? 'bg-accent-100 dark:bg-accent-900/40 text-accent-600 dark:text-accent-400'
          : 'text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800'
      }`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-ink-200 dark:bg-ink-700 mx-1" />
}

export default function AdminPostEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id || id === 'novo'
  const fileRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)
  const [videoModal, setVideoModal] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoTitle, setVideoTitle] = useState('')
  const [linkModal, setLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [savedSelection, setSavedSelection] = useState<Range | null>(null)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())

  const [form, setForm] = useState({
    title: '', subtitle: '', slug: '', excerpt: '', content: '',
    cover_image: '', category_id: '', tags: '',
    published: false, featured: false, reading_time: 1,
  })

  const set = (key: keyof typeof form, value: any) => {
    setForm(f => {
      const next = { ...f, [key]: value }
      if (key === 'title' && isNew) next.slug = slugify(value)
      return next
    })
  }

  // Sync editor content to form
  const syncContent = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      setForm(f => ({ ...f, content: html, reading_time: estimateReadingTime(editorRef.current?.innerText || '') }))
    }
  }, [])

  // Update active formats on selection change
  const updateActiveFormats = useCallback(() => {
    const formats = new Set<string>()
    if (document.queryCommandState('bold')) formats.add('bold')
    if (document.queryCommandState('italic')) formats.add('italic')
    if (document.queryCommandState('underline')) formats.add('underline')
    if (document.queryCommandState('strikeThrough')) formats.add('strikethrough')
    if (document.queryCommandState('justifyLeft')) formats.add('left')
    if (document.queryCommandState('justifyCenter')) formats.add('center')
    if (document.queryCommandState('justifyRight')) formats.add('right')
    if (document.queryCommandState('justifyFull')) formats.add('justify')
    if (document.queryCommandState('insertUnorderedList')) formats.add('ul')
    if (document.queryCommandState('insertOrderedList')) formats.add('ol')
    setActiveFormats(formats)
  }, [])

  useEffect(() => {
    document.addEventListener('selectionchange', updateActiveFormats)
    return () => document.removeEventListener('selectionchange', updateActiveFormats)
  }, [updateActiveFormats])

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
        // Set editor content after mount
        setTimeout(() => {
          if (editorRef.current && post.content) {
            editorRef.current.innerHTML = post.content
          }
        }, 100)
      }).catch(() => navigate('/admin/artigos')).finally(() => setLoading(false))
    }
  }, [id])

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus()
    document.execCommand(command, false, value)
    syncContent()
    updateActiveFormats()
  }

  const insertHeading = (tag: 'h1' | 'h2' | 'h3') => {
    editorRef.current?.focus()
    document.execCommand('formatBlock', false, tag)
    syncContent()
  }

  const insertBlockquote = () => {
    editorRef.current?.focus()
    document.execCommand('formatBlock', false, 'blockquote')
    syncContent()
  }

  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      setSavedSelection(sel.getRangeAt(0).cloneRange())
      setLinkText(sel.toString())
    }
  }

  const restoreSelection = (range: Range | null) => {
    if (!range) return
    const sel = window.getSelection()
    if (sel) {
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }

  const handleInsertLink = () => {
    if (!linkUrl.trim()) return
    restoreSelection(savedSelection)
    editorRef.current?.focus()
    if (savedSelection && !savedSelection.collapsed) {
      document.execCommand('createLink', false, linkUrl)
    } else {
      const text = linkText || linkUrl
      document.execCommand('insertHTML', false, `<a href="${linkUrl}" target="_blank">${text}</a>`)
    }
    syncContent()
    setLinkModal(false)
    setLinkUrl('')
    setLinkText('')
    setSavedSelection(null)
  }

  const handleInsertVideo = () => {
    if (!videoUrl.trim()) return
    const html = buildEmbedHtml(videoUrl, videoTitle)
    if (!html) { alert('URL inválida. Use YouTube ou Vimeo.'); return }
    editorRef.current?.focus()
    document.execCommand('insertHTML', false, html)
    syncContent()
    setVideoModal(false)
    setVideoUrl('')
    setVideoTitle('')
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { const url = await postsService.uploadCover(file); set('cover_image', url) }
    catch { setError('Erro ao fazer upload da imagem.') }
    finally { setUploading(false) }
  }

  const handleSave = async (publish?: boolean) => {
    if (!form.title.trim()) { setError('O título é obrigatório.'); return }
    setError(''); setSaving(true)
    try {
      const content = editorRef.current?.innerHTML || form.content
      const data = {
        ...form,
        content,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        published: publish !== undefined ? publish : form.published
      }
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
            <Eye size={14} /> {preview ? 'Editar' : 'Preview'}
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
          {/* Título e subtítulo */}
          <div className={CARD + ' space-y-4'}>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Título do artigo"
              className="w-full font-sans text-2xl font-bold text-ink-950 dark:text-ink-50 bg-transparent placeholder-ink-200 dark:placeholder-ink-700 outline-none border-b border-ink-100 dark:border-ink-800 pb-3"
            />
            <input
              type="text"
              value={form.subtitle}
              onChange={e => set('subtitle', e.target.value)}
              placeholder="Subtítulo (opcional)"
              className="w-full font-sans text-base italic text-ink-600 dark:text-ink-400 bg-transparent placeholder-ink-200 dark:placeholder-ink-700 outline-none"
            />
          </div>

          {/* Editor WYSIWYG */}
          <div className={CARD + ' !p-0 overflow-hidden'}>
            {!preview && (
              <div className="flex items-center gap-0.5 px-3 py-2.5 border-b border-ink-100 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-950/30 flex-wrap">
                {/* Títulos */}
                <ToolbarButton onClick={() => insertHeading('h1')} title="Título grande (H1)"><Heading1 size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => insertHeading('h2')} title="Subtítulo 1 (H2)"><Heading2 size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => insertHeading('h3')} title="Subtítulo 2 (H3)"><Heading3 size={15} /></ToolbarButton>

                <ToolbarDivider />

                {/* Formatação de texto */}
                <ToolbarButton onClick={() => exec('bold')} title="Negrito" active={activeFormats.has('bold')}><Bold size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => exec('italic')} title="Itálico" active={activeFormats.has('italic')}><Italic size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => exec('underline')} title="Sublinhado" active={activeFormats.has('underline')}><Underline size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => exec('strikeThrough')} title="Tachado" active={activeFormats.has('strikethrough')}><Strikethrough size={15} /></ToolbarButton>

                <ToolbarDivider />

                {/* Alinhamento */}
                <ToolbarButton onClick={() => exec('justifyLeft')} title="Alinhar à esquerda" active={activeFormats.has('left')}><AlignLeft size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => exec('justifyCenter')} title="Centralizar" active={activeFormats.has('center')}><AlignCenter size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => exec('justifyRight')} title="Alinhar à direita" active={activeFormats.has('right')}><AlignRight size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => exec('justifyFull')} title="Justificar" active={activeFormats.has('justify')}><AlignJustify size={15} /></ToolbarButton>

                <ToolbarDivider />

                {/* Listas */}
                <ToolbarButton onClick={() => exec('insertUnorderedList')} title="Lista com marcadores" active={activeFormats.has('ul')}><List size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => exec('insertOrderedList')} title="Lista numerada" active={activeFormats.has('ol')}><ListOrdered size={15} /></ToolbarButton>
                <ToolbarButton onClick={insertBlockquote} title="Citação"><Quote size={15} /></ToolbarButton>

                <ToolbarDivider />

                {/* Link e Vídeo */}
                <ToolbarButton onClick={() => { saveSelection(); setLinkModal(true) }} title="Inserir link"><LinkIcon size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => exec('unlink')} title="Remover link"><Unlink size={15} /></ToolbarButton>
                <ToolbarButton onClick={() => setVideoModal(true)} title="Inserir vídeo"><Video size={15} /></ToolbarButton>
              </div>
            )}

            {preview ? (
              <div className="p-6 min-h-[400px]">
                <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: form.content || '<p style="color:#999">Sem conteúdo ainda.</p>' }} />
              </div>
            ) : (
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={syncContent}
                onKeyUp={updateActiveFormats}
                onMouseUp={updateActiveFormats}
                data-placeholder="Escreva o conteúdo do artigo aqui..."
                className="min-h-[420px] p-6 outline-none prose-editorial focus:ring-0 empty:before:content-[attr(data-placeholder)] empty:before:text-ink-300 dark:empty:before:text-ink-700"
                style={{ whiteSpace: 'pre-wrap' }}
              />
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

      {/* Modal de Link */}
      {linkModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-3xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-sans text-sm font-semibold text-ink-950 dark:text-ink-50">Inserir link</h3>
              <button onClick={() => setLinkModal(false)} className="p-2 text-ink-400 hover:text-ink-700 rounded-xl transition-colors"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="font-sans text-xs uppercase tracking-widest text-ink-400 mb-1.5 block">URL *</label>
                <input type="url" autoFocus value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://exemplo.com" className={INPUT} />
              </div>
              <div>
                <label className="font-sans text-xs uppercase tracking-widest text-ink-400 mb-1.5 block">Texto do link</label>
                <input type="text" value={linkText} onChange={e => setLinkText(e.target.value)} placeholder="Texto visível (opcional)" className={INPUT} />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleInsertLink} className="flex-1 bg-accent-600 hover:bg-accent-700 text-white font-sans text-sm py-2.5 rounded-2xl transition-colors">Inserir link</button>
                <button onClick={() => setLinkModal(false)} className="px-4 border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 font-sans text-sm rounded-2xl hover:border-ink-400 transition-colors">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vídeo */}
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
