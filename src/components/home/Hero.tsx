import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Hero() {
  const [photo, setPhoto] = useState('/karol-martins.jpeg')
  const [name, setName] = useState('Karol Martins')
  const [role, setRole] = useState('Jornalista')

  useEffect(() => {
    supabase.from('profile').select('photo_url,name,role').single().then(({ data }) => {
      if (data?.photo_url) setPhoto(data.photo_url)
      if (data?.name) setName(data.name)
      if (data?.role) setRole(data.role)
    })
  }, [])

  const scrollToPublicacoes = () => {
    document.getElementById('publicacoes')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="min-h-[90vh] flex flex-col justify-center pt-20 pb-12 px-6">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

          {/* Text side */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-6"
            >
              Jornalismo — Análise — Investigação
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl md:text-7xl font-bold text-ink-950 dark:text-ink-50 leading-[1.05] tracking-tight mb-4"
            >
              {name}<span className="text-accent-500">.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-sans text-sm uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-6"
            >
              {role}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="font-body text-xl text-ink-600 dark:text-ink-400 max-w-xl leading-relaxed mb-10"
            >
              Histórias que precisam ser contadas.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                onClick={scrollToPublicacoes}
                className="font-sans text-sm uppercase tracking-widest bg-ink-950 dark:bg-ink-100 text-ink-50 dark:text-ink-950 px-7 py-4 hover:bg-accent-600 dark:hover:bg-accent-300 transition-colors"
              >
                Ler matérias
              </button>
              <Link
                to="/sobre"
                className="font-sans text-sm uppercase tracking-widest text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors flex items-center gap-2"
              >
                Sobre mim <ArrowDown size={14} className="rotate-[-45deg]" />
              </Link>
            </motion.div>
          </div>

          {/* Photo side */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="aspect-[3/4] overflow-hidden bg-ink-100 dark:bg-ink-800 max-w-sm ml-auto">
              <img
                src={photo}
                alt={name}
                className="w-full h-full object-cover object-top"
              />
            </div>
          </motion.div>

        </div>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: 'easeInOut' }}
        className="max-w-6xl mx-auto w-full mt-16"
      >
        <div className="h-px bg-ink-100 dark:bg-ink-800 origin-left" />
      </motion.div>
    </section>
  )
}
