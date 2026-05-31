import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, FolderOpen, Users, LogOut, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/admin', label: 'Painel', icon: LayoutDashboard, end: true },
  { to: '/admin/artigos', label: 'Artigos', icon: FileText },
  { to: '/admin/artigos/novo', label: 'Novo artigo', icon: Plus },
  { to: '/admin/categorias', label: 'Categorias', icon: FolderOpen },
  { to: '/admin/newsletter', label: 'Newsletter', icon: Users },
]

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-ink-950 dark:bg-ink-900 flex flex-col fixed h-full z-40">
        <div className="px-5 py-5 border-b border-ink-800">
          <span className="font-display text-lg font-bold text-ink-50">
            Ana Beatriz<span className="text-accent-400">.</span>
          </span>
          <p className="font-sans text-xs text-ink-500 mt-0.5">Painel Admin</p>
        </div>

        <nav className="flex-1 py-4 px-3">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 font-sans text-sm rounded transition-colors mb-0.5 ${
                  isActive
                    ? 'bg-ink-800 text-ink-50'
                    : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800/50'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-ink-800">
          <p className="font-sans text-xs text-ink-500 truncate mb-3">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 font-sans text-sm text-ink-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="ml-56 flex-1 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
