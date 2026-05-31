import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  to: number
  duration?: number
  className?: string
  suffix?: string
}

export default function CountUp({ to, duration = 1.5, className = '', suffix = '' }: CountUpProps) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const tick = (now: number) => {
          const p = Math.min((now - start) / (duration * 1000), 1)
          const ease = 1 - Math.pow(1 - p, 3)
          setValue(Math.round(ease * to))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, duration])

  return <span ref={ref} className={className}>{value}{suffix}</span>
}
