import { motion } from 'framer-motion'
import {
  Mail, ExternalLink, BookOpen, PenTool, Mic, FileText,
  GraduationCap, Briefcase, Award, Download, MapPin, User
} from 'lucide-react'
import Newsletter from '../components/common/Newsletter'

// ─────────────────────────────────────────────
// EDITE AQUI: dados da jornalista
// ─────────────────────────────────────────────

const AUTHOR = {
  name: 'Karol Martins',
  role: 'Jornalista & Estudante de Comunicação',
  location: 'São Paulo, SP',
  email: 'contato@karolmartins.jor.br',
  bio: [
    'Jornalista apaixonada por contar histórias que importam. Especializada em entrevistas, reportagem investigativa e análise de conjuntura.',
    'Este portfólio reúne meu trabalho e minha trajetória no jornalismo.',
  ],
  // Coloque aqui a URL da sua foto (pode ser link do Google Drive, Imgur, etc.)
  // ou deixe vazio para exibir o placeholder
  photo: '/karol-martins.jpeg',
  // Link para o currículo em PDF (Google Drive, Dropbox, etc.)
  // Deixe vazio para ocultar o botão
  curriculum: '',
  socials: [
    { label: 'Twitter', url: 'https://twitter.com' },
    { label: 'Instagram', url: 'https://instagram.com' },
    { label: 'LinkedIn', url: 'https://linkedin.com' },
  ],
}

const EDUCATION = [
  {
    degree: 'Bacharelado em Jornalismo',
    institution: 'Universidade de São Paulo (USP)',
    period: '2021 — presente',
    description: 'Foco em jornalismo investigativo e análise política. TCC sobre cobertura midiática das eleições de 2022.',
  },
  {
    degree: 'Curso de Fotojornalismo',
    institution: 'Instituto Moreira Salles',
    period: '2023',
    description: 'Formação em narrativa visual e cobertura de campo.',
  },
  {
    degree: 'Inglês Avançado',
    institution: 'CNA — Certificado Cambridge B2',
    period: '2020',
    description: '',
  },
]

const EXPERIENCE = [
  {
    role: 'Estagiária de Jornalismo',
    company: 'Agência Pública',
    period: 'Mar 2024 — presente',
    description: 'Apuração e redação de reportagens investigativas sobre direitos humanos e políticas públicas. Apoio na produção de dados e infográficos.',
  },
  {
    role: 'Repórter Freelance',
    company: 'Ponte Jornalismo',
    period: 'Jun 2023 — Fev 2024',
    description: 'Cobertura de segurança pública e sistema penitenciário para o veículo independente.',
  },
  {
    role: 'Monitora de Redação',
    company: 'Jornal do Campus — USP',
    period: '2022 — 2023',
    description: 'Orientação de calouras na produção de pautas e edição de textos para o jornal universitário.',
  },
]

const AWARDS = [
  {
    title: '2º lugar — Prêmio Tim Lopes de Jornalismo Investigativo',
    year: '2024',
    desc: 'Categoria universitária, pela reportagem "Invisíveis do Asfalto".',
  },
  {
    title: 'Menção honrosa — Prêmio Vladimir Herzog',
    year: '2023',
    desc: 'Pela cobertura da situação carcerária no estado de São Paulo.',
  },
]

const SKILLS = [
  'Reportagem investigativa',
  'Jornalismo de dados',
  'Fotografia',
  'Edição de vídeo',
  'Google Data Studio',
  'Flourish',
  'Adobe Premiere',
  'Inglês avançado',
  'Espanhol intermediário',
]

const AREAS = [
  { icon: BookOpen, label: 'Jornalismo Político', desc: 'Cobertura de poder, eleições e políticas públicas' },
  { icon: PenTool, label: 'Análise Cultural', desc: 'Reflexões sobre arte, cinema e sociedade' },
  { icon: Mic, label: 'Entrevistas', desc: 'Conversas com pessoas que constroem o Brasil' },
  { icon: FileText, label: 'Jornalismo Investigativo', desc: 'Apuração rigorosa de interesse público' },
]

// ─────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-8">
      {children}
    </p>
  )
}

