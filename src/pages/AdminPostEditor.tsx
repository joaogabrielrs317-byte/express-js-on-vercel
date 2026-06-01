import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Save, Eye, Upload, Loader, ArrowLeft, Plus, X,
  Type, Heading1, Heading2, Heading3,
  Quote, List, ListOrdered, Video, Image as ImageIcon,
  GripVertical, Trash2, ChevronDown, Link as LinkIcon,
  Bold, Italic, Underline
} from 'lucide-react'
import { postsService, categoriesService } from '../services'
import { slugify, estimateReadingTime } from '../utils'
import { buildEmbedHtml } from '../utils/embed'
import type { Category } from '../types'

// ─── Types ────────────────────────────────────────────────────────────────────

type BlockType =
  | 'paragraph'
  | 'h1' | 'h2' | 'h3'
  | 'blockquote'
  | 'ul' | 'ol'
  | 'video'
  | 'image'
  | 'divider'

interface Block {
  id: string
  type: BlockType
  content: string   // HTML string for text blocks, URL for media, '' for divider
  caption?: string  // for image/video
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function blocksToHtml(blocks: Block[]): string {
  return blocks.map(b => {
    switch (b.type) {
      case 'paragraph':   return `<p>${b.content}</p>`
      case 'h1':          return `<h1>${b.content}</h1>`
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
    else if (tag === 'h1') blocks.push({ id: uid(), type: 'h1', content: el.textContent || '' })
    else if (tag === 'h2') blocks.push({ id: uid(), type: 'h2', content: el.textContent || '' })
    else if (tag === 'h3') blocks.push({ id: uid(), type: 'h3', content: el.textContent || '' })
    else if (tag === 'blockquote') blocks.push({ id: uid(), type: 'blockquote', content: el.textContent || '' })
    else if (tag === 'ul') blocks.push({ id: uid(), type: 'ul', content: Array.from(el.querySelectorAll('li')).map(li => li.textContent).join('\n') })
    else if (tag === 'ol') blocks.push({ id: uid(), type: 'ol', content: Array.from(el.querySelectorAll('li')).map(li => li.textContent).join('\n') })
    else if (tag === 'hr') blocks.push({ id: uid(), type: 'divider', content: '' })
    else if (tag === 'div' && el.classList.contains('video-embed')) {
      const src = el.querySelector('iframe')?.getAttribute('src') || ''
      blocks.push({ id: uid(), type: 'video', content: src, caption: el.querySelector('iframe')?.getAttribute('title') || '' })
    }
    else if (tag === 'figure') {
      const img = el.querySelector('img')
      const cap = el.querySelector('figcaption')
      if (img) blocks.push({ id: uid(), type: 'image', content: img.src, caption: cap?.textContent || '' })
    }
  })

  return blocks.length > 0 ? blocks : [{ id: uid(), type: 'paragraph', content: '' }]
}

// ─── Block type config ────────────────────────────────────────────────────────

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ElementType; desc: string }[] = [
  { type: 'paragraph',  label: 'Parágrafo',   icon: Type,         desc: 'Texto comum' },
  { type: 'h1',         label: 'Título H1',   icon: Heading1,     desc: 'Título grande' },
  { type: 'h2',         label: 'Título H2',   icon: Heading2,     desc: 'Subtítulo' },
  { type: 'h3',         label: 'Título H3',   icon: Heading3,     desc: 'Subtítulo menor' },
  { type: 'blockquote', label: 'Citação',     icon: Quote,        desc: 'Destaque em bloco' },
  { type: 'ul',         label: 'Lista •',     icon: List,         desc: 'Lista com marcadores' },
  { type: 'ol',         label: 'Lista 1.',    icon: ListOrdered,  desc: 'Lista numerada' },
  { type: 'image',      label: 'Imagem',      icon: ImageIcon,    desc: 'Imagem com legenda' },
  { type: 'video',      label: 'Vídeo',       icon: Video,        desc: 'YouTube / Vimeo' },
  { type: 'divider',    label: 'Divisor',     icon: X,            desc: 'Linha horizontal' },
]

const BLOCK_PLACEHOLDERS: Partial<Record<BlockType, string>> = {
  paragraph:  'Escreva aqui…',
  h1:         'Título principal',
  h2:         'Subtítulo',
  h3:         'Subtítulo menor',
  blockquote: 'Citação ou destaque…',
  ul:         'Item 1\nItem 2\nItem 3',
  ol:         'Passo 1\nPasso 2\nPasso 3',
  image:      'Cole a URL da imagem…',
  video:      'Cole a URL do YouTube ou Vimeo…',
}

const BLOCK_STYLES: Partial<Record<BlockType, string>> = {
  paragraph:  'font-body text-base text-ink-800 dark:text-ink-200 leading-relaxed',
  h1:         'font-display text-3xl font-bold text-ink-950 dark:text-ink-50',
  h2:         'font-display text-2xl font-semibold text-ink-900 dark:text-ink-100',
  h3:         'font-display text-xl font-medium text-ink-800 dark:text-ink-200',
  blockquote: 'font-body text-lg italic text-ink-600 dark:text-ink-400 border-l-3 pl-5',
  ul:         'font-body text-base text-ink-800 dark:text-ink-200',
  ol:         'font-body text-base text-ink-800 dark:text-ink-200',
}

// ─── Block Type Menu ──────────────────────────────────────────────────────────

function BlockTypeMenu({
  onSelect,
  onClose,
}: {
  onSelect: (type: BlockType) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

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
      className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 rounded-2xl shadow-xl overflow-hidden w-64"
    >
      <div className="p-2 grid grid-cols-1 gap-0.5">
        {BLOCK_TYPES.map(({ type, label, icon: Icon, desc }) => (
          <button
            key={type}
            onMouseDown={e => { e.preventDefault(); onSelect(type); onClose() }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors text-left group"
          >
            <span className="w-8 h-8 rounded-xl bg-ink-100 dark:bg-ink-800 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-100 dark:group-hover:bg-accent-900/40 transition-colors">
              <Icon size={14} className="text-ink-500 dark:text-ink-400 group-hover:text-accent-600 dark:group-hover:text-accent-400" />
            </span>
            <div>
              <p className="font-sans text-sm font-medium text-ink-800 dark:text-ink-200">{label}</p>
              <p className="font-sans text-xs text-ink-400 dark:text-ink-600">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Single Block ─────────────────────────────────────────────────────────────

function BlockEditor({
  block,
  isFirst,
  isLast,
  onChange,
  onDelete,
  onTypeChange,
  onAddAfter,
  onMoveUp,
  onMoveDown,
  onFocus,
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
  onFocus: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  const resize = useCallback(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    }
  }, [])

  useEffect(() => { resize() }, [block.content, resize])

  const currentTypeConf = BLOCK_TYPES.find(t => t.type === block.type)
  const TypeIcon = currentTypeConf?.icon || Type

  // Divider block
  if (block.type === 'divider') {
    return (
      <div
        className="relative group flex items-center gap-3 py-4"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className={`transition-opacity duration-150 flex flex-col gap-1 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <button onMouseDown={e => { e.preventDefault(); onMoveUp() }} disabled={isFirst} className="p-1 text-ink-300 hover:text-ink-600 disabled:opacity-20 rounded-lg transition-colors">
            <ChevronDown size={13} className="rotate-180" />
          </button>
          <button onMouseDown={e => { e.preventDefault(); onMoveDown() }} disabled={isLast} className="p-1 text-ink-300 hover:text-ink-600 disabled:opacity-20 rounded-lg transition-colors">
            <ChevronDown size={13} />
          </button>
        </div>
        <hr className="flex-1 border-ink-200 dark:border-ink-700" />
        <button
          onMouseDown={e => { e.preventDefault(); onDelete() }}
          className={`transition-opacity duration-150 p-1.5 text-ink-300 hover:text-red-500 rounded-lg ${showControls ? 'opacity-100' : 'opacity-0'}`}
        >
          <Trash2 size={13} />
        </button>
      </div>
    )
  }

  // Image / Video blocks
  if (block.type === 'image' || block.type === 'video') {
    return (
      <div
        className="relative group border border-ink-100 dark:border-ink-800 rounded-2xl overflow-hidden"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Preview */}
        {block.content && block.type === 'image' && (
          <img src={block.content} alt={block.caption} className="w-full max-h-72 object-cover" />
        )}
        {block.content && block.type === 'video' && (
          <div className="aspect-video bg-ink-950 flex items-center justify-center">
            <Video size={32} className="text-ink-600" />
            <span className="ml-2 font-sans text-sm text-ink-400 truncate max-w-xs">{block.content}</span>
          </div>
        )}

        <div className="p-4 space-y-2">
          <input
            value={block.content}
            onChange={e => onChange(e.target.value, block.caption)}
            placeholder={BLOCK_PLACEHOLDERS[block.type]}
            className="w-full font-sans text-sm bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-xl px-3 py-2 text-ink-900 dark:text-ink-100 focus:outline-none focus:border-accent-500 transition-colors"
          />
          <input
            value={block.caption || ''}
            onChange={e => onChange(block.content, e.target.value)}
            placeholder="Legenda (opcional)"
            className="w-full font-sans text-xs bg-transparent border border-ink-100 dark:border-ink-800 rounded-xl px-3 py-2 text-ink-500 dark:text-ink-400 focus:outline-none focus:border-accent-500 transition-colors"
          />
        </div>

        <div className={`absolute top-2 right-2 flex gap-1 transition-opacity duration-150 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          <button onMouseDown={e => { e.preventDefault(); onDelete() }} className="p-1.5 bg-white/90 dark:bg-ink-900/90 text-ink-500 hover:text-red-500 rounded-lg shadow-sm transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    )
  }

  // Text-based blocks
  return (
    <div
      className="relative group flex items-start gap-2"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Left controls: drag + reorder */}
      <div className={`flex flex-col items-center gap-0.5 pt-2 flex-shrink-0 transition-opacity duration-150 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onMouseDown={e => { e.preventDefault(); onMoveUp() }}
          disabled={isFirst}
          className="p-1 text-ink-300 hover:text-ink-600 dark:hover:text-ink-300 disabled:opacity-20 rounded-lg transition-colors"
          title="Mover para cima"
        >
          <ChevronDown size={13} className="rotate-180" />
        </button>
        <GripVertical size={13} className="text-ink-200 dark:text-ink-700 cursor-grab" />
        <button
          onMouseDown={e => { e.preventDefault(); onMoveDown() }}
          disabled={isLast}
          className="p-1 text-ink-300 hover:text-ink-600 dark:hover:text-ink-300 disabled:opacity-20 rounded-lg transition-colors"
          title="Mover para baixo"
        >
          <ChevronDown size={13} />
        </button>
      </div>

      {/* Block content */}
      <div className="flex-1 min-w-0">
        {/* Type selector */}
        <div className={`relative mb-1 transition-opacity duration-150 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button
            onMouseDown={e => { e.preventDefault(); setShowMenu(v => !v) }}
            className="flex items-center gap-1.5 font-sans text-xs text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 bg-ink-50 dark:bg-ink-800/50 hover:bg-ink-100 dark:hover:bg-ink-800 px-2.5 py-1 rounded-xl transition-colors"
          >
            <TypeIcon size={11} />
            {currentTypeConf?.label}
            <ChevronDown size={10} className={`transition-transform ${showMenu ? 'rotate-180' : ''}`} />
          </button>

          {showMenu && (
            <BlockTypeMenu
              onSelect={type => { onTypeChange(type); setShowMenu(false) }}
              onClose={() => setShowMenu(false)}
            />
          )}
        </div>

        {/* Textarea */}
        <div className={`relative ${block.type === 'blockquote' ? 'border-l-2 border-accent-400 pl-4' : ''}`}>
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={e => { onChange(e.target.value); resize() }}
            onFocus={onFocus}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey && block.type !== 'ul' && block.type !== 'ol') {
                e.preventDefault()
                onAddAfter('paragraph')
              }
              if (e.key === 'Backspace' && block.content === '') {
                e.preventDefault()
                onDelete()
              }
            }}
            placeholder={BLOCK_PLACEHOLDERS[block.type]}
            rows={1}
            className={`
              w-full bg-transparent outline-none resize-none overflow-hidden
              placeholder-ink-300 dark:placeholder-ink-700
              ${BLOCK_STYLES[block.type] || ''}
            `}
            style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          />
        </div>
      </div>

      {/* Delete button */}
      <button
        onMouseDown={e => { e.preventDefault(); onDelete() }}
        className={`flex-shrink-0 mt-2 p-1.5 text-ink-300 hover:text-red-500 rounded-lg transition-all duration-150 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        title="Remover bloco"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

// ─── Add Block Button ─────────────────────────────────────────────────────────

function AddBlockButton({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative flex items-center gap-3 py-1 group">
      <div className="flex-1 h-px bg-ink-100 dark:bg-ink-800 opacity-0 group-hover:opacity-100 transition-opacity" />
      <button
        onMouseDown={e => { e.preventDefault(); setOpen(v => !v) }}
        className="flex items-center gap-1.5 font-sans text-xs text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 bg-ink-50 dark:bg-ink-900 hover:bg-ink-100 dark:hover:bg-ink-800 border border-ink-200 dark:border-ink-700 px-3 py-1.5 rounded-2xl transition-colors whitespace-nowrap"
      >
        <Plus size={12} /> Adicionar bloco
      </button>
      <div className="flex-1 h-px bg-ink-100 dark:bg-ink-800 opacity-0 group-hover:opacity-100 transition-opacity" />

      {open && (
        <BlockTypeMenu
          onSelect={type => { onAdd(type); setOpen(false) }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}

// ─── Sidebar inputs ───────────────────────────────────────────────────────────

const INPUT = "w-full font-sans text-sm bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl px-4 py-2.5 text-ink-900 dark:text-ink-100 focus:outline-none focus:border-accent-500 transition-colors"
const CARD = "bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-3xl p-5"

// ─── Preview ──────────────────────────────────────────────────────────────────

function Preview({ html, title, subtitle }: { html: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl mx-auto py-8 px-6">
      {title && <h1 className="font-display text-4xl font-bold text-ink-950 dark:text-ink-50 leading-tight mb-3">{title}</h1>}
      {subtitle && <p className="font-display text-xl italic text-ink-500 dark:text-ink-400 mb-8">{subtitle}</p>}
      <div className="prose-editorial" dangerouslySetInnerHTML={{ __html: html || '<p style="color:#999">Sem conteúdo ainda.</p>' }} />
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
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)

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

  // Update reading time when content changes
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

  // Block operations
  const updateBlock = useCallback((blockId: string, content: string, caption?: string) => {
    setBlocks(bs => bs.map(b => b.id === blockId ? { ...b, content, caption } : b))
  }, [])

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(bs => {
      if (bs.length === 1) return [{ id: uid(), type: 'paragraph', content: '' }]
      return bs.filter(b => b.id !== blockId)
    })
  }, [])

  const changeBlockType = useCallback((blockId: string, type: BlockType) => {
    setBlocks(bs => bs.map(b => b.id === blockId ? { ...b, type } : b))
  }, [])

  const addBlockAfter = useCallback((blockId: string, type: BlockType = 'paragraph') => {
    const newBlock: Block = { id: uid(), type, content: '' }
    setBlocks(bs => {
      const idx = bs.findIndex(b => b.id === blockId)
      if (idx === -1) return [...bs, newBlock]
      const next = [...bs]
      next.splice(idx + 1, 0, newBlock)
      return next
    })
  }, [])

  const addBlockAtEnd = useCallback((type: BlockType = 'paragraph') => {
    setBlocks(bs => [...bs, { id: uid(), type, content: '' }])
  }, [])

  const moveBlock = useCallback((blockId: string, direction: 'up' | 'down') => {
    setBlocks(bs => {
      const idx = bs.findIndex(b => b.id === blockId)
      if (idx === -1) return bs
      const next = [...bs]
      const target = direction === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= next.length) return bs;
      [next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }, [])

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
    } catch (e: any) {
      setError(e.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-ink-300 border-t-accent-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="h-full">
      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/artigos')}
            className="p-2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 rounded-2xl transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-sans text-xl font-bold text-ink-950 dark:text-ink-50">
            {isNew ? 'Novo artigo' : 'Editar artigo'}
          </h1>
          {!isNew && (
            <span className="font-sans text-xs text-ink-400 bg-ink-100 dark:bg-ink-800 px-2.5 py-1 rounded-full">
              {blocks.length} bloco{blocks.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreview(v => !v)}
            className={`flex items-center gap-1.5 font-sans text-sm px-3 py-2 rounded-2xl border transition-colors ${
              preview
                ? 'border-accent-500 text-accent-600 bg-accent-50 dark:bg-accent-900/20'
                : 'border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400'
            }`}
          >
            <Eye size={14} /> {preview ? 'Editar' : 'Preview'}
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="flex items-center gap-1.5 font-sans text-sm px-3 py-2 rounded-2xl border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-ink-400 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
            Rascunho
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="flex items-center gap-1.5 font-sans text-sm px-4 py-2 rounded-2xl bg-accent-600 hover:bg-accent-700 text-white transition-colors disabled:opacity-50"
          >
            {saving && <Loader size={14} className="animate-spin" />}
            Publicar
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl font-sans text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        {/* ── Editor / Preview ── */}
        <div>
          {preview ? (
            <div className={CARD + ' min-h-[600px] overflow-hidden'}>
              <Preview html={html} title={form.title} subtitle={form.subtitle} />
            </div>
          ) : (
            <div className={CARD + ' space-y-1'}>
              {/* Title */}
              <input
                type="text"
                value={form.title}
                onChange={e => set('title', e.target.value)}
                placeholder="Título do artigo"
                className="w-full font-display text-3xl font-bold text-ink-950 dark:text-ink-50 bg-transparent placeholder-ink-200 dark:placeholder-ink-700 outline-none border-b border-ink-100 dark:border-ink-800 pb-3 mb-2"
                style={{ wordBreak: 'break-word' }}
              />

              {/* Subtitle */}
              <input
                type="text"
                value={form.subtitle}
                onChange={e => set('subtitle', e.target.value)}
                placeholder="Subtítulo (opcional)"
                className="w-full font-display text-lg italic text-ink-500 dark:text-ink-400 bg-transparent placeholder-ink-200 dark:placeholder-ink-700 outline-none mb-4"
                style={{ wordBreak: 'break-word' }}
              />

              {/* Divider */}
              <div className="border-t border-ink-100 dark:border-ink-800 my-4" />

              {/* Blocks */}
              <div className="space-y-2 min-h-[300px]">
                {blocks.map((block, idx) => (
                  <BlockEditor
                    key={block.id}
                    block={block}
                    isFirst={idx === 0}
                    isLast={idx === blocks.length - 1}
                    onChange={(content, caption) => updateBlock(block.id, content, caption)}
                    onDelete={() => deleteBlock(block.id)}
                    onTypeChange={type => changeBlockType(block.id, type)}
                    onAddAfter={type => addBlockAfter(block.id, type)}
                    onMoveUp={() => moveBlock(block.id, 'up')}
                    onMoveDown={() => moveBlock(block.id, 'down')}
                    onFocus={() => {}}
                  />
                ))}
              </div>

              {/* Add block */}
              <div className="pt-4">
                <AddBlockButton onAdd={addBlockAtEnd} />
              </div>

              {/* Reading time */}
              <div className="pt-4 border-t border-ink-100 dark:border-ink-800">
                <p className="font-sans text-xs text-ink-400">
                  Leitura estimada: <strong className="text-ink-600 dark:text-ink-300">{form.reading_time} min</strong>
                  <span className="mx-2 text-ink-200">·</span>
                  {blocks.length} bloco{blocks.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Status */}
          <div className={CARD}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Status</h3>
            {[{ key: 'published', label: 'Publicado' }, { key: 'featured', label: 'Destaque' }].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2.5 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={form[key as 'published' | 'featured']}
                  onChange={e => set(key as any, e.target.checked)}
                  className="accent-accent-600 w-4 h-4 rounded"
                />
                <span className="font-sans text-sm text-ink-700 dark:text-ink-300">{label}</span>
              </label>
            ))}
          </div>

          {/* Cover */}
          <div className={CARD}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Imagem de capa</h3>
            {form.cover_image && (
              <img src={form.cover_image} alt="Capa" className="w-full aspect-video object-cover rounded-2xl mb-3" />
            )}
            <input
              type="text"
              value={form.cover_image}
              onChange={e => set('cover_image', e.target.value)}
              placeholder="URL da imagem"
              className={INPUT + ' mb-2'}
            />
            <input ref={fileRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 font-sans text-xs text-ink-600 dark:text-ink-400 hover:text-accent-600 transition-colors"
            >
              {uploading ? <Loader size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? 'Enviando…' : 'Fazer upload'}
            </button>
          </div>

          {/* URL slug */}
          <div className={CARD}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">URL</h3>
            <input
              type="text"
              value={form.slug}
              onChange={e => set('slug', e.target.value)}
              placeholder="slug-do-artigo"
              className={INPUT}
            />
            <p className="font-sans text-xs text-ink-400 mt-1.5">/artigos/{form.slug || 'slug'}</p>
          </div>

          {/* Category */}
          <div className={CARD}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Categoria</h3>
            <select
              value={form.category_id}
              onChange={e => set('category_id', e.target.value)}
              className={INPUT + ' cursor-pointer'}
            >
              <option value="">Sem categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div className={CARD}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Resumo</h3>
            <textarea
              value={form.excerpt}
              onChange={e => set('excerpt', e.target.value)}
              placeholder="Breve descrição do artigo…"
              rows={3}
              className={INPUT + ' resize-none'}
            />
          </div>

          {/* Tags */}
          <div className={CARD}>
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-3">Tags</h3>
            <input
              type="text"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
              placeholder="tag1, tag2, tag3"
              className={INPUT}
            />
            <p className="font-sans text-xs text-ink-400 mt-1.5">Separadas por vírgula</p>
          </div>
        </div>
      </div>
    </div>
  )
}
