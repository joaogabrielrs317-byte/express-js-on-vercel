import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import {
  Save, Eye, Upload, Loader, ArrowLeft, X, Check,
  Globe, EyeOff, Sparkles,
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading2, Heading3, Quote, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Image as ImageIcon, Minus,
  Type, RotateCcw, RotateCw
} from 'lucide-react'
import { postsService, categoriesService } from '../services'
import { slugify, estimateReadingTime } from '../utils'
import { buildEmbedHtml, getEmbedUrl } from '../utils/embed'
import type { Category } from '../types'

// ─── Toolbar Button ───────────────────────────────────────────────────────────

function ToolBtn({
  onClick, active, disabled, title, children
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onMouseDown={e => { e.preventDefault(); onClick() }}
      disabled={disabled}
      title={title}
      className={`
        flex items-center justify-center w-8 h-8 rounded-lg transition-all text-sm
        ${active
          ? 'bg-accent-100 dark:bg-accent-900/40 text-accent-700 dark:text-accent-300'
          : 'text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-900 dark:hover:text-ink-100'
        }
        disabled:opacity-30 disabled:cursor-not-allowed
      `}
    >
      {children}
    </button>
  )
}

function ToolDivider() {
  return <div className="w-px h-5 bg-ink-200 dark:bg-ink-700 mx-0.5 flex-shrink-0" />
}

// ─── Main Toolbar ─────────────────────────────────────────────────────────────

function MainToolbar({ editor, onImageInsert, onVideoInsert }: {
  editor: any
  onImageInsert: () => void
  onVideoInsert: () => void
}) {
  if (!editor) return null

  const setLink = () => {
    const prev = editor.getAttributes('link').href
    const url = window.prompt('URL do link:', prev || 'https://')
    if (url === null) return
    if (url === '') { editor.chain().focus().unsetLink().run(); return }
    editor.chain().focus().setLink({ href: url, target: '_blank' }).run()
  }

  return (
    <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 border-b border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 sticky top-0 z-20">

      {/* History */}
      <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Desfazer (Ctrl+Z)" disabled={!editor.can().undo()}>
        <RotateCcw size={14} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Refazer (Ctrl+Y)" disabled={!editor.can().redo()}>
        <RotateCw size={14} />
      </ToolBtn>

      <ToolDivider />

      {/* Headings */}
      <ToolBtn
        onClick={() => editor.chain().focus().setParagraph().run()}
        active={editor.isActive('paragraph')}
        title="Parágrafo"
      >
        <Type size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive('heading', { level: 2 })}
        title="Título H2"
      >
        <Heading2 size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive('heading', { level: 3 })}
        title="Subtítulo H3"
      >
        <Heading3 size={14} />
      </ToolBtn>

      <ToolDivider />

      {/* Inline formatting */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        title="Negrito (Ctrl+B)"
      >
        <Bold size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        title="Itálico (Ctrl+I)"
      >
        <Italic size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive('underline')}
        title="Sublinhado (Ctrl+U)"
      >
        <UnderlineIcon size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        title="Tachado"
      >
        <Strikethrough size={14} />
      </ToolBtn>

      <ToolDivider />

      {/* Alignment */}
      <ToolBtn
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        active={editor.isActive({ textAlign: 'left' })}
        title="Alinhar à esquerda"
      >
        <AlignLeft size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        active={editor.isActive({ textAlign: 'center' })}
        title="Centralizar"
      >
        <AlignCenter size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        active={editor.isActive({ textAlign: 'right' })}
        title="Alinhar à direita"
      >
        <AlignRight size={14} />
      </ToolBtn>

      <ToolDivider />

      {/* Lists */}
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive('bulletList')}
        title="Lista com marcadores"
      >
        <List size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
        title="Lista numerada"
      >
        <ListOrdered size={14} />
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive('blockquote')}
        title="Citação"
      >
        <Quote size={14} />
      </ToolBtn>

      <ToolDivider />

      {/* Links & Media */}
      <ToolBtn
        onClick={setLink}
        active={editor.isActive('link')}
        title="Inserir link"
      >
        <LinkIcon size={14} />
      </ToolBtn>
      <ToolBtn onClick={onImageInsert} title="Inserir imagem">
        <ImageIcon size={14} />
      </ToolBtn>
      <ToolBtn onClick={onVideoInsert} title="Inserir vídeo (YouTube/Vimeo)">
        <span className="text-[10px] font-bold font-sans">YT</span>
      </ToolBtn>
      <ToolBtn
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Linha divisória"
      >
        <Minus size={14} />
      </ToolBtn>
    </div>
  )
}

