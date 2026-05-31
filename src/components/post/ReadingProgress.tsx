import { useEffect } from 'react'
import { useReadingProgress } from '../../hooks/useReadingProgress'

export default function ReadingProgress() {
  const progress = useReadingProgress()

  useEffect(() => {
    const bar = document.getElementById('reading-progress')
    if (bar) bar.style.width = `${progress}%`
  }, [progress])

  return null
}
