import { motion } from 'framer-motion'
import { Download, FileText, Image, User, ExternalLink } from 'lucide-react'

// ─────────────────────────────────────────────
// EDITE AQUI: conteúdo do press kit
// ─────────────────────────────────────────────

const PRESS_KIT = {
  // Bio curta para veículos usarem (até 2 linhas)
  shortBio: 'Karol Martins é jornalista, especializada em reportagens investigativas e entrevistas.',

  // Bio longa para matérias/perfis
  longBio: `Karol Martins é jornalista com atuação em reportagem, entrevistas e análise de conjuntura.

Em 2024, recebeu o 2º lugar no Prêmio Tim Lopes de Jornalismo Investigativo pela reportagem "Invisíveis do Asfalto", sobre a gestão da crise da cracolândia em São Paulo. Acredita que o jornalismo tem a função de iluminar o que o poder prefere manter no escuro.`,

  // Links para fotos de alta resolução (Google Drive, Dropbox, etc.)
  photos: [
    {
      label: 'Foto oficial — horizontal',
      description: 'JPG, fundo neutro',
      url: '/karol-martins.jpeg',
    },
    {
      label: 'Foto oficial — vertical',
      description: 'JPG, fundo neutro',
      url: '/karol-martins.jpeg',
    },
    {
      label: 'Foto de campo',
      description: 'JPG, reportagem externa',
      url: '#',
    },
  ],

  // Arquivos para download
  downloads: [
    {
      label: 'Currículo completo',
      description: 'PDF — atualizado em 2025',
      url: '#',
      icon: FileText,
    },
    {
      label: 'Press kit completo',
      description: 'PDF com bio, fotos e contato',
      url: '#',
      icon: FileText,
    },
  ],

  // Dados de contato para a imprensa
  pressContact: {
    email: 'contato@karolmartins.jor.br',
    note: 'Para entrevistas, credenciamentos e colaborações editoriais.',
  },

  // Veículos onde já foi publicada
  outlets: [
    { name: 'Agência Pública', url: 'https://apublica.org' },
    { name: 'Nexo Jornal', url: 'https://nexojornal.com.br' },
    { name: 'Ponte Jornalismo', url: 'https://ponte.org' },
    { name: 'Brasil de Fato', url: 'https://brasildefato.com.br' },
    { name: 'Jornal do Campus USP', url: 'https://jornaldocampus.usp.br' },
    { name: 'Rádio USP', url: 'https://radio.usp.br' },
  ],

  // Tópicos sobre os quais pode falar como fonte/entrevistada
  expertiseTopics: [
    'Segurança pública e sistema prisional',
    'Jornalismo investigativo e apuração de dados',
    'Representação política de minorias',
    'Cobertura de movimentos sociais',
    'Liberdade de imprensa no Brasil',
    'Jornalismo universitário',
  ],
}

// ─────────────────────────────────────────────

