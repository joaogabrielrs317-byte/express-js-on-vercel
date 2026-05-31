import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function AuthorCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="py-16"
    >
      <div className="max-w-2xl">
        <p className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-4">
          A autora
        </p>
        <h2 className="font-display text-3xl font-semibold text-ink-950 dark:text-ink-50 mb-4">
          Karol Martins
        </h2>
        <p className="font-body text-ink-600 dark:text-ink-400 leading-relaxed mb-6">
          Estudante de Jornalismo comprometida com a apuração rigorosa e a narrativa que serve ao leitor.
          Escrevo sobre política, cultura e sociedade com o olhar de quem acredita que informação é um direito.
        </p>
        <Link
          to="/sobre"
          className="inline-flex items-center gap-2 font-sans text-sm uppercase tracking-widest text-ink-950 dark:text-ink-50 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
        >
          Conhecer trajetória <ArrowRight size={14} />
        </Link>
      </div>
    </motion.section>
  )
}
