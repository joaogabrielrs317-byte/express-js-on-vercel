import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FadeContentProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  blur?: boolean
}

export default function FadeContent({ children, className = '', delay = 0, duration = 0.6, blur = false }: FadeContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: blur ? 'blur(8px)' : 'none' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
