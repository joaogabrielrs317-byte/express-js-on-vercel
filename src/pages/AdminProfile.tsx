import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Trash2, Save, Upload, Loader } from 'lucide-react'

const INPUT = "w-full font-sans text-sm bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl px-4 py-2.5 text-ink-900 dark:text-ink-100 focus:outline-none focus:border-accent-500 transition-colors"
const BTN_SM = "flex items-center gap-1.5 font-sans text-xs px-3 py-2 rounded-2xl border border-ink-200 dark:border-ink-700 hover:border-accent-500 hover:text-accent-600 transition-colors text-ink-600 dark:text-ink-400"
const CARD = "bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-3xl p-6 mb-5"

export default function AdminProfile() {
  const [profile, setProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.from('profile').select('*').single().then(({ data }) => { if (data) setProfile(data) })
  }, [])

  const save = async () => {
    setSaving(true)
    await supabase.from('profile').update({ ...profile, updated_at: new Date().toISOString() }).eq('id', profile.id)
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `profile/karol-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      setProfile((p: any) => ({ ...p, photo_url: data.publicUrl }))
    }
    setUploading(false)
  }

  const addItem = (field: string, item: any) => setProfile((p: any) => ({ ...p, [field]: [...(p[field] || []), item] }))
  const removeItem = (field: string, i: number) => setProfile((p: any) => ({ ...p, [field]: p[field].filter((_: any, j: number) => j !== i) }))
  const updateItem = (field: string, i: number, key: string, val: string) => setProfile((p: any) => {
    const arr = [...p[field]]; arr[i] = { ...arr[i], [key]: val }; return { ...p, [field]: arr }
  })

  if (!profile) return (
    <div className="flex justify-center pt-20">
      <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-sans text-2xl font-bold text-ink-950 dark:text-ink-50">Editar Perfil</h1>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-sans text-sm px-5 py-2.5 rounded-2xl transition-colors disabled:opacity-50">
          {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
          {saved ? 'Salvo! ✓' : 'Salvar tudo'}
        </button>
      </div>

      {/* Foto */}
      <div className={CARD}>
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-5">Foto</p>
        <div className="flex items-start gap-6">
          <div className="w-28 h-36 bg-ink-100 dark:bg-ink-800 rounded-2xl overflow-hidden flex-shrink-0">
            {profile.photo_url && <img src={profile.photo_url} className="w-full h-full object-cover object-top" />}
          </div>
          <div className="flex flex-col gap-3 flex-1">
            <input value={profile.photo_url || ''} onChange={e => setProfile((p: any) => ({ ...p, photo_url: e.target.value }))} className={INPUT} placeholder="URL da foto" />
            <p className="font-sans text-xs text-ink-400">ou</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className={BTN_SM}>
              {uploading ? <Loader size={12} className="animate-spin" /> : <Upload size={12} />}
              {uploading ? 'Enviando...' : 'Fazer upload de nova foto'}
            </button>
          </div>
        </div>
      </div>

      {/* Info básica */}
      <div className={CARD}>
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-5">Informações básicas</p>
        <div className="flex flex-col gap-3">
          <input value={profile.name || ''} onChange={e => setProfile((p: any) => ({ ...p, name: e.target.value }))} className={INPUT} placeholder="Nome completo" />
          <input value={profile.role || ''} onChange={e => setProfile((p: any) => ({ ...p, role: e.target.value }))} className={INPUT} placeholder="Cargo / título" />
          <input value={profile.location || ''} onChange={e => setProfile((p: any) => ({ ...p, location: e.target.value }))} className={INPUT} placeholder="Localização (ex: São Paulo, SP)" />
          <input value={profile.email || ''} onChange={e => setProfile((p: any) => ({ ...p, email: e.target.value }))} className={INPUT} placeholder="E-mail de contato" />
          <textarea value={profile.bio || ''} onChange={e => setProfile((p: any) => ({ ...p, bio: e.target.value }))} className={INPUT + ' resize-none'} rows={4} placeholder="Biografia" />
          <input value={profile.curriculum_url || ''} onChange={e => setProfile((p: any) => ({ ...p, curriculum_url: e.target.value }))} className={INPUT} placeholder="Link do currículo (PDF)" />
        </div>
      </div>

      {/* Redes sociais */}
      <div className={CARD}>
        <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400 mb-5">Redes sociais</p>
        <div className="flex flex-col gap-3">
          <input value={profile.twitter || ''} onChange={e => setProfile((p: any) => ({ ...p, twitter: e.target.value }))} className={INPUT} placeholder="Twitter (URL completa)" />
          <input value={profile.instagram || ''} onChange={e => setProfile((p: any) => ({ ...p, instagram: e.target.value }))} className={INPUT} placeholder="Instagram (URL completa)" />
          <input value={profile.linkedin || ''} onChange={e => setProfile((p: any) => ({ ...p, linkedin: e.target.value }))} className={INPUT} placeholder="LinkedIn (URL completa)" />
        </div>
      </div>

      {/* Áreas */}
      <div className={CARD}>
        <div className="flex items-center justify-between mb-5">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400">Áreas de atuação</p>
          <button onClick={() => addItem('areas', { label: '', desc: '' })} className={BTN_SM}><Plus size={12} /> Adicionar</button>
        </div>
        <div className="flex flex-col gap-3">
          {(profile.areas || []).map((a: any, i: number) => (
            <div key={i} className="flex gap-2 items-start bg-ink-50 dark:bg-ink-800/50 rounded-2xl p-4">
              <div className="flex-1 flex flex-col gap-2">
                <input value={a.label} onChange={e => updateItem('areas', i, 'label', e.target.value)} className={INPUT} placeholder="Título (ex: Entrevistas)" />
                <input value={a.desc} onChange={e => updateItem('areas', i, 'desc', e.target.value)} className={INPUT} placeholder="Descrição curta" />
              </div>
              <button onClick={() => removeItem('areas', i)} className="text-ink-400 hover:text-red-500 mt-2 p-1.5 rounded-xl transition-colors"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Experiência */}
      <div className={CARD}>
        <div className="flex items-center justify-between mb-5">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400">Experiência</p>
          <button onClick={() => addItem('experience', { role: '', company: '', period: '', description: '' })} className={BTN_SM}><Plus size={12} /> Adicionar</button>
        </div>
        <div className="flex flex-col gap-4">
          {(profile.experience || []).map((e: any, i: number) => (
            <div key={i} className="flex gap-2 items-start bg-ink-50 dark:bg-ink-800/50 rounded-2xl p-4">
              <div className="flex-1 flex flex-col gap-2">
                <input value={e.role} onChange={ev => updateItem('experience', i, 'role', ev.target.value)} className={INPUT} placeholder="Cargo / função" />
                <input value={e.company} onChange={ev => updateItem('experience', i, 'company', ev.target.value)} className={INPUT} placeholder="Empresa / veículo" />
                <input value={e.period} onChange={ev => updateItem('experience', i, 'period', ev.target.value)} className={INPUT} placeholder="Período (ex: Mar 2024 — presente)" />
                <textarea value={e.description} onChange={ev => updateItem('experience', i, 'description', ev.target.value)} className={INPUT + ' resize-none'} rows={2} placeholder="Descrição" />
              </div>
              <button onClick={() => removeItem('experience', i)} className="text-ink-400 hover:text-red-500 p-1.5 rounded-xl transition-colors"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Formação */}
      <div className={CARD}>
        <div className="flex items-center justify-between mb-5">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400">Formação</p>
          <button onClick={() => addItem('education', { degree: '', institution: '', period: '', description: '' })} className={BTN_SM}><Plus size={12} /> Adicionar</button>
        </div>
        <div className="flex flex-col gap-4">
          {(profile.education || []).map((e: any, i: number) => (
            <div key={i} className="flex gap-2 items-start bg-ink-50 dark:bg-ink-800/50 rounded-2xl p-4">
              <div className="flex-1 flex flex-col gap-2">
                <input value={e.degree} onChange={ev => updateItem('education', i, 'degree', ev.target.value)} className={INPUT} placeholder="Curso / grau" />
                <input value={e.institution} onChange={ev => updateItem('education', i, 'institution', ev.target.value)} className={INPUT} placeholder="Instituição" />
                <input value={e.period} onChange={ev => updateItem('education', i, 'period', ev.target.value)} className={INPUT} placeholder="Período (ex: 2021 — 2024)" />
                <textarea value={e.description} onChange={ev => updateItem('education', i, 'description', ev.target.value)} className={INPUT + ' resize-none'} rows={2} placeholder="Descrição" />
              </div>
              <button onClick={() => removeItem('education', i)} className="text-ink-400 hover:text-red-500 p-1.5 rounded-xl transition-colors"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Prêmios */}
      <div className={CARD}>
        <div className="flex items-center justify-between mb-5">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400">Prêmios & reconhecimentos</p>
          <button onClick={() => addItem('awards', { title: '', year: '', desc: '' })} className={BTN_SM}><Plus size={12} /> Adicionar</button>
        </div>
        <div className="flex flex-col gap-4">
          {(profile.awards || []).map((a: any, i: number) => (
            <div key={i} className="flex gap-2 items-start bg-ink-50 dark:bg-ink-800/50 rounded-2xl p-4">
              <div className="flex-1 flex flex-col gap-2">
                <input value={a.title} onChange={e => updateItem('awards', i, 'title', e.target.value)} className={INPUT} placeholder="Nome do prêmio" />
                <input value={a.year} onChange={e => updateItem('awards', i, 'year', e.target.value)} className={INPUT} placeholder="Ano" />
                <input value={a.desc} onChange={e => updateItem('awards', i, 'desc', e.target.value)} className={INPUT} placeholder="Descrição" />
              </div>
              <button onClick={() => removeItem('awards', i)} className="text-ink-400 hover:text-red-500 p-1.5 rounded-xl transition-colors"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Habilidades */}
      <div className={CARD}>
        <div className="flex items-center justify-between mb-5">
          <p className="font-sans text-xs font-semibold uppercase tracking-widest text-ink-400">Habilidades</p>
          <button onClick={() => setProfile((p: any) => ({ ...p, skills: [...(p.skills || []), ''] }))} className={BTN_SM}><Plus size={12} /> Adicionar</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(profile.skills || []).map((s: string, i: number) => (
            <div key={i} className="flex items-center gap-1">
              <input value={s} onChange={e => { const arr = [...profile.skills]; arr[i] = e.target.value; setProfile((p: any) => ({ ...p, skills: arr })) }} className="font-sans text-sm border border-ink-200 dark:border-ink-700 rounded-2xl px-3 py-1.5 bg-ink-50 dark:bg-ink-800 text-ink-900 dark:text-ink-100 focus:outline-none focus:border-accent-500 w-36 transition-colors" placeholder="Habilidade" />
              <button onClick={() => removeItem('skills', i)} className="text-ink-400 hover:text-red-500 p-1 rounded-xl transition-colors"><Trash2 size={12} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-2 pb-8">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-sans text-sm px-6 py-3 rounded-2xl transition-colors disabled:opacity-50">
          {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
          {saved ? 'Salvo! ✓' : 'Salvar tudo'}
        </button>
      </div>
    </div>
  )
}
