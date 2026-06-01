import { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface TiltedCardProps {
  children: React.ReactNode
  className?: string
  rotateAmplitude?: number
  scaleOnHover?: number
  springConfig?: { stiffness: number; damping: number }
}

export default function TiltedCard({
  children,
  className = '',
  rotateAmplitude = 10,
  scaleOnHover = 1.03,
  springConfig = { stiffness: 300, damping: 30 },
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const rawRotateX = useMotionValue(0)
  const rawRotateY = useMotionValue(0)

  const rotateX = useSpring(rawRotateX, springConfig)
  const rotateY = useSpring(rawRotateY, springConfig)
  const scale = useSpring(1, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const percentX = (x - centerX) / centerX
    const percentY = (y - centerY) / centerY
    rawRotateX.set(-percentY * rotateAmplitude)
    rawRotateY.set(percentX * rotateAmplitude)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
    scale.set(scaleOnHover)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    rawRotateX.set(0)
    rawRotateY.set(0)
    scale.set(1)
  }

  // Subtle glare effect
  const glareX = useTransform(rotateY, [-rotateAmplitude, rotateAmplitude], ['0%', '100%'])
  const glareY = useTransform(rotateX, [-rotateAmplitude, rotateAmplitude], ['100%', '0%'])

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d',
        transformPerspective: 800,
      }}
      className={`relative ${className}`}
    >
      {children}

      {/* Glare overlay */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden z-10"
          style={{ opacity: 0.08 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.9) 0%, transparent 60%)`,
            }}
          />
        </motion.div>
      )}
    </motion.div>
  )
}
