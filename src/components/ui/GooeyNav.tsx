import { useRef, useState, useEffect, useCallback } from 'react'

interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
}

interface GooeyNavProps {
  items: NavItem[]
  activeIndex?: number
  onItemClick?: (index: number, item: NavItem) => void
  particleCount?: number
  particleSize?: number
  colors?: string[]
  className?: string
}

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  vx: number
  vy: number
  life: number
  maxLife: number
}

export default function GooeyNav({
  items,
  activeIndex = 0,
  onItemClick,
  particleCount = 12,
  particleSize = 8,
  colors = ['#4f46e5', '#818cf8', '#a5b4fc', '#6366f1'],
  className = '',
}: GooeyNavProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [active, setActive] = useState(activeIndex)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)
  const particleIdRef = useRef(0)

  // Update indicator position
  const updateIndicator = useCallback((idx: number) => {
    const container = containerRef.current
    const item = itemRefs.current[idx]
    if (!container || !item) return
    const containerRect = container.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    setIndicatorStyle({
      left: itemRect.left - containerRect.left,
      width: itemRect.width,
    })
  }, [])

  useEffect(() => {
    // Small delay to let layout settle
    const t = setTimeout(() => updateIndicator(active), 50)
    return () => clearTimeout(t)
  }, [active, updateIndicator])

  useEffect(() => {
    setActive(activeIndex)
  }, [activeIndex])

  // Particle system
  const spawnParticles = useCallback((x: number, y: number) => {
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5
      const speed = 1.5 + Math.random() * 3
      particlesRef.current.push({
        id: particleIdRef.current++,
        x,
        y,
        size: particleSize * (0.4 + Math.random() * 0.8),
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        maxLife: 40 + Math.random() * 20,
      })
    }
  }, [particleCount, particleSize, colors])

  // Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current = particlesRef.current.filter(p => p.life > 0)

      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.12 // gravity
        p.vx *= 0.97
        p.life -= 1 / p.maxLife

        const alpha = Math.max(0, p.life)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2)
        ctx.fillStyle = p.color + Math.round(alpha * 255).toString(16).padStart(2, '0')
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const handleClick = (idx: number, item: NavItem) => {
    // Spawn particles at the clicked item center
    const el = itemRefs.current[idx]
    const container = containerRef.current
    if (el && container) {
      const cRect = container.getBoundingClientRect()
      const eRect = el.getBoundingClientRect()
      spawnParticles(
        eRect.left - cRect.left + eRect.width / 2,
        eRect.top - cRect.top + eRect.height / 2
      )
    }
    setActive(idx)
    onItemClick?.(idx, item)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* SVG gooey filter */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="gooey-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-20"
      />

      {/* Nav with gooey filter applied to the indicator + items group */}
      <div
        className="relative flex items-center gap-1 p-1.5 rounded-2xl bg-ink-100 dark:bg-ink-800"
        style={{ filter: 'url(#gooey-filter)' }}
      >
        {/* Sliding indicator — rendered INSIDE the filtered div so gooey merging works */}
        <div
          className="absolute top-1.5 bottom-1.5 rounded-xl bg-accent-600 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
        />

        {items.map((item, idx) => (
          <button
            key={item.href}
            ref={el => { itemRefs.current[idx] = el }}
            onClick={() => handleClick(idx, item)}
            className={`
              relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl
              font-sans text-sm font-medium transition-colors duration-200
              ${active === idx
                ? 'text-white'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-ink-100'
              }
            `}
          >
            {item.icon && (
              <span className="flex-shrink-0">{item.icon}</span>
            )}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}