// ─── Bubble Menu (selection toolbar) ─────────────────────────────────────────

function SelectionToolbar({ editor }: { editor: any }) {
  if (!editor) return null
  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 150, placement: 'top' }}
      className="flex items-center gap-0.5 bg-ink-950 dark:bg-ink-800 border border-ink-800 dark:border-ink-700 rounded-xl shadow-2xl px-2 py-1.5"
    >
      <button
        onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bold') ? 'text-accent-400' : 'text-ink-200 hover:text-white'}`}
        title="Negrito"
      >
        <Bold size={13} />
      </button>
      <button
        onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('italic') ? 'text-accent-400' : 'text-ink-200 hover:text-white'}`}
        title="Itálico"
      >
        <Italic size={13} />
      </button>
      <button
        onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleUnderline().run() }}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('underline') ? 'text-accent-400' : 'text-ink-200 hover:text-white'}`}
        title="Sublinhado"
      >
        <UnderlineIcon size={13} />
      </button>
      <button
        onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleStrike().run() }}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('strike') ? 'text-accent-400' : 'text-ink-200 hover:text-white'}`}
        title="Tachado"
      >
        <Strikethrough size={13} />
      </button>
      <div className="w-px h-4 bg-ink-700 mx-0.5" />
      <button
        onMouseDown={e => {
          e.preventDefault()
          const url = window.prompt('URL:')
          if (url) editor.chain().focus().setLink({ href: url, target: '_blank' }).run()
        }}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('link') ? 'text-accent-400' : 'text-ink-200 hover:text-white'}`}
        title="Link"
      >
        <LinkIcon size={13} />
      </button>
      <div className="w-px h-4 bg-ink-700 mx-0.5" />
      <button
        onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run() }}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('heading', { level: 2 }) ? 'text-accent-400' : 'text-ink-200 hover:text-white'}`}
      >
        <Heading2 size={13} />
      </button>
      <button
        onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run() }}
        className={`p-1.5 rounded-lg transition-colors ${editor.isActive('blockquote') ? 'text-accent-400' : 'text-ink-200 hover:text-white'}`}
      >
        <Quote size={13} />
      </button>
    </BubbleMenu>
  )
}

// ─── Sidebar Section ──────────────────────────────────────────────────────────

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-5 border-b border-ink-100 dark:border-ink-800 last:border-0 last:pb-0">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400 dark:text-ink-500 mb-3">
        {title}
      </p>
      {children}
    </div>
  )
}

const INPUT_CLS = "w-full font-sans text-sm bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-xl px-3 py-2.5 text-ink-900 dark:text-ink-100 focus:outline-none focus:border-accent-400 dark:focus:border-accent-500 transition-colors placeholder-ink-300 dark:placeholder-ink-600"

// ─── Preview ─────────────────────────────────────────────────────────────────

function PreviewPane({ html, title, subtitle }: { html: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl mx-auto py-12 px-8">
      {title && <h1 className="font-display text-4xl font-bold text-ink-950 dark:text-ink-50 leading-tight mb-3">{title}</h1>}
      {subtitle && <p className="font-display text-xl italic text-ink-500 dark:text-ink-400 mb-10 leading-relaxed">{subtitle}</p>}
      {(title || subtitle) && <div className="w-12 h-0.5 bg-accent-400 mb-10" />}
      <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: html || '<p style="color:#aaa;font-style:italic">Nenhum conteúdo ainda.</p>' }} />
    </div>
  )
}

// ─── TipTap editor CSS (inject once) ─────────────────────────────────────────

const TIPTAP_CSS = `
.tiptap-editor .ProseMirror {
  outline: none;
  min-height: 40vh;
  font-family: 'Lora', Georgia, serif;
  font-size: 1.0625rem;
  line-height: 1.85;
  color: #3e3832;
  caret-color: #4f46e5;
}
.dark .tiptap-editor .ProseMirror { color: #d8d3c7; }

.tiptap-editor .ProseMirror p { margin-bottom: 1.2em; }
.tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #c8c2b6;
  pointer-events: none;
  height: 0;
  font-style: italic;
}
.dark .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before { color: #4a4540; }

.tiptap-editor .ProseMirror h2 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.65rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
  color: #1a1714;
  line-height: 1.2;
}
.dark .tiptap-editor .ProseMirror h2 { color: #edeae3; }

.tiptap-editor .ProseMirror h3 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.3rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  color: #2a2520;
  line-height: 1.3;
}
.dark .tiptap-editor .ProseMirror h3 { color: #d8d3c7; }

.tiptap-editor .ProseMirror blockquote {
  border-left: 3px solid #6366f1;
  padding-left: 1.25rem;
  font-style: italic;
  color: #6e6255;
  margin: 1.5rem 0;
}
.dark .tiptap-editor .ProseMirror blockquote { color: #8a8070; border-color: #818cf8; }

.tiptap-editor .ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1.2em; }
.tiptap-editor .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 1.2em; }
.tiptap-editor .ProseMirror li { margin-bottom: 0.3em; }

