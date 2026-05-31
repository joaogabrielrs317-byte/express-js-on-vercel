import { Link2, Share2 } from 'lucide-react'
import { useState } from 'react'

interface Props {
  title: string
  url: string
}

export default function ShareButtons({ title, url }: Props) {
  const [copied, setCopied] = useState(false)
  const full = `${window.location.origin}${url}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(full)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3">
      <span className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mr-1">
        Compartilhar
      </span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(full)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans text-xs text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors flex items-center gap-1"
      >
        <Share2 size={13} /> Twitter
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(full)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-sans text-xs text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors flex items-center gap-1"
      >
        <Share2 size={13} /> Facebook
      </a>
      <button
        onClick={copyLink}
        className="font-sans text-xs text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors flex items-center gap-1"
        aria-label="Copiar link"
      >
        <Link2 size={13} />
        {copied ? 'Copiado!' : 'Copiar link'}
      </button>
    </div>
  )
}
