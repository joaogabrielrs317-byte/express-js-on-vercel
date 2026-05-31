import { useState } from 'react'
import { Trash2, Plus, Loader } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { categoriesService } from '../services'
import { slugify } from '../utils'

const INPUT = "w-full font-sans text-sm bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-2xl px-4 py-2.5 text-ink-900 dark:text-ink-100 focus:outline-none focus:border-accent-500 transition-colors"

export default function AdminCategories() {
  const { categories, loading, reload } = useCategories()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true); setError('')
    try {
      await categoriesService.create({ name: name.trim(), slug: slugify(name), description })
      setName(''); setDescription(''); reload()
    } catch (e: any) {
      setError(e.message || 'Erro ao criar categoria.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir categoria "${name}"?`)) return
    await categoriesService.delete(id); reload()
  }

  return (
    <div>
      <h1 className="font-sans text-2xl font-bold text-ink-950 dark:text-ink-50 mb-8">Categorias</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-3xl p-6">
          <h2 className="font-sans text-sm font-semibold text-ink-700 dark:text-ink-300 mb-5">Nova categoria</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-1.5 block">Nome</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Ex: Política" className={INPUT} />
              {name && <p className="font-sans text-xs text-ink-400 mt-1.5 pl-1">Slug: {slugify(name)}</p>}
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-1.5 block">Descrição (opcional)</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Breve descrição" className={INPUT} />
            </div>
            {error && <p className="font-sans text-xs text-red-600 dark:text-red-400">{error}</p>}
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-sans text-sm px-5 py-2.5 rounded-2xl transition-colors disabled:opacity-60">
              {saving ? <Loader size={13} className="animate-spin" /> : <Plus size={13} />}
              Criar categoria
            </button>
          </form>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-ink-100 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-950/30">
            <h2 className="font-sans text-sm font-semibold text-ink-700 dark:text-ink-300">
              Existentes ({categories.length})
            </h2>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10 w-full rounded-2xl" />)}</div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center"><p className="font-sans text-sm text-ink-400">Nenhuma categoria ainda.</p></div>
          ) : categories.map((cat, i) => (
            <div key={cat.id} className={`flex items-center justify-between px-6 py-3.5 hover:bg-ink-50 dark:hover:bg-ink-800/30 transition-colors ${i !== 0 ? 'border-t border-ink-50 dark:border-ink-800' : ''}`}>
              <div>
                <p className="font-sans text-sm text-ink-800 dark:text-ink-200">{cat.name}</p>
                <p className="font-sans text-xs text-ink-400 dark:text-ink-600">/categorias/{cat.slug}</p>
              </div>
              <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 text-ink-300 hover:text-red-500 transition-colors rounded-xl" title="Excluir">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