.tiptap-editor .ProseMirror a {
  color: #4f46e5;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.tiptap-editor .ProseMirror hr {
  border: none;
  border-top: 1px solid #e0dbd3;
  margin: 2rem 0;
}
.dark .tiptap-editor .ProseMirror hr { border-color: #3a3530; }

.tiptap-editor .ProseMirror img {
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
}

.tiptap-editor .ProseMirror strong { font-weight: 700; }
.tiptap-editor .ProseMirror em { font-style: italic; }
.tiptap-editor .ProseMirror u { text-decoration: underline; text-underline-offset: 2px; }
.tiptap-editor .ProseMirror s { text-decoration: line-through; }

/* Selection */
.tiptap-editor .ProseMirror ::selection { background: #e0e7ff; }
.dark .tiptap-editor .ProseMirror ::selection { background: #312e81; }
`

// ─── Main Editor ──────────────────────────────────────────────────────────────

export default function AdminPostEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id || id === 'novo'
  const fileRef = useRef<HTMLInputElement>(null)
  const styleInjected = useRef(false)

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [form, setForm] = useState({
    title: '', subtitle: '', slug: '', excerpt: '', cover_image: '',
    category_id: '', tags: '', published: false, featured: false, reading_time: 1,
  })

  // Inject TipTap CSS once
  useEffect(() => {
    if (styleInjected.current) return
    styleInjected.current = true
    const style = document.createElement('style')
    style.textContent = TIPTAP_CSS
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  const set = (key: keyof typeof form, value: any) => {
    setForm(f => {
      const next = { ...f, [key]: value }
      if (key === 'title' && isNew) next.slug = slugify(value as string)
      return next
    })
  }

  // ── TipTap editor ──
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Placeholder.configure({
        placeholder: 'Comece a escrever… selecione o texto para formatar, use a barra acima para inserir elementos.',
      }),
      CharacterCount,
    ],
    content: '',
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      setForm(f => ({ ...f, reading_time: estimateReadingTime(text) }))
    },
  })

  // Load post data
  useEffect(() => {
    categoriesService.getAll().then(setCategories).catch(() => {})
    if (!isNew && editor) {
      postsService.getById(id!).then(post => {
        setForm({
          title: post.title || '', subtitle: post.subtitle || '', slug: post.slug || '',
          excerpt: post.excerpt || '', cover_image: post.cover_image || '',
          category_id: post.category_id || '', tags: post.tags?.join(', ') || '',
          published: post.published || false, featured: post.featured || false,
          reading_time: post.reading_time || 1,
        })
        editor.commands.setContent(post.content || '')
      }).catch(() => navigate('/admin/artigos')).finally(() => setLoading(false))
    }
  }, [id, editor])

  // Insert image
  const handleInsertImage = () => {
    const url = window.prompt('URL da imagem:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }

  // Insert video embed
  const handleInsertVideo = () => {
    const url = window.prompt('URL do YouTube ou Vimeo:')
    if (!url || !editor) return
    const embedUrl = getEmbedUrl(url)
    if (!embedUrl) { alert('URL de vídeo inválida. Use YouTube ou Vimeo.'); return }
    const html = buildEmbedHtml(url, 'Vídeo')
    editor.chain().focus().insertContent(html).run()
  }

  // Upload cover
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { const url = await postsService.uploadCover(file); set('cover_image', url) }
    catch { /* ignore */ }
    finally { setUploading(false) }
  }

  const handleSave = async (publish?: boolean) => {
    if (!form.title.trim() || !editor) return
    setSaveStatus('saving'); setSaving(true)
    try {
      const data = {
        ...form,
        content: editor.getHTML(),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        published: publish !== undefined ? publish : form.published,
      }
      if (isNew) {
        const created = await postsService.create(data)
        navigate(`/admin/artigos/${created.id}`)
      } else {
        await postsService.update(id!, data)
      }
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setSaving(false)
    }
  }

  const wordCount = editor?.storage.characterCount.words() ?? 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-5 h-5 border-2 border-ink-200 border-t-accent-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="h-screen flex flex-col -m-8 bg-ink-50 dark:bg-ink-950">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-5 h-14 bg-white dark:bg-ink-900 border-b border-ink-100 dark:border-ink-800 flex-shrink-0 z-30">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/artigos')}
            className="p-1.5 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="h-4 w-px bg-ink-200 dark:bg-ink-700" />
          <span className="font-sans text-sm text-ink-400 dark:text-ink-500 max-w-xs truncate">
            {form.title || 'Sem título'}
          </span>
          {form.published
            ? <span className="flex items-center gap-1 font-sans text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full"><Globe size={9} /> Publicado</span>
            : !isNew && <span className="flex items-center gap-1 font-sans text-[10px] text-ink-400 bg-ink-100 dark:bg-ink-800 px-2 py-0.5 rounded-full"><EyeOff size={9} /> Rascunho</span>
          }
        </div>

        {/* Center stats */}
        <div className="hidden md:flex items-center gap-4 text-xs font-sans text-ink-400 dark:text-ink-600">
          <span>{wordCount} palavras</span>
          <span>·</span>
          <span>{form.reading_time} min de leitura</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 font-sans text-xs text-green-600 dark:text-green-400">
              <Check size={12} /> Salvo
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1.5 font-sans text-xs text-red-500">
              <X size={12} /> Erro ao salvar
            </span>
          )}

          <button
            onClick={() => setPreview(v => !v)}
            className={`flex items-center gap-1.5 font-sans text-xs px-3 py-1.5 rounded-lg border transition-all ${
              preview
                ? 'border-accent-400 text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20'
                : 'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-ink-300'
            }`}
          >
            <Eye size={13} />
            {preview ? 'Editar' : 'Preview'}
          </button>

          <button
            onClick={() => setSidebarOpen(v => !v)}
            className={`p-1.5 rounded-lg border transition-all ${
              sidebarOpen
                ? 'border-accent-400 text-accent-600 bg-accent-50 dark:bg-accent-900/20 dark:text-accent-400'
                : 'border-ink-200 dark:border-ink-700 text-ink-400'
            }`}
            title="Configurações do artigo"
          >
            <Sparkles size={14} />
          </button>

          <div className="h-4 w-px bg-ink-200 dark:bg-ink-700" />

          <button
            onClick={() => handleSave(false)}
            disabled={saving || !form.title.trim()}
            className="flex items-center gap-1.5 font-sans text-xs px-3 py-1.5 rounded-lg border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-ink-400 transition-colors disabled:opacity-40"
          >
            {saveStatus === 'saving' ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}
            Rascunho
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving || !form.title.trim()}
            className="flex items-center gap-1.5 font-sans text-xs px-4 py-1.5 rounded-lg bg-accent-600 hover:bg-accent-700 text-white transition-colors disabled:opacity-40 font-medium"
          >
            {saving && saveStatus === 'saving' ? <Loader size={12} className="animate-spin" /> : <Globe size={12} />}
            Publicar
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Editor / Preview ── */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {preview ? (
            <div className="bg-white dark:bg-ink-900 flex-1">
              <PreviewPane html={editor?.getHTML() ?? ''} title={form.title} subtitle={form.subtitle} />
            </div>
          ) : (
            <div className="flex-1 bg-white dark:bg-ink-900 flex flex-col">

              {/* Formatting Toolbar */}
              <MainToolbar
                editor={editor}
                onImageInsert={handleInsertImage}
                onVideoInsert={handleInsertVideo}
              />

              {/* Bubble menu on selection */}
              {editor && <SelectionToolbar editor={editor} />}

              {/* Writing area */}
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto py-10 px-8">

                  {/* Cover preview */}
                  {form.cover_image && (
                    <div className="mb-8 -mx-8 overflow-hidden relative group">
                      <img src={form.cover_image} alt="Capa" className="w-full h-52 object-cover" />
                      <button
                        onClick={() => set('cover_image', '')}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}

                  {/* Title */}
                  <textarea
                    value={form.title}
                    onChange={e => {
                      set('title', e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = e.target.scrollHeight + 'px'
                    }}
                    placeholder="Título do artigo"
                    rows={1}
                    className="w-full font-display text-4xl font-bold text-ink-950 dark:text-ink-50 bg-transparent placeholder-ink-200 dark:placeholder-ink-700 outline-none resize-none overflow-hidden leading-tight mb-2 caret-accent-500"
                    style={{ wordBreak: 'break-word' }}
                  />

                  {/* Subtitle */}
                  <textarea
                    value={form.subtitle}
                    onChange={e => {
                      set('subtitle', e.target.value)
                      e.target.style.height = 'auto'
                      e.target.style.height = e.target.scrollHeight + 'px'
                    }}
                    placeholder="Subtítulo ou olho do texto (opcional)"
                    rows={1}
                    className="w-full font-display text-xl italic text-ink-400 dark:text-ink-500 bg-transparent placeholder-ink-200 dark:placeholder-ink-700 outline-none resize-none overflow-hidden leading-relaxed mb-8 caret-accent-500"
                    style={{ wordBreak: 'break-word' }}
                  />

                  {/* Decorative divider */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-0.5 bg-accent-400" />
                    <div className="w-2 h-0.5 bg-ink-200 dark:bg-ink-700" />
                  </div>

                  {/* TipTap content area */}
                  <div className="tiptap-editor">
                    <EditorContent editor={editor} />
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <aside className="w-72 bg-white dark:bg-ink-900 border-l border-ink-100 dark:border-ink-800 overflow-y-auto flex-shrink-0">
            <div className="p-5 space-y-5">

              <SidebarSection title="Publicação">
                <div className="space-y-1">
                  {[
                    { key: 'published', label: 'Publicado', icon: Globe },
                    { key: 'featured', label: 'Destaque', icon: Sparkles },
                  ].map(({ key, label, icon: Icon }) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors">
                      <div className="flex items-center gap-2">
                        <Icon size={13} className="text-ink-400" />
                        <span className="font-sans text-sm text-ink-700 dark:text-ink-300">{label}</span>
                      </div>
                      <div
                        onClick={() => set(key as any, !form[key as 'published' | 'featured'])}
                        className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative flex-shrink-0 ${form[key as 'published' | 'featured'] ? 'bg-accent-500' : 'bg-ink-200 dark:bg-ink-700'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${form[key as 'published' | 'featured'] ? 'left-4' : 'left-0.5'}`} />
                      </div>
                    </label>
                  ))}
                </div>
              </SidebarSection>

              <SidebarSection title="Imagem de capa">
                {form.cover_image ? (
                  <div className="relative mb-2 rounded-xl overflow-hidden group">
                    <img src={form.cover_image} alt="" className="w-full h-28 object-cover" />
                    <button
                      onClick={() => set('cover_image', '')}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/50 hover:bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-20 border-2 border-dashed border-ink-200 dark:border-ink-700 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/10 transition-all mb-2"
                  >
                    {uploading
                      ? <Loader size={16} className="text-ink-400 animate-spin" />
                      : <>
                          <Upload size={16} className="text-ink-400" />
                          <span className="font-sans text-xs text-ink-400">Clique para fazer upload</span>
                        </>
                    }
                  </div>
                )}
                <input
                  type="text"
                  value={form.cover_image}
                  onChange={e => set('cover_image', e.target.value)}
                  placeholder="Ou cole uma URL…"
                  className={INPUT_CLS}
                />
                <input ref={fileRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
              </SidebarSection>

              <SidebarSection title="Categoria">
                <select
                  value={form.category_id}
                  onChange={e => set('category_id', e.target.value)}
                  className={INPUT_CLS + ' cursor-pointer'}
                >
                  <option value="">Sem categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </SidebarSection>

              <SidebarSection title="URL do artigo">
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => set('slug', e.target.value)}
                  placeholder="slug-do-artigo"
                  className={INPUT_CLS}
                />
                <p className="font-sans text-[11px] text-ink-400 mt-1.5 pl-1">
                  /artigos/<span className="text-accent-500">{form.slug || 'slug'}</span>
                </p>
              </SidebarSection>

              <SidebarSection title="Resumo (excerpt)">
                <textarea
                  value={form.excerpt}
                  onChange={e => set('excerpt', e.target.value)}
                  placeholder="Breve descrição exibida nos cards…"
                  rows={3}
                  className={INPUT_CLS + ' resize-none'}
                />
              </SidebarSection>

              <SidebarSection title="Tags">
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => set('tags', e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className={INPUT_CLS}
                />
                {form.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="font-sans text-[11px] bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 border border-accent-200 dark:border-accent-800 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </SidebarSection>

            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
