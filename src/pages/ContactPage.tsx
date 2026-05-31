import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ExternalLink, Send, Loader, Check, MapPin } from 'lucide-react'

// ─────────────────────────────────────────────
// EDITE AQUI: configure o endpoint do formulário
// Opções gratuitas: Formspree (formspree.io) ou Web3Forms (web3forms.com)
// 1. Crie uma conta em formspree.io
// 2. Crie um novo form e copie o endpoint
// 3. Cole abaixo
// ─────────────────────────────────────────────
const FORM_ENDPOINT = 'https://formspree.io/f/SEU_ID_AQUI'

const CONTACT_INFO = {
  email: 'contato@karolmartins.jor.br',
  location: 'São Paulo, SP — Brasil',
  socials: [
    { label: 'Twitter / X', url: 'https://twitter.com' },
    { label: 'Instagram', url: 'https://instagram.com' },
    { label: 'LinkedIn', url: 'https://linkedin.com' },
  ],
  responseTime: 'Respondo em até 48 horas.',
}

const SUBJECTS = [
  'Proposta de pauta',
  'Convite para entrevista',
  'Oportunidade de estágio',
  'Freelance / colaboração',
  'Outro',
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '', email: '', subject: '', message: '',
  })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const set = (k: keyof typeof form, v: string) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        throw new Error('Erro ao enviar')
      }
    } catch {
      setStatus('error')
      setErrorMsg('Não foi possível enviar. Tente por e-mail diretamente.')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <div className="pt-24 pb-24 max-w-6xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-16 pb-12 border-b border-ink-100 dark:border-ink-800"
      >
        <p className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-3">
          Contato
        </p>
        <h1 className="font-display text-5xl font-bold text-ink-950 dark:text-ink-50 mb-3">
          Vamos conversar
        </h1>
        <p className="font-body text-ink-500 dark:text-ink-400 max-w-xl">
          Aberta a propostas de pauta, convites para entrevistas, oportunidades de estágio e colaborações.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-16">

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Check size={22} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="font-display text-2xl font-semibold text-ink-950 dark:text-ink-50">
                Mensagem enviada!
              </h2>
              <p className="font-body text-ink-500 dark:text-ink-400 max-w-xs">
                Obrigada pelo contato. Responderei em breve.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="font-sans text-sm text-accent-600 dark:text-accent-400 hover:underline mt-2"
              >
                Enviar outra mensagem
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-1.5 block">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-transparent border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-100 font-sans text-sm px-4 py-3 outline-none focus:border-ink-700 dark:focus:border-ink-300 transition-colors placeholder-ink-300 dark:placeholder-ink-700"
                  />
                </div>
                <div>
                  <label className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-1.5 block">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-transparent border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-100 font-sans text-sm px-4 py-3 outline-none focus:border-ink-700 dark:focus:border-ink-300 transition-colors placeholder-ink-300 dark:placeholder-ink-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-1.5 block">
                  Assunto *
                </label>
                <select
                  required
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                  className="w-full bg-transparent border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-100 font-sans text-sm px-4 py-3 outline-none focus:border-ink-700 dark:focus:border-ink-300 transition-colors"
                >
                  <option value="">Selecione o assunto</option>
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-1.5 block">
                  Mensagem *
                </label>
                <textarea
                  required
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  rows={7}
                  placeholder="Conte mais sobre o que você tem em mente…"
                  className="w-full bg-transparent border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-100 font-sans text-sm px-4 py-3 outline-none focus:border-ink-700 dark:focus:border-ink-300 transition-colors resize-none placeholder-ink-300 dark:placeholder-ink-700"
                />
              </div>

              {status === 'error' && (
                <p className="font-sans text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
              )}

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex items-center gap-2 bg-ink-950 dark:bg-ink-100 text-ink-50 dark:text-ink-950 font-sans text-sm uppercase tracking-widest px-7 py-3.5 hover:bg-accent-700 dark:hover:bg-accent-300 transition-colors disabled:opacity-60"
                >
                  {status === 'loading'
                    ? <><Loader size={14} className="animate-spin" /> Enviando…</>
                    : <><Send size={14} /> Enviar mensagem</>
                  }
                </button>
                <p className="font-sans text-xs text-ink-400 dark:text-ink-600">
                  Campos com * são obrigatórios
                </p>
              </div>

              {/* Formspree note if not configured */}
              {FORM_ENDPOINT.includes('SEU_ID_AQUI') && (
                <div className="border border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10 p-4">
                  <p className="font-sans text-xs text-amber-700 dark:text-amber-400">
                    <strong>Configure o formulário:</strong> Crie uma conta grátis em{' '}
                    <a href="https://formspree.io" target="_blank" rel="noopener noreferrer" className="underline">formspree.io</a>
                    , crie um form e substitua <code>SEU_ID_AQUI</code> pelo seu ID em <code>ContactPage.tsx</code>.
                  </p>
                </div>
              )}
            </form>
          )}
        </motion.div>

        {/* Sidebar info */}
        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-6"
        >
          <div className="border border-ink-100 dark:border-ink-800 p-6">
            <h3 className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-4">
              Contato direto
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                className="flex items-center gap-2 font-sans text-sm text-ink-700 dark:text-ink-300 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
              >
                <Mail size={14} />
                {CONTACT_INFO.email}
              </a>
              <span className="flex items-center gap-2 font-sans text-sm text-ink-500 dark:text-ink-500">
                <MapPin size={14} />
                {CONTACT_INFO.location}
              </span>
            </div>
          </div>

          <div className="border border-ink-100 dark:border-ink-800 p-6">
            <h3 className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-4">
              Redes sociais
            </h3>
            <div className="flex flex-col gap-2">
              {CONTACT_INFO.socials.map(({ label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 font-sans text-sm text-ink-700 dark:text-ink-300 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
                >
                  <ExternalLink size={13} />
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="bg-ink-50 dark:bg-ink-900 border border-ink-100 dark:border-ink-800 p-6">
            <p className="font-body text-sm text-ink-600 dark:text-ink-400 italic leading-relaxed">
              "{CONTACT_INFO.responseTime}"
            </p>
          </div>
        </motion.aside>
      </div>
    </div>
  )
}
