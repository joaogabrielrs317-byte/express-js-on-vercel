import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ExternalLink, BookOpen, PenTool, Mic, FileText, GraduationCap, Briefcase, Award, Download, MapPin } from 'lucide-react'
import Newsletter from '../components/common/Newsletter'
import { supabase } from '../lib/supabase'

function SectionLabel({ children }: { children: string }) {
  return <p className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-8">{children}</p>
}

function TimelineItem({ title, subtitle, period, description, last = false }: { title: string; subtitle: string; period: string; description?: string; last?: boolean }) {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-accent-500 flex-shrink-0 mt-1.5" />
        {!last && <div className="w-px flex-1 bg-ink-100 dark:bg-ink-800 mt-2" />}
      </div>
      <div className="pb-10">
        <div className="flex flex-wrap items-baseline gap-3 mb-1">
          <h3 className="font-sans text-sm font-semibold text-ink-950 dark:text-ink-50">{title}</h3>
          <span className="font-sans text-xs text-accent-600 dark:text-accent-400">{subtitle}</span>
        </div>
        <p className="font-sans text-xs text-ink-400 dark:text-ink-600 mb-2">{period}</p>
        {description && <p className="font-body text-sm text-ink-600 dark:text-ink-400 leading-relaxed">{description}</p>}
      </div>
    </div>
  )
}

export default function AboutPage() {
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    supabase.from('profile').select('*').single().then(({ data }) => {
      if (data) setProfile(data)
    })
  }, [])

  if (!profile) return (
    <div className="pt-40 flex justify-center">
      <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const areas = profile.areas || []
  const experience = profile.experience || []
  const education = profile.education || []
  const awards = profile.awards || []
  const skills = profile.skills || []
  const socials = [
    profile.twitter && { label: 'Twitter', url: profile.twitter },
    profile.instagram && { label: 'Instagram', url: profile.instagram },
    profile.linkedin && { label: 'LinkedIn', url: profile.linkedin },
  ].filter(Boolean)

  const areaIcons = [BookOpen, PenTool, Mic, FileText]

  return (
    <>
      <div className="pt-24 max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-20 pb-16 border-b border-ink-100 dark:border-ink-800">
          <p className="font-sans text-xs uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-8">Sobre</p>

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-start">
            <div className="flex flex-col gap-4">
              <div className="aspect-[4/5] bg-ink-100 dark:bg-ink-800 overflow-hidden">
                {profile.photo_url
                  ? <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover object-top" />
                  : <div className="w-full h-full flex items-center justify-center text-ink-400">Sem foto</div>
                }
              </div>

              <div className="flex flex-col gap-2">
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-2 font-sans text-sm text-ink-600 dark:text-ink-400 hover:text-accent-600 transition-colors">
                    <Mail size={14} /> {profile.email}
                  </a>
                )}
                {profile.location && (
                  <span className="flex items-center gap-2 font-sans text-sm text-ink-500">
                    <MapPin size={14} /> {profile.location}
                  </span>
                )}
                <div className="flex gap-3 mt-1">
                  {socials.map((s: any) => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-sans text-xs text-ink-400 hover:text-ink-950 dark:hover:text-ink-50 transition-colors">
                      <ExternalLink size={11} /> {s.label}
                    </a>
                  ))}
                </div>
              </div>

              {profile.curriculum_url && (
                <a href={profile.curriculum_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 font-sans text-xs uppercase tracking-widest border border-ink-950 dark:border-ink-100 text-ink-950 dark:text-ink-50 px-4 py-3 hover:bg-ink-950 hover:text-ink-50 transition-colors mt-2">
                  <Download size={13} /> Baixar currículo
                </a>
              )}
            </div>

            <div>
              <h1 className="font-display text-5xl font-bold text-ink-950 dark:text-ink-50 leading-tight mb-2">{profile.name}</h1>
              <p className="font-sans text-sm uppercase tracking-widest text-accent-600 dark:text-accent-400 mb-8">{profile.role}</p>

              <div className="flex flex-col gap-4 mb-10">
                {(profile.bio || '').split('\n').filter(Boolean).map((p: string, i: number) => (
                  <p key={i} className="font-body text-lg text-ink-600 dark:text-ink-400 leading-relaxed">{p}</p>
                ))}
              </div>

              {areas.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {areas.map((area: any, i: number) => {
                    const Icon = areaIcons[i % areaIcons.length]
                    return (
                      <div key={i} className="flex gap-3 p-4 border border-ink-100 dark:border-ink-800 hover:border-ink-300 transition-colors">
                        <Icon size={16} className="text-accent-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-sans text-sm font-medium text-ink-900 dark:text-ink-100">{area.label}</p>
                          <p className="font-sans text-xs text-ink-500 mt-0.5">{area.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {experience.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
              <div><SectionLabel>Experiência</SectionLabel><Briefcase size={20} className="text-ink-300 dark:text-ink-700" /></div>
              <div>
                {experience.map((item: any, i: number) => (
                  <TimelineItem key={i} title={item.role} subtitle={item.company} period={item.period} description={item.description} last={i === experience.length - 1} />
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {education.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
              <div><SectionLabel>Formação</SectionLabel><GraduationCap size={20} className="text-ink-300 dark:text-ink-700" /></div>
              <div>
                {education.map((item: any, i: number) => (
                  <TimelineItem key={i} title={item.degree} subtitle={item.institution} period={item.period} description={item.description} last={i === education.length - 1} />
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {awards.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
              <div><SectionLabel>Prêmios</SectionLabel><Award size={20} className="text-ink-300 dark:text-ink-700" /></div>
              <div className="flex flex-col gap-5">
                {awards.map((award: any, i: number) => (
                  <div key={i} className="border-l-2 border-accent-400 pl-5">
                    <div className="flex items-baseline gap-3 mb-1">
                      <h3 className="font-sans text-sm font-medium text-ink-900 dark:text-ink-100">{award.title}</h3>
                      <span className="font-sans text-xs text-ink-400 flex-shrink-0">{award.year}</span>
                    </div>
                    {award.desc && <p className="font-body text-sm text-ink-500">{award.desc}</p>}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {skills.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mb-20 pb-20 border-b border-ink-100 dark:border-ink-800">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
              <div><SectionLabel>Habilidades</SectionLabel></div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <span key={skill} className="font-sans text-sm text-ink-700 dark:text-ink-300 bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 px-4 py-2">{skill}</span>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </div>
      <Newsletter />
    </>
  )
}
