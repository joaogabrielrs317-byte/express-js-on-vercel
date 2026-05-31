/**
 * Recebe qualquer URL do YouTube ou Vimeo e retorna a URL de embed.
 * Suporta: youtube.com/watch?v=, youtu.be/, vimeo.com/
 */
export function getEmbedUrl(input: string): string | null {
  const str = input.trim()

  // YouTube: youtube.com/watch?v=ID ou youtu.be/ID ou youtube.com/embed/ID
  const ytMatch =
    str.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/) 
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`
  }

  // Vimeo: vimeo.com/ID
  const vimeoMatch = str.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  return null
}

/**
 * Gera o HTML do iframe de embed pronto para ser inserido no conteúdo.
 */
export function buildEmbedHtml(url: string, title = ''): string {
  const embedUrl = getEmbedUrl(url)
  if (!embedUrl) return ''
  return `<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;margin:2rem 0;">
  <iframe
    src="${embedUrl}"
    title="${title || 'Vídeo'}"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen
    style="position:absolute;top:0;left:0;width:100%;height:100%;"
  ></iframe>
</div>`
}

/**
 * Extrai o ID do thumbnail do YouTube a partir de qualquer URL.
 */
export function getYouTubeThumbnail(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  if (match) return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
  return null
}

export function extractFirstVideoUrl(content: string): string | null {
  const match = content.match(/src="(https:\/\/(?:www\.youtube\.com\/embed|player\.vimeo\.com\/video)\/[^"]+)"/)
  return match ? match[1] : null
}
