import { motion } from 'framer-motion'

interface BlurTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  as?: keyof JSX.IntrinsicElements
}

export default function BlurText({ text, className = '', delay = 0, duration = 0.5, as: Tag = 'span' }: BlurTextProps) {
  const words = text.split(' ')
  return (
    <Tag className={className} style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: 'blur(12px)', y: 8 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration, delay: delay + i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  )
}