export default function PressKitPage() {
  return (
    <div className="pt-24 pb-24 max-w-6xl mx-auto px-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-16 pb-12 border-b border-ink-100 dark:border-ink-800"
      >
        <p className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-3">
          Para a imprensa
        </p>
        <h1 className="font-display text-5xl font-bold text-ink-950 dark:text-ink-50 mb-3">
          Press Kit
        </h1>
        <p className="font-body text-ink-500 dark:text-ink-400 max-w-xl">
          Materiais para jornalistas, editores e produtores. Bio, fotos em alta resolução, currículo e informações de contato prontos para publicação.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16">
        <div className="space-y-16">

          {/* Bio curta */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-5">
              Bio curta
            </p>
            <div className="border-l-2 border-accent-400 pl-6">
              <p className="font-body text-lg text-ink-700 dark:text-ink-300 leading-relaxed mb-3">
                {PRESS_KIT.shortBio}
              </p>
              <button
                onClick={() => navigator.clipboard.writeText(PRESS_KIT.shortBio)}
                className="font-sans text-xs text-accent-600 dark:text-accent-400 hover:underline"
              >
                Copiar texto
              </button>
            </div>
          </motion.section>

          {/* Bio longa */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-5">
              Bio completa
            </p>
            <div className="border-l-2 border-ink-200 dark:border-ink-700 pl-6">
              {PRESS_KIT.longBio.split('\n\n').map((p, i) => (
                <p key={i} className="font-body text-ink-700 dark:text-ink-300 leading-relaxed mb-4">
                  {p}
                </p>
              ))}
              <button
                onClick={() => navigator.clipboard.writeText(PRESS_KIT.longBio)}
                className="font-sans text-xs text-accent-600 dark:text-accent-400 hover:underline"
              >
                Copiar texto
              </button>
            </div>
          </motion.section>

          {/* Fotos */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-5">
              Fotos para imprensa
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PRESS_KIT.photos.map((photo, i) => (
                <a
                  key={i}
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border border-ink-100 dark:border-ink-800 hover:border-ink-400 dark:hover:border-ink-500 p-4 transition-colors block"
                >
                  <div className="aspect-square bg-ink-100 dark:bg-ink-800 flex items-center justify-center mb-3 group-hover:bg-ink-200 dark:group-hover:bg-ink-700 transition-colors">
                    <Image size={28} className="text-ink-300 dark:text-ink-600" />
                  </div>
                  <p className="font-sans text-sm font-medium text-ink-800 dark:text-ink-200 mb-1">
                    {photo.label}
                  </p>
                  <p className="font-sans text-xs text-ink-400 dark:text-ink-600">
                    {photo.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2 font-sans text-xs text-accent-600 dark:text-accent-400">
                    <Download size={11} /> Baixar
                  </div>
                </a>
              ))}
            </div>
          </motion.section>

          {/* Tópicos */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-5">
              Disponível para falar sobre
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESS_KIT.expertiseTopics.map(topic => (
                <span
                  key={topic}
                  className="font-sans text-sm text-ink-700 dark:text-ink-300 border border-ink-200 dark:border-ink-700 px-4 py-2"
                >
                  {topic}
                </span>
              ))}
            </div>
          </motion.section>

          {/* Publicado em */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-5">
              Publicado em
            </p>
            <div className="flex flex-wrap gap-3">
              {PRESS_KIT.outlets.map(({ name, url }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-sans text-sm text-ink-600 dark:text-ink-400 border border-ink-200 dark:border-ink-700 px-4 py-2 hover:border-ink-500 dark:hover:border-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors"
                >
                  {name} <ExternalLink size={11} />
                </a>
              ))}
            </div>
          </motion.section>

        </div>

        {/* Sidebar */}
        <aside className="space-y-5">

          {/* Downloads */}
          <div className="border border-ink-100 dark:border-ink-800 p-5">
            <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-4">
              Downloads
            </p>
            <div className="flex flex-col gap-3">
              {PRESS_KIT.downloads.map(({ label, description, url, icon: Icon }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 p-3 border border-ink-100 dark:border-ink-800 hover:border-ink-400 dark:hover:border-ink-500 transition-colors"
                >
                  <Icon size={16} className="text-ink-400 group-hover:text-accent-500 transition-colors mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-sans text-sm font-medium text-ink-800 dark:text-ink-200">
                      {label}
                    </p>
                    <p className="font-sans text-xs text-ink-400 dark:text-ink-600">{description}</p>
                  </div>
                  <Download size={13} className="ml-auto text-ink-300 dark:text-ink-700 group-hover:text-accent-500 transition-colors flex-shrink-0 mt-0.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Contato imprensa */}
          <div className="bg-ink-950 dark:bg-ink-900 p-5">
            <div className="flex items-start gap-3">
              <User size={16} className="text-ink-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-sans text-xs uppercase tracking-widest text-ink-500 mb-2">
                  Contato para imprensa
                </p>
                <a
                  href={`mailto:${PRESS_KIT.pressContact.email}`}
                  className="font-sans text-sm text-ink-100 hover:text-accent-400 transition-colors block mb-2"
                >
                  {PRESS_KIT.pressContact.email}
                </a>
                <p className="font-sans text-xs text-ink-500 leading-relaxed">
                  {PRESS_KIT.pressContact.note}
                </p>
              </div>
            </div>
          </div>

          {/* Usage rights */}
          <div className="border border-ink-100 dark:border-ink-800 p-5">
            <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-3">
              Uso dos materiais
            </p>
            <p className="font-sans text-xs text-ink-500 dark:text-ink-400 leading-relaxed">
              Todos os materiais desta página podem ser usados livremente por veículos jornalísticos para fins editoriais, com crédito à Karol Martins.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
