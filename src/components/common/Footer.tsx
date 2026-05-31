import { Link } from 'react-router-dom'
import { Mail, ExternalLink } from 'lucide-react'

const OUTLETS = [
  { name: 'Agência Pública', url: 'https://apublica.org' },
  { name: 'Nexo Jornal', url: 'https://nexojornal.com.br' },
  { name: 'Ponte Jornalismo', url: 'https://ponte.org' },
  { name: 'Brasil de Fato', url: 'https://brasildefato.com.br' },
]

export default function Footer() {
  return (
    <footer className="border-t border-ink-100 dark:border-ink-800 bg-paper dark:bg-ink-950 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="font-display text-2xl font-bold text-ink-950 dark:text-ink-50">
              Karol Martins<span className="text-accent-500">.</span>
            </Link>
            <p className="mt-3 font-body text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
              Jornalismo investigativo, análise política e histórias que importam.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              {[
                { label: 'Twitter', url: 'https://twitter.com' },
                { label: 'Instagram', url: 'https://instagram.com' },
                { label: 'LinkedIn', url: 'https://linkedin.com' },
              ].map(({ label, url }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                  className="font-sans text-xs text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors flex items-center gap-1">
                  <ExternalLink size={10} /> {label}
                </a>
              ))}
              <a href="mailto:contato@karolmartins.jor.br"
                className="font-sans text-xs text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors flex items-center gap-1">
                <Mail size={10} /> Email
              </a>
            </div>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-500 mb-4">Categorias</h4>
            <nav className="flex flex-col gap-2">
              {[['politica','Política'],['cultura','Cultura'],['tecnologia','Tecnologia'],['sociedade','Sociedade']].map(([slug, name]) => (
                <Link key={slug} to={`/categorias/${slug}`}
                  className="font-sans text-sm text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors">
                  {name}
                </Link>
              ))}
              <Link to="/entrevistas"
                className="font-sans text-sm text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors">
                Entrevistas
              </Link>
              <Link to="/categorias/opiniao"
                className="font-sans text-sm text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors">
                Opinião
              </Link>
            </nav>
          </div>

          {/* Portfólio */}
          <div>
            <h4 className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-500 mb-4">Portfólio</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/sobre" className="font-sans text-sm text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors">Sobre</Link>
              <Link to="/clipping" className="font-sans text-sm text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors">Clipping</Link>
              <Link to="/press-kit" className="font-sans text-sm text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors">Press Kit</Link>
              <Link to="/contato" className="font-sans text-sm text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors">Contato</Link>
              <Link to="/busca" className="font-sans text-sm text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors">Buscar</Link>
            </nav>
          </div>

          {/* Publicado em */}
          <div>
            <h4 className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-500 mb-4">Publicado em</h4>
            <div className="flex flex-col gap-2">
              {OUTLETS.map(({ name, url }) => (
                <a key={name} href={url} target="_blank" rel="noopener noreferrer"
                  className="font-sans text-sm text-ink-600 dark:text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors flex items-center gap-1 group">
                  {name}
                  <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-ink-100 dark:border-ink-800 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="font-sans text-xs text-ink-400 dark:text-ink-600">
            © {new Date().getFullYear()} Karol Martins. Todos os direitos reservados.
          </p>
          <p className="font-sans text-xs text-ink-300 dark:text-ink-700">Jornalismo independente</p>
        </div>
      </div>
    </footer>
  )
}
