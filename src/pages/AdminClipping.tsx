import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Trash2, Save, Loader, Star } from 'lucide-react'

const INPUT = "w-full font-sans text-sm bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl px-4 py-2.5 text-ink-900 dark:text-ink-100 focus:outline-none focus:border-accent-500 transition-colors"
const EMPTY = { title: '', outlet: '', outlet_url: '', url: '', date: '', format: 'texto', description: '', highlight: false }

export default function AdminClipping() {
  const [clips, setClips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('clipping').select('*').order('sort_order').order('created_at', { ascending: false })
      .then(({ data }) => { if (data) setClips(data); setLoading(false) })
  }, [])

  const add = () => setClips(c => [{ ...EMPTY, id: 'new-' + Date.now() }, ...c])
  const update = (id: string, key: string, val: any) =>
    setClips(c => c.map(clip => clip.id === id ? { ...clip, [key]: val } : clip))
  const remove = async (id: string) => {
    if (!id.startsWith('new-')) await supabase.from('clipping').delete().eq('id', id)
    setClips(c => c.filter(clip => clip.id !== id))
  }
  const save = async (clip: any) => {
    setSaving(clip.id)
    if (clip.id.startsWith('new-')) {
      const { id, ...data } = clip
      const { data: inserted } = await supabase.from('clipping').insert([data]).select().single()
      if (inserted) setClips(c => c.map(cl => cl.id === clip.id ? inserted : cl))
    } else {
      await supabase.from('clipping').update(clip).eq('id', clip.id)
    }
    setSaving(null)
  }

  if (loading) return (
    <div className="flex justify-center pt-20">
      <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-sans text-2xl font-bold text-ink-950 dark:text-ink-50">Clipping</h1>
        <button onClick={add} className="flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-sans text-sm px-5 py-2.5 rounded-2xl transition-colors">
          <Plus size={14} /> Adicionar
        </button>
      </div>

      {clips.length === 0 && (
        <div className="py-20 text-center border-2 border-dashed border-ink-200 dark:border-ink-700 rounded-3xl">
          <p className="font-sans text-sm text-ink-400">Nenhuma publicação ainda. Clique em Adicionar.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {clips.map(clip => (
          <div key={clip.id} className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-3xl p-6">
            <div className="flex flex-col gap-3">
              <input value={clip.title} onChange={e => update(clip.id, 'title', e.target.value)} className={INPUT} placeholder="Título da matéria" />

              <div className="grid grid-cols-2 gap-3">
                <input value={clip.outlet} onChange={e => update(clip.id, 'outlet', e.target.value)} className={INPUT} placeholder="Veículo (ex: Folha de SP)" />
                <input value={clip.outlet_url} onChange={e => update(clip.id, 'outlet_url', e.target.value)} className={INPUT} placeholder="URL do veículo" />
              </div>

              <input value={clip.url} onChange={e => update(clip.id, 'url', e.target.value)} className={INPUT} placeholder="Link da matéria (URL completa)" />

              <div className="grid grid-cols-2 gap-3">
                <input value={clip.date} onChange={e => update(clip.id, 'date', e.target.value)} className={INPUT} placeholder="Data (ex: março 2024)" />
                <select value={clip.format} onChange={e => update(clip.id, 'format', e.target.value)} className={INPUT + ' cursor-pointer'}>
                  <option value="texto">Texto</option>
                  <option value="entrevista">Entrevista</option>
                  <option value="investigativo">Investigativo</option>
                  <option value="foto">Fotorreportagem</option>
                  <option value="audio">Áudio / Rádio</option>
                </select>
              </div>

              <textarea value={clip.description} onChange={e => update(clip.id, 'description', e.target.value)} className={INPUT + ' resize-none'} rows={2} placeholder="Descrição curta (opcional)" />

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={clip.highlight} onChange={e => update(clip.id, 'highlight', e.target.checked)} className="w-4 h-4 accent-accent-500 rounded" />
                  <Star size={13} className={clip.highlight ? 'text-accent-500' : 'text-ink-400'} />
                  <span className="font-sans text-xs text-ink-500">Destacar na página</span>
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => remove(clip.id)} className="flex items-center gap-1.5 font-sans text-xs text-ink-400 hover:text-red-500 transition-colors px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 size={13} /> Remover
                  </button>
                  <button onClick={() => save(clip)} disabled={saving === clip.id} className="flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-sans text-sm px-4 py-2 rounded-2xl transition-colors disabled:opacity-50">
                    {saving === clip.id ? <Loader size={12} className="animate-spin" /> : <Save size={12} />}
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
