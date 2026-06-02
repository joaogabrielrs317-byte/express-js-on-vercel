import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Save, Eye, Upload, Loader, ArrowLeft, Plus,
  Type, Heading2, Heading3,
  Quote, List, ListOrdered, Video, Image as ImageIcon,
  Trash2, ChevronDown, X, Check, Globe, EyeOff,
  Sparkles, Hash, AlignLeft
} from 'lucide-react'
import { postsService, categoriesService } from '../services'
import { slugify, estimateReadingTime } from '../utils'
import { buildEmbedHtml } from '../utils/embed'
import type { Category } from '../types'

// ─── Types ────────────────────────────────────────────────────────────────────

type BlockType =
  | 'paragraph' | 'h2' | 'h3'
  | 'blockquote' | 'ul' | 'ol'
  | 'video' | 'image' | 'divider'

interface Block {
  id: string
  type: BlockType
  content: string
  caption?: string
}

function uid() { return Math.random().toString(36).slice(2, 10) }

function blocksToHtml(blocks: Block[]): string {
  return blocks.map(b => {
    switch (b.type) {
      case 'paragraph':   return `<p>${b.content}</p>`
      case 'h2':          return `<h2>${b.content}</h2>`
      case 'h3':          return `<h3>${b.content}</h3>`
      case 'blockquote':  return `<blockquote>${b.content}</blockquote>`
      case 'ul':          return `<ul>${b.content.split('\n').filter(Boolean).map(l => `<li>${l}</li>`).join('')}</ul>`
      case 'ol':          return `<ol>${b.content.split('\n').filter(Boolean).map(l => `<li>${l}</li>`).join('')}</ol>`
      case 'video':       return buildEmbedHtml(b.content, b.caption)
      case 'image':       return `<figure><img src="${b.content}" alt="${b.caption || ''}" style="width:100%;border-radius:4px;" />${b.caption ? `<figcaption style="text-align:center;font-size:0.85rem;color:#888;margin-top:0.5rem;">${b.caption}</figcaption>` : ''}</figure>`
      case 'divider':     return `<hr />`
      default:            return ''
    }
  }).join('\n')
}

function htmlToBlocks(html: string): Block[] {
  if (!html.trim()) return [{ id: uid(), type: 'paragraph', content: '' }]
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const blocks: Block[] = []
  doc.body.childNodes.forEach(node => {
    if (node.nodeType !== Node.ELEMENT_NODE) return
    const el = node as HTMLElement
    const tag = el.tagName.toLowerCase()
    if (tag === 'p') blocks.push({ id: uid(), type: 'paragraph', content: el.innerHTML })
    else if (tag === 'h2') blocks.push({ id: uid(), type: 'h2', content: el.textContent || '' })
    else if (tag === 'h3') blocks.push({ id: uid(), type: 'h3', content: el.textContent || '' })
    else if (tag === 'blockquote') blocks.push({ id: uid(), type: 'blockquote', content: el.textContent || '' })
    else if (tag === 'ul') blocks.push({ id: uid(), type: 'ul', content: Array.from(el.querySelectorAll('li')).map(li => li.textContent).join('\n') })
    else if (tag === 'ol') blocks.push({ id: uid(), type: 'ol', content: Array.from(el.querySelectorAll('li')).map(li => li.textContent).join('\n') })
    else if (tag === 'hr') blocks.push({ id: uid(), type: 'divider', content: '' })
    else if (tag === 'figure') {
      const img = el.querySelector('img')
      const cap = el.querySelector('figcaption')
      if (img) blocks.push({ id: uid(), type: 'image', content: img.src, caption: cap?.textContent || '' })
    }
  })
  return blocks.length > 0 ? blocks : [{ id: uid(), type: 'paragraph', content: '' }]
}

// ─── Block config ─────────────────────────────────────────────────────────────

const BLOCK_TYPES = [
  { type: 'paragraph' as BlockType,  label: 'Parágrafo',  icon: AlignLeft,     shortcut: 'P' },
  { type: 'h2' as BlockType,         label: 'Título',     icon: Heading2,      shortcut: 'H2' },
  { type: 'h3' as BlockType,         label: 'Subtítulo',  icon: Heading3,      shortcut: 'H3' },
  { type: 'blockquote' as BlockType, label: 'Citação',    icon: Quote,         shortcut: 'Q' },
  { type: 'ul' as BlockType,         label: 'Lista •',    icon: List,          shortcut: 'UL' },
  { type: 'ol' as BlockType,         label: 'Lista 1.',   icon: ListOrdered,   shortcut: 'OL' },
  { type: 'image' as BlockType,      label: 'Imagem',     icon: ImageIcon,     shortcut: 'IMG' },
  { type: 'video' as BlockType,      label: 'Vídeo',      icon: Video,         shortcut: 'VID' },
  { type: 'divider' as BlockType,    label: 'Divisor',    icon: Hash,          shortcut: '—' },
]

