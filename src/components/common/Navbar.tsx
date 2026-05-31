import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, Sun, Moon, ChevronDown } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { to: '/categorias/politica', label: 'Política' },
  { to: '/categorias/cultura', label: 'Cultura' },
  { to: '/categorias/tecnologia', label: 'Tecnologia' },
  { to: '/categorias/sociedade', label: 'Sociedade' },
  { to: '/entrevistas', label: 'Entrevistas' },
]

const MORE_LINKS = [
  { to: '/clipping', label: 'Clipping' },
  { to: '/press-kit', label: 'Press Kit' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/contato', label: 'Contato' },
]

const MOBILE_LINKS = [...NAV_LINKS, ...MORE_LINKS]

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-paper/95 dark:bg-ink-950/95 backdrop-blur-sm border-b border-ink-100 dark:border-ink-800'
          : 'bg-transparent'
      }`}
    >
      <div id="reading-progress" />

      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="font-display text-xl font-bold text-ink-950 dark:text-ink-50 tracking-tight flex-shrink-0"
          >
            Karol Martins<span className="text-accent-500">.</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `font-sans text-sm tracking-wide transition-colors ${
                    isActive
                      ? 'text-accent-600 dark:text-accent-400'
                      : 'text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}

            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(v => !v)}
                onBlur={() => setTimeout(() => setMoreOpen(false), 150)}
                className="flex items-center gap-1 font-sans text-sm text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors"
              >
                Mais <ChevronDown size={13} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-44 bg-paper dark:bg-ink-900 border border-ink-100 dark:border-ink-800 shadow-lg py-1"
                  >
                    {MORE_LINKS.map(l => (
                      <NavLink
                        key={l.to}
                        to={l.to}
                        onClick={() => setMoreOpen(false)}
                        className={({ isActive }) =>
                          `block px-4 py-2.5 font-sans text-sm transition-colors ${
                            isActive
                              ? 'text-accent-600 dark:text-accent-400 bg-ink-50 dark:bg-ink-800'
                              : 'text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 hover:bg-ink-50 dark:hover:bg-ink-800'
                          }`
                        }
                      >
                        {l.label}
                      </NavLink>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(v => !v)}
              className="p-2 text-ink-500 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors"
              aria-label="Buscar"
            >
              <Search size={17} />
            </button>
            <button
              onClick={toggle}
              className="p-2 text-ink-500 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            {user && (
              <Link
                to="/admin"
                className="hidden md:block font-sans text-xs uppercase tracking-widest bg-ink-950 dark:bg-ink-100 text-ink-50 dark:text-ink-950 px-3 py-1.5 hover:bg-accent-600 dark:hover:bg-accent-400 transition-colors"
              >
                Admin
              </Link>
            )}
            <button
              className="md:hidden p-2 text-ink-600 dark:text-ink-400"
              onClick={() => setOpen(v => !v)}
              aria-label="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-ink-100 dark:border-ink-800"
            >
              <form onSubmit={handleSearch} className="py-3 flex gap-3">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar artigos, entrevistas, análises…"
                  className="flex-1 bg-transparent font-sans text-sm text-ink-900 dark:text-ink-100 placeholder-ink-400 outline-none"
                />
                <button
                  type="submit"
                  className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400"
                >
                  Buscar
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-paper dark:bg-ink-950 border-t border-ink-100 dark:border-ink-800 px-6 py-5"
          >
            <nav className="flex flex-col gap-1">
              {MOBILE_LINKS.map(l => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `font-sans text-sm py-2 border-b border-ink-50 dark:border-ink-900 ${
                      isActive ? 'text-accent-600 dark:text-accent-400' : 'text-ink-700 dark:text-ink-300'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              {user && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="font-sans text-sm py-2 text-accent-600 dark:text-accent-400 mt-2"
                >
                  Painel Admin
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
