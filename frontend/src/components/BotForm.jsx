import { useState } from 'react'
import { X } from './icons'
import { BotAvatar } from './theme'

const AVATARS = ['🤖', '🧠', '👨‍🍳', '🧙', '🐱', '🎨', '📚', '💼', '🏋️', '🎮', '🌍', '🧑‍💻']

const EMPTY = { name: '', description: '', system_prompt: '', avatar: '🤖', is_public: false, image_replies: true }

function Toggle({ id, checked, onChange, title, hint }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-sm text-fog-500">{hint}</span>
      </span>
      <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative mt-0.5 h-6 w-10 shrink-0 rounded-full bg-ink-600 transition-colors peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent
        after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
    </label>
  )
}

export default function BotForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : EMPTY)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { name, description, system_prompt, avatar, is_public, image_replies } = form
      await onSave({ name, description, system_prompt, avatar, is_public, image_replies })
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onCancel}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()}
        className="card max-h-[calc(100dvh-2rem)] w-full max-w-lg animate-rise overflow-y-auto bg-ink-900 p-6 shadow-2xl shadow-black/50">
        <div className="mb-6 flex items-center gap-3.5">
          <BotAvatar name={form.name || 'New bot'} avatar={form.avatar} />
          <h2 className="min-w-0 flex-1 truncate font-display text-xl font-bold tracking-tight">{form.name || (initial ? 'Edit bot' : 'New bot')}</h2>
          <button type="button" className="btn-ghost p-2" onClick={onCancel} aria-label="Close"><X /></button>
        </div>

        <div className="space-y-5">
          <div>
            <span className="label">Avatar</span>
            <div className="flex flex-wrap gap-1.5">
              {AVATARS.map((a) => (
                <button type="button" key={a} onClick={() => set('avatar', a)} aria-label={`Avatar ${a}`}
                  className={`grid h-10 w-10 place-items-center rounded-lg border text-xl transition-colors ${
                    form.avatar === a ? 'border-accent bg-accent/10' : 'border-transparent bg-ink-800 hover:border-ink-600'}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label" htmlFor="bot-name">Name</label>
            <input id="bot-name" className="input" value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={60} required placeholder="Chef Remy" />
          </div>

          <div>
            <label className="label" htmlFor="bot-desc">Description</label>
            <input id="bot-desc" className="input" value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={300} placeholder="Quick recipes with whatever's in your kitchen" />
          </div>

          <div>
            <label className="label" htmlFor="bot-prompt">Personality</label>
            <textarea id="bot-prompt" className="input min-h-[120px] leading-relaxed" value={form.system_prompt} onChange={(e) => set('system_prompt', e.target.value)} maxLength={4000} required
              placeholder="You are a friendly Indian home chef. Suggest easy recipes with ingredients found in a normal kitchen. Keep answers short." />
            <p className="mt-1.5 text-sm text-fog-500">Tell the bot who it is and how to talk. Only you can see this.</p>
          </div>

          <div className="divide-y divide-ink-700 border-y border-ink-700">
            <Toggle id="bot-images" checked={form.image_replies} onChange={(v) => set('image_replies', v)}
              title="Can send pictures" hint="Answers “draw…” requests with a generated image" />
            <Toggle id="bot-public" checked={form.is_public} onChange={(v) => set('is_public', v)}
              title="Public" hint="Shows up on Explore so anyone can chat with it" />
          </div>

          {error && <p className="rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : initial ? 'Save' : 'Create bot'}</button>
        </div>
      </form>
    </div>
  )
}
