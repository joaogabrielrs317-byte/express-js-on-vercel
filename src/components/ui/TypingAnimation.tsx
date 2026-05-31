import { useEffect, useState } from 'react'

interface TypingAnimationProps {
  texts: string[]
  className?: string
  speed?: number
  pauseMs?: number
}

export default function TypingAnimation({ texts, className = '', speed = 60, pauseMs = 1800 }: TypingAnimationProps) {
  const [display, setDisplay] = useState('')
  const [idx, setIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = texts[idx % texts.length]
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (display.length < current.length) {
          setDisplay(current.slice(0, display.length + 1))
        } else {
          setTimeout(() => setDeleting(true), pauseMs)
        }
      } else {
        if (display.length > 0) {
          setDisplay(display.slice(0, -1))
        } else {
          setDeleting(false)
          setIdx(i => i + 1)
        }
      }
    }, deleting ? speed / 2 : speed)
    return () => clearTimeout(timeout)
  }, [display, deleting, idx, texts, speed, pauseMs])

  return (
    <span className={className}>
      {display}
      <span style={{ animation: 'blink 1s step-end infinite', borderRight: '2px solid currentColor', marginLeft: 2 }}>
        <style>{`@keyframes blink { 50% { opacity: 0 } }`}</style>
      </span>
    </span>
  )
}
