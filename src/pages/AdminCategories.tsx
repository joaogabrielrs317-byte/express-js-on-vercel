import { useState } from 'react'
import { Trash2, Plus, Loader } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { categoriesService } from '../services'
import { slugify } from '../utils'

export default function AdminCategories() {
  const { categories, loading, reload } = useCategories()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      await categoriesService.create({ name: name.trim(), slug: slugify(name), description })
      setName('')
      setDescription('')
      reload()
    } catch (e: any) {
      setError(e.message || 'Erro ao criar categoria.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir categoria "${name}"?`)) return
    await categoriesService.delete(id)
    reload()
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-950 dark:text-ink-50 mb-8">
        Categorias
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800 p-6">
          <h2 className="font-sans text-sm font-medium text-ink-700 dark:text-ink-300 mb-4">
            Nova categoria
          </h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-1.5 block">
                Nome
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Ex: Política"
                className="w-full bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-800 dark:text-ink-200 font-sans text-sm px-3 py-2 outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
              />
              {name && (
                <p className="font-sans text-xs text-ink-400 dark:text-ink-600 mt-1">
                  Slug: {slugify(name)}
                </p>
              )}
            </div>
            <div>
              <label className="font-sans text-xs uppercase tracking-widest text-ink-400 dark:text-ink-600 mb-1.5 block">
                Descrição (opcional)
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Breve descrição"
                className="w-full bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-800 dark:text-ink-200 font-sans text-sm px-3 py-2 outline-none focus:border-ink-400 dark:focus:border-ink-500 transition-colors"
              />
            </div>
            {error && (
              <p className="font-sans text-xs text-red-600 dark:text-red-400">{error}</p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-accent-600 hover:bg-accent-700 text-white font-sans text-sm px-4 py-2 transition-colors disabled:opacity-60"
            >
              {saving ? <Loader size={13} className="animate-spin" /> : <Plus size={13} />}
              Criar categoria
            </button>
          </form>
        </div>

        {/* List */}
        <div className="bg-white dark:bg-ink-900 border border-ink-100 dark:border-ink-800">
          <div className="px-5 py-4 border-b border-ink-100 dark:border-ink-800">
            <h2 className="font-sans text-sm font-medium text-ink-700 dark:text-ink-300">
              Categorias existentes ({categories.length})
            </h2>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-10 w-full" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-sans text-sm text-ink-400 dark:text-ink-600">Nenhuma categoria ainda.</p>
            </div>
          ) : (
            categories.map((cat, i) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between px-5 py-3 ${
                  i !== 0 ? 'border-t border-ink-50 dark:border-ink-800' : ''
                }`}
              >
                <div>
                  <p className="font-sans text-sm text-ink-800 dark:text-ink-200">{cat.name}</p>
                  <p className="font-sans text-xs text-ink-400 dark:text-ink-600">/categorias/{cat.slug}</p>
                </div>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 text-ink-300 dark:text-ink-600 hover:text-red-500 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