function TimelineItem({
  title, subtitle, period, description, last = false,
}: {
  title: string
  subtitle: string
  period: string
  description?: string
  last?: boolean
}) {
  return (
    <div className="flex gap-6">
      {/* Line */}
      <div className="flex flex-col items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-accent-500 flex-shrink-0 mt-1.5" />
        {!last && <div className="w-px flex-1 bg-ink-100 dark:bg-ink-800 mt-2 mb-0" />}
      </div>
      {/* Content */}
      <div className={`pb-10 ${last ? '' : ''}`}>
        <div className="flex flex-wrap items-baseline gap-3 mb-1">
          <h3 className="font-sans text-sm font-semibold text-ink-950 dark:text-ink-50">{title}</h3>
          <span className="font-sans text-xs text-accent-600 dark:text-accent-400">{subtitle}</span>
        </div>
        <p className="font-sans text-xs text-ink-400 dark:text-ink-600 mb-2">{period}</p>
        {description && (
          <p className="font-body text-sm text-ink-600 dark:text-ink-400 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <>
      <div className="pt-24 max-w-6xl mx-auto px-6">

        {/* ── Hero: foto + apresentação ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-20 pb-16 border-b border-ink-100 dark:border-ink-800"
        >
          <p className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-8">
            Sobre
          </p>

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-start">

            {/* Foto */}
            <div className="flex flex-col gap-4">
              <div className="aspect-[4/5] bg-ink-100 dark:bg-ink-800 overflow-hidden relative group">
                {AUTHOR.photo ? (
                  <img
                    src={AUTHOR.photo}
                    alt={AUTHOR.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-ink-300 dark:text-ink-600">
                    <User size={48} strokeWidth={1} />
                    <p className="font-sans text-xs text-center px-4 leading-relaxed">
                      Adicione a URL da sua foto em{' '}
                      <code className="font-mono text-accent-500">AboutPage.tsx</code>
                      {' '}no campo{' '}
                      <code className="font-mono text-accent-500">photo</code>
                    </p>
                  </div>
                )}
              </div>

              {/* Contato rápido */}
              <div className="flex flex-col gap-2">
                <a
                  href={`mailto:${AUTHOR.email}`}
                  className="flex items-center gap-2 font-sans text-sm text-ink-600 dark:text-ink-400 hover:text-accent-600 dark:hover:text-accent-400 transition-colors"
                >
                  <Mail size={14} /> {AUTHOR.email}
                </a>
                <span className="flex items-center gap-2 font-sans text-sm text-ink-500 dark:text-ink-500">
                  <MapPin size={14} /> {AUTHOR.location}
                </span>
                <div className="flex gap-3 mt-1">
                  {AUTHOR.socials.map(({ label, url }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-sans text-xs text-ink-400 dark:text-ink-600 hover:text-ink-950 dark:hover:text-ink-50 transition-colors"
                    >
                      <ExternalLink size={11} /> {label}
                    </a>
                  ))}
                </div>
              </div>

              {/* Download currículo */}
              {AUTHOR.curriculum && (
                <a
                  href={AUTHOR.curriculum}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-widest border border-ink-950 dark:border-ink-100 text-ink-950 dark:text-ink-50 px-4 py-3 hover:bg-ink-950 hover:text-ink-50 dark:hover:bg-ink-100 dark:hover:text-ink-950 transition-colors mt-2"
                >
                  <Download size={13} />
                  Baixar currículo
                </a>
              )}

              {!AUTHOR.curriculum && (
                <div className="border border-dashed border-ink-200 dark:border-ink-700 px-4 py-3 text-center">
                  <p className="font-sans text-xs text-ink-400 dark:text-ink-600 leading-relaxed">
                    Adicione o link do PDF do currículo no campo{' '}
                    <code className="font-mono text-accent-500">curriculum</code>
                  </p>
                </div>
              )}
            </div>

            {/* Texto */}
            <div>
              <h1 className="font-display text-5xl font-bold text-ink-950 dark:text-ink-50 leading-tight mb-2">
                {AUTHOR.name}
              </h1>
              <p className="font-sans text-sm uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-8">
                {AUTHOR.role}
              </p>

              <div className="flex flex-col gap-4 mb-10">
                {AUTHOR.bio.map((p, i) => (
                  <p key={i} className="font-body text-lg text-ink-600 dark:text-ink-400 leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>

              {/* Áreas de interesse */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AREAS.map(({ icon: Icon, label, desc }) => (
                  <div
                    key={label}
                    className="flex gap-3 p-4 border border-ink-100 dark:border-ink-800 hover:border-ink-300 dark:hover:border-ink-600 transition-colors"
                  >
                    <Icon size={16} className="text-accent-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-sans text-sm font-medium text-ink-900 dark:text-ink-100">{label}</p>
                      <p className="font-sans text-xs text-ink-500 dark:text-ink-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Experiência ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            <div>
              <SectionLabel>Experiência</SectionLabel>
              <Briefcase size={20} className="text-ink-300 dark:text-ink-700" />
            </div>
            <div>
              {EXPERIENCE.map((item, i) => (
                <TimelineItem
                  key={i}
                  title={item.role}
                  subtitle={item.company}
                  period={item.period}
                  description={item.description}
                  last={i === EXPERIENCE.length - 1}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Formação ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            <div>
              <SectionLabel>Formação</SectionLabel>
              <GraduationCap size={20} className="text-ink-300 dark:text-ink-700" />
            </div>
            <div>
              {EDUCATION.map((item, i) => (
                <TimelineItem
                  key={i}
                  title={item.degree}
                  subtitle={item.institution}
                  period={item.period}
                  description={item.description}
                  last={i === EDUCATION.length - 1}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Prêmios ── */}
        {AWARDS.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-20"
          >
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
              <div>
                <SectionLabel>Prêmios</SectionLabel>
                <Award size={20} className="text-ink-300 dark:text-ink-700" />
              </div>
              <div className="flex flex-col gap-5">
                {AWARDS.map((award, i) => (
                  <div key={i} className="border-l-2 border-accent-400 pl-5">
                    <div className="flex items-baseline gap-3 mb-1">
                      <h3 className="font-sans text-sm font-medium text-ink-900 dark:text-ink-100">
                        {award.title}
                      </h3>
                      <span className="font-sans text-xs text-ink-400 dark:text-ink-600 flex-shrink-0">
                        {award.year}
                      </span>
                    </div>
                    {award.desc && (
                      <p className="font-body text-sm text-ink-500 dark:text-ink-400">{award.desc}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* ── Habilidades ── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-20 pb-20 border-b border-ink-100 dark:border-ink-800"
        >
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
            <div>
              <SectionLabel>Habilidades</SectionLabel>
            </div>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(skill => (
                <span
                  key={skill}
                  className="font-sans text-sm text-ink-700 dark:text-ink-300 bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 px-4 py-2"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </motion.section>

      </div>
      <Newsletter />
    </>
  )
}