const PLACEHOLDERS: Partial<Record<BlockType, string>> = {
  paragraph:  'Escreva aqui… (Enter para novo bloco, / para mudar tipo)',
  h2:         'Título da seção',
  h3:         'Subtítulo',
  blockquote: 'Citação ou destaque…',
  ul:         'Item 1\nItem 2\nItem 3',
  ol:         'Passo 1\nPasso 2\nPasso 3',
  image:      'Cole a URL da imagem…',
  video:      'Cole a URL do YouTube ou Vimeo…',
}

// ─── Slash Command Menu ───────────────────────────────────────────────────────

function SlashMenu({ onSelect, onClose }: {
  onSelect: (type: BlockType) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const filtered = BLOCK_TYPES.filter(b =>
    b.label.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full mt-2 z-50 w-56 bg-white dark:bg-ink-900 border border-ink-150 dark:border-ink-700 shadow-2xl rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
    >
      <div className="px-3 py-2 border-b border-ink-100 dark:border-ink-800">
        <input
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Filtrar blocos…"
          className="w-full text-xs font-sans bg-transparent text-ink-700 dark:text-ink-300 placeholder-ink-300 outline-none"
        />
      </div>
      <div className="py-1 max-h-64 overflow-y-auto">
        {filtered.map(({ type, label, icon: Icon, shortcut }) => (
          <button
            key={type}
            onMouseDown={e => { e.preventDefault(); onSelect(type); onClose() }}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors group text-left"
          >
            <span className="w-7 h-7 rounded-lg bg-ink-50 dark:bg-ink-800 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-100 dark:group-hover:bg-accent-900/40 transition-colors">
              <Icon size={13} className="text-ink-500 dark:text-ink-400 group-hover:text-accent-600 dark:group-hover:text-accent-400" />
            </span>
            <span className="flex-1 font-sans text-sm text-ink-700 dark:text-ink-300">{label}</span>
            <span className="font-mono text-[10px] text-ink-300 dark:text-ink-600">{shortcut}</span>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-center py-4 text-xs text-ink-400 font-sans">Nenhum resultado</p>
        )}
      </div>
    </div>
  )
}

// ─── Single Block ─────────────────────────────────────────────────────────────

function BlockEditor({
  block, isFirst, isLast,
  onChange, onDelete, onTypeChange,
  onAddAfter, onMoveUp, onMoveDown,
}: {
  block: Block
  isFirst: boolean
  isLast: boolean
  onChange: (content: string, caption?: string) => void
  onDelete: () => void
  onTypeChange: (type: BlockType) => void
  onAddAfter: (type?: BlockType) => void
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const [showSlash, setShowSlash] = useState(false)
  const [hovered, setHovered] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const el = textareaRef.current
    if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px' }
  }, [])

  useEffect(() => { resize() }, [block.content, resize])

  // ── Divider ──
  if (block.type === 'divider') {
    return (
      <div
        className="relative flex items-center gap-3 py-3 group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex-1 flex items-center gap-3">
          <div className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
          <span className="text-ink-300 dark:text-ink-600 text-xs font-sans">✦</span>
          <div className="flex-1 h-px bg-ink-200 dark:bg-ink-700" />
        </div>
        <button
          onMouseDown={e => { e.preventDefault(); onDelete() }}
          className={`transition-all p-1 text-ink-300 hover:text-red-500 rounded-lg ${hovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <Trash2 size={12} />
        </button>
      </div>
    )
  }

  // ── Image / Video ──
  if (block.type === 'image' || block.type === 'video') {
    return (
      <div
        className="relative group rounded-2xl overflow-hidden border border-ink-100 dark:border-ink-800 bg-ink-50 dark:bg-ink-900"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {block.content && block.type === 'image' && (
          <div className="relative">
            <img src={block.content} alt={block.caption} className="w-full max-h-80 object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        )}
        {block.content && block.type === 'video' && (
          <div className="aspect-video bg-ink-950 flex items-center justify-center gap-3">
            <Video size={24} className="text-ink-600" />
            <span className="font-sans text-sm text-ink-400 truncate max-w-xs">{block.content}</span>
          </div>
        )}
        <div className="p-4 space-y-2">
          <input
            value={block.content}
            onChange={e => onChange(e.target.value, block.caption)}
            placeholder={PLACEHOLDERS[block.type]}
            className="w-full font-sans text-sm bg-white dark:bg-ink-800 border border-ink-150 dark:border-ink-700 rounded-xl px-3 py-2.5 text-ink-900 dark:text-ink-100 focus:outline-none focus:border-accent-400 transition-colors"
          />
          <input
            value={block.caption || ''}
            onChange={e => onChange(block.content, e.target.value)}
            placeholder="Legenda (opcional)"
            className="w-full font-sans text-xs bg-transparent border border-ink-100 dark:border-ink-800 rounded-xl px-3 py-2 text-ink-500 focus:outline-none focus:border-accent-400 transition-colors"
          />
        </div>
        <button
          onMouseDown={e => { e.preventDefault(); onDelete() }}
          className={`absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-ink-900/90 text-ink-500 hover:text-red-500 rounded-lg shadow-sm transition-all ${hovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    )
  }

  // ── Text blocks ──
  const textStyles: Partial<Record<BlockType, string>> = {
    paragraph:  'text-[1.0625rem] leading-[1.85] text-ink-800 dark:text-ink-200 font-body',
    h2:         'text-2xl font-bold font-display text-ink-950 dark:text-ink-50 leading-tight',
    h3:         'text-xl font-semibold font-display text-ink-900 dark:text-ink-100 leading-snug',
    blockquote: 'text-lg italic text-ink-600 dark:text-ink-400 font-body leading-relaxed',
    ul:         'text-[1.0625rem] leading-[1.85] text-ink-800 dark:text-ink-200 font-body',
    ol:         'text-[1.0625rem] leading-[1.85] text-ink-800 dark:text-ink-200 font-body',
  }

  const conf = BLOCK_TYPES.find(t => t.type === block.type)
  const Icon = conf?.icon || Type

  return (
    <div
      className="relative flex items-start gap-2"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Left actions */}
      <div className={`flex flex-col items-center gap-0.5 pt-1.5 flex-shrink-0 transition-all duration-150 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onMouseDown={e => { e.preventDefault(); onMoveUp() }}
          disabled={isFirst}
          className="p-1 text-ink-300 hover:text-ink-600 dark:hover:text-ink-300 disabled:opacity-20 rounded-lg transition-colors"
        >
          <ChevronDown size={12} className="rotate-180" />
        </button>
        <div className="relative">
          <button
            onMouseDown={e => { e.preventDefault() }}
            onClick={() => setShowSlash(v => !v)}
            className="p-1 text-ink-300 hover:text-accent-500 rounded-lg transition-colors"
            title="Mudar tipo de bloco"
          >
            <Icon size={12} />
          </button>
          {showSlash && (
            <SlashMenu
              onSelect={type => { onTypeChange(type); setShowSlash(false) }}
              onClose={() => setShowSlash(false)}
            />
          )}
        </div>
        <button
          onMouseDown={e => { e.preventDefault(); onMoveDown() }}
          disabled={isLast}
          className="p-1 text-ink-300 hover:text-ink-600 dark:hover:text-ink-300 disabled:opacity-20 rounded-lg transition-colors"
        >
          <ChevronDown size={12} />
        </button>
      </div>

      {/* Block content */}
      <div className={`flex-1 min-w-0 ${block.type === 'blockquote' ? 'border-l-[3px] border-accent-400 pl-5' : ''}`}>
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={e => { onChange(e.target.value); resize() }}
          onKeyDown={e => {
            if (e.key === '/' && block.content === '') {
              e.preventDefault()
              setShowSlash(true)
            }
            if (e.key === 'Enter' && !e.shiftKey && block.type !== 'ul' && block.type !== 'ol') {
              e.preventDefault()
              onAddAfter('paragraph')
            }
            if (e.key === 'Backspace' && block.content === '') {
              e.preventDefault()
              onDelete()
            }
          }}
          placeholder={PLACEHOLDERS[block.type]}
          rows={1}
          className={`
            w-full bg-transparent outline-none resize-none overflow-hidden
            placeholder-ink-200 dark:placeholder-ink-700 caret-accent-500
            ${textStyles[block.type] || ''}
          `}
          style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
        />
      </div>

      {/* Delete */}
      <button
        onMouseDown={e => { e.preventDefault(); onDelete() }}
        className={`flex-shrink-0 mt-1.5 p-1.5 text-ink-200 hover:text-red-500 dark:text-ink-700 dark:hover:text-red-400 rounded-lg transition-all duration-150 ${hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <Trash2 size={12} />
      </button>
    </div>
  )
}

// ─── Add Block Row ─────────────────────────────────────────────────────────────

function AddBlockRow({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative flex items-center gap-2 py-0.5 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`flex-1 h-px bg-ink-100 dark:bg-ink-800 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`} />
      <button
        onMouseDown={e => { e.preventDefault(); setOpen(v => !v) }}
        className={`flex items-center gap-1.5 font-sans text-xs text-ink-400 hover:text-accent-600 dark:hover:text-accent-400 transition-all px-3 py-1.5 rounded-full border border-dashed border-ink-200 dark:border-ink-700 hover:border-accent-300 dark:hover:border-accent-700 hover:bg-accent-50 dark:hover:bg-accent-900/10 ${hovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <Plus size={11} /> Adicionar bloco
      </button>
      <div className={`flex-1 h-px bg-ink-100 dark:bg-ink-800 transition-opacity ${hovered ? 'opacity-100' : 'opacity-0'}`} />
      {open && (
        <SlashMenu
          onSelect={type => { onAdd(type); setOpen(false) }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

// ─── Sidebar Panel ─────────────────────────────────────────────────────────────

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

const INPUT_CLS = "w-full font-sans text-sm bg-ink-50 dark:bg-ink-800 border border-ink-150 dark:border-ink-700 rounded-xl px-3 py-2.5 text-ink-900 dark:text-ink-100 focus:outline-none focus:border-accent-400 dark:focus:border-accent-500 transition-colors placeholder-ink-300 dark:placeholder-ink-600"

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

// ─── Main Editor ──────────────────────────────────────────────────────────────

export default function AdminPostEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = !id || id === 'novo'
  const fileRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [blocks, setBlocks] = useState<Block[]>([
    { id: uid(), type: 'paragraph', content: '' }
  ])

  const [form, setForm] = useState({
    title: '', subtitle: '', slug: '', excerpt: '', cover_image: '',
    category_id: '', tags: '', published: false, featured: false, reading_time: 1,
  })

  const set = (key: keyof typeof form, value: any) => {
    setForm(f => {
      const next = { ...f, [key]: value }
      if (key === 'title' && isNew) next.slug = slugify(value as string)
      return next
    })
  }

  const html = blocksToHtml(blocks)

  useEffect(() => {
    const text = blocks.map(b => b.content).join(' ')
    setForm(f => ({ ...f, reading_time: estimateReadingTime(text) }))
  }, [blocks])

  useEffect(() => {
    categoriesService.getAll().then(setCategories).catch(() => {})
    if (!isNew) {
      postsService.getById(id!).then(post => {
        setForm({
          title: post.title || '', subtitle: post.subtitle || '', slug: post.slug || '',
          excerpt: post.excerpt || '', cover_image: post.cover_image || '',
          category_id: post.category_id || '', tags: post.tags?.join(', ') || '',
          published: post.published || false, featured: post.featured || false,
          reading_time: post.reading_time || 1,
        })
        setBlocks(htmlToBlocks(post.content || ''))
      }).catch(() => navigate('/admin/artigos')).finally(() => setLoading(false))
    }
  }, [id])

  const updateBlock = useCallback((bid: string, content: string, caption?: string) => {
    setBlocks(bs => bs.map(b => b.id === bid ? { ...b, content, caption } : b))
  }, [])

  const deleteBlock = useCallback((bid: string) => {
    setBlocks(bs => {
      if (bs.length === 1) return [{ id: uid(), type: 'paragraph', content: '' }]
      return bs.filter(b => b.id !== bid)
    })
  }, [])

  const changeBlockType = useCallback((bid: string, type: BlockType) => {
    setBlocks(bs => bs.map(b => b.id === bid ? { ...b, type } : b))
  }, [])

  const addBlockAfter = useCallback((bid: string, type: BlockType = 'paragraph') => {
    const nb: Block = { id: uid(), type, content: '' }
    setBlocks(bs => {
      const idx = bs.findIndex(b => b.id === bid)
      if (idx === -1) return [...bs, nb]
      const next = [...bs]; next.splice(idx + 1, 0, nb); return next
    })
  }, [])

  const addBlockAtEnd = useCallback((type: BlockType = 'paragraph') => {
    setBlocks(bs => [...bs, { id: uid(), type, content: '' }])
  }, [])

  const moveBlock = useCallback((bid: string, dir: 'up' | 'down') => {
    setBlocks(bs => {
      const idx = bs.findIndex(b => b.id === bid)
      if (idx === -1) return bs
      const next = [...bs]; const target = dir === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= next.length) return bs
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }, [])

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try { const url = await postsService.uploadCover(file); set('cover_image', url) }
    catch { /* silently fail */ }
    finally { setUploading(false) }
  }

  const handleSave = async (publish?: boolean) => {
    if (!form.title.trim()) return
    setSaveStatus('saving'); setSaving(true)
    try {
      const data = {
        ...form,
        content: html,
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

  // Word count
  const wordCount = blocks.map(b => b.content).join(' ').trim().split(/\s+/).filter(Boolean).length

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
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm text-ink-400 dark:text-ink-500">
              {form.title || 'Sem título'}
            </span>
            {form.published && (
              <span className="flex items-center gap-1 font-sans text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                <Globe size={9} /> Publicado
              </span>
            )}
            {!form.published && !isNew && (
              <span className="flex items-center gap-1 font-sans text-[10px] text-ink-400 bg-ink-100 dark:bg-ink-800 px-2 py-0.5 rounded-full">
                <EyeOff size={9} /> Rascunho
              </span>
            )}
          </div>
        </div>

        {/* Center stats */}
        <div className="hidden md:flex items-center gap-4 text-xs font-sans text-ink-400 dark:text-ink-600">
          <span>{wordCount} palavras</span>
          <span>·</span>
          <span>{form.reading_time} min de leitura</span>
          <span>·</span>
          <span>{blocks.length} blocos</span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Save status */}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 font-sans text-xs text-green-600 dark:text-green-400">
              <Check size={12} /> Salvo
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1.5 font-sans text-xs text-red-500">
              <X size={12} /> Erro
            </span>
          )}

          {/* Preview toggle */}
          <button
            onClick={() => setPreview(v => !v)}
            className={`flex items-center gap-1.5 font-sans text-xs px-3 py-1.5 rounded-lg border transition-all ${
              preview
                ? 'border-accent-400 text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20'
                : 'border-ink-200 dark:border-ink-700 text-ink-500 dark:text-ink-400 hover:border-ink-300'
            }`}
          >
            <Eye size={13} />
            {preview ? 'Editar' : 'Preview'}
          </button>

          {/* Sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className={`p-1.5 rounded-lg border transition-all ${
              sidebarOpen
                ? 'border-accent-400 text-accent-600 bg-accent-50 dark:bg-accent-900/20 dark:text-accent-400'
                : 'border-ink-200 dark:border-ink-700 text-ink-400'
            }`}
            title="Configurações"
          >
            <Sparkles size={14} />
          </button>

          <div className="h-4 w-px bg-ink-200 dark:bg-ink-700" />

          {/* Save draft */}
          <button
            onClick={() => handleSave(false)}
            disabled={saving || !form.title.trim()}
            className="flex items-center gap-1.5 font-sans text-xs px-3 py-1.5 rounded-lg border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-ink-400 transition-colors disabled:opacity-40"
          >
            {saveStatus === 'saving' ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}
            Rascunho
          </button>

          {/* Publish */}
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
        <div className="flex-1 overflow-y-auto">
          {preview ? (
            <div className="bg-white dark:bg-ink-900 min-h-full">
              <PreviewPane html={html} title={form.title} subtitle={form.subtitle} />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto py-12 px-8">

              {/* Cover image preview strip */}
              {form.cover_image && (
                <div className="mb-8 -mx-8 overflow-hidden">
                  <img src={form.cover_image} alt="Capa" className="w-full h-52 object-cover" />
                </div>
              )}

              {/* Title */}
              <div className="mb-1">
                <textarea
                  value={form.title}
                  onChange={e => { set('title', e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
                  placeholder="Título do artigo"
                  rows={1}
                  className="w-full font-display text-4xl font-bold text-ink-950 dark:text-ink-50 bg-transparent placeholder-ink-200 dark:placeholder-ink-700 outline-none resize-none overflow-hidden leading-tight"
                  style={{ wordBreak: 'break-word' }}
                />
              </div>

              {/* Subtitle */}
              <div className="mb-8">
                <textarea
                  value={form.subtitle}
                  onChange={e => { set('subtitle', e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px' }}
                  placeholder="Subtítulo ou olho do texto (opcional)"
                  rows={1}
                  className="w-full font-display text-xl italic text-ink-400 dark:text-ink-500 bg-transparent placeholder-ink-200 dark:placeholder-ink-700 outline-none resize-none overflow-hidden leading-relaxed"
                  style={{ wordBreak: 'break-word' }}
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-0.5 bg-accent-400" />
                <div className="w-2 h-0.5 bg-ink-200 dark:bg-ink-700" />
              </div>

              {/* Blocks */}
              <div className="space-y-1.5 min-h-[30vh]">
                {blocks.map((block, idx) => (
                  <div key={block.id}>
                    <BlockEditor
                      block={block}
                      isFirst={idx === 0}
                      isLast={idx === blocks.length - 1}
                      onChange={(c, cap) => updateBlock(block.id, c, cap)}
                      onDelete={() => deleteBlock(block.id)}
                      onTypeChange={t => changeBlockType(block.id, t)}
                      onAddAfter={t => addBlockAfter(block.id, t)}
                      onMoveUp={() => moveBlock(block.id, 'up')}
                      onMoveDown={() => moveBlock(block.id, 'down')}
                    />
                    <AddBlockRow onAdd={addBlockAtEnd} />
                  </div>
                ))}
              </div>

              {/* Bottom hint */}
              <div className="mt-8 pt-6 border-t border-ink-100 dark:border-ink-800">
                <p className="font-sans text-xs text-ink-300 dark:text-ink-700">
                  Digite <kbd className="bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 rounded text-ink-400 font-mono">/</kbd> numa linha vazia para mudar o tipo de bloco.
                  <kbd className="bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 rounded text-ink-400 font-mono ml-2">Enter</kbd> para novo parágrafo.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <aside className="w-72 bg-white dark:bg-ink-900 border-l border-ink-100 dark:border-ink-800 overflow-y-auto flex-shrink-0">
            <div className="p-5 space-y-5">

              <SidebarSection title="Publicação">
                <div className="space-y-2">
                  {/* Published toggle */}
                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors">
                    <div className="flex items-center gap-2">
                      <Globe size={13} className="text-ink-400" />
                      <span className="font-sans text-sm text-ink-700 dark:text-ink-300">Publicado</span>
                    </div>
                    <div
                      onClick={() => set('published', !form.published)}
                      className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${form.published ? 'bg-accent-500' : 'bg-ink-200 dark:bg-ink-700'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${form.published ? 'left-4' : 'left-0.5'}`} />
                    </div>
                  </label>

                  {/* Featured toggle */}
                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors">
                    <div className="flex items-center gap-2">
                      <Sparkles size={13} className="text-ink-400" />
                      <span className="font-sans text-sm text-ink-700 dark:text-ink-300">Destaque</span>
                    </div>
                    <div
                      onClick={() => set('featured', !form.featured)}
                      className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative ${form.featured ? 'bg-accent-500' : 'bg-ink-200 dark:bg-ink-700'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${form.featured ? 'left-4' : 'left-0.5'}`} />
                    </div>
                  </label>
                </div>
              </SidebarSection>

              <SidebarSection title="Imagem de capa">
                {form.cover_image ? (
                  <div className="relative mb-2 rounded-xl overflow-hidden">
                    <img src={form.cover_image} alt="" className="w-full h-28 object-cover" />
                    <button
                      onClick={() => set('cover_image', '')}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-20 border-2 border-dashed border-ink-200 dark:border-ink-700 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/10 transition-all mb-2"
                  >
                    {uploading ? (
                      <Loader size={16} className="text-ink-400 animate-spin" />
                    ) : (
                      <>
                        <Upload size={16} className="text-ink-400" />
                        <span className="font-sans text-xs text-ink-400">Clique para fazer upload</span>
                      </>
                    )}
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
                  placeholder="Breve descrição exibida nos cards e no SEO…"
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
