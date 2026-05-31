import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/admin" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/admin')
    } catch {
      setError('E-mail ou senha incorretos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-ink-50 mb-1">
            Ana Beatriz<span className="text-accent-400">.</span>
          </h1>
          <p className="font-sans text-sm text-ink-500">Painel administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-sans text-xs uppercase tracking-widest text-ink-500 mb-1.5 block">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-ink-900 border border-ink-700 text-ink-100 font-sans text-sm px-4 py-3 outline-none focus:border-ink-500 transition-colors"
            />
          </div>

          <div>
            <label className="font-sans text-xs uppercase tracking-widest text-ink-500 mb-1.5 block">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-ink-900 border border-ink-700 text-ink-100 font-sans text-sm px-4 py-3 outline-none focus:border-ink-500 transition-colors"
            />
          </div>

          {error && (
            <p className="font-sans text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-accent-600 hover:bg-accent-500 text-white font-sans text-sm uppercase tracking-widest py-3 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader size={14} className="animate-spin" />}
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
