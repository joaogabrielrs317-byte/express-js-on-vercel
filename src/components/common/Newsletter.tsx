import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Check, Loader } from 'lucide-react'
import { newsletterService } from '../../services'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      await newsletterService.subscribe(email.trim())
      setStatus('success')
      setMessage('Inscrição confirmada! Obrigada.')
      setEmail('')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Erro ao se inscrever. Tente novamente.')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  return (
    <section className="border-t border-b border-ink-100 dark:border-ink-800 py-16">
      <div className="max-w-xl mx-auto text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-3">
            Newsletter
          </p>
          <h2 className="font-display text-3xl font-semibold text-ink-950 dark:text-ink-50 mb-3">
            Receba as matérias em primeira mão
          </h2>
          <p className="font-body text-ink-500 dark:text-ink-400 mb-8">
            Novas publicações, análises e bastidores do jornalismo direto no seu e-mail. Sem spam.
          </p>

          {status === 'success' ? (
            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
              <Check size={18} />
              <span className="font-sans text-sm">{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="flex-1 bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-700 px-4 py-3 font-sans text-sm text-ink-900 dark:text-ink-100 placeholder-ink-400 outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-ink-950 dark:bg-ink-100 text-ink-50 dark:text-ink-950 px-5 py-3 font-sans text-sm hover:bg-accent-600 dark:hover:bg-accent-300 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {status === 'loading' ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                Assinar
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-2 font-sans text-xs text-red-600 dark:text-red-400">{message}</p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
