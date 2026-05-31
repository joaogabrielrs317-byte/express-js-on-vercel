import type { CSSProperties } from 'react'

interface ShinyTextProps {
  text: string
  className?: string
  speed?: number
  disabled?: boolean
}

export default function ShinyText({ text, className = '', speed = 3, disabled = false }: ShinyTextProps) {
  const style: CSSProperties = {
    backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 70%)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    animation: disabled ? 'none' : `shine ${speed}s linear infinite`,
  }
  return (
    <>
      <style>{`@keyframes shine { 0% { background-position: 100% } 100% { background-position: -100% } }`}</style>
      <span className={className} style={style}>{text}</span>
    </>
  )
}
