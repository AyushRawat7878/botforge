import { useEffect, useState } from 'react'
import { api } from '../api'
import BotCard from '../components/BotCard'
import BotForm from '../components/BotForm'
import { Plus } from '../components/icons'
import { useChats } from '../components/Layout'

export default function MyBots() {
  const { startChat, refresh } = useChats()
  const [bots, setBots] = useState(null)
  const [editing, setEditing] = useState(null) // null = closed, {} = new bot, bot = edit

  const load = () => api('/bots/mine').then(setBots)
  useEffect(() => {
    load()
  }, [])

  const save = async (data) => {
    if (editing.id) await api(`/bots/${editing.id}`, { method: 'PUT', body: data })
    else await api('/bots', { method: 'POST', body: data })
    setEditing(null)
    load()
  }

  const remove = async (bot) => {
    if (!confirm(`Delete "${bot.name}"? All chats with it will be deleted too.`)) return
    await api(`/bots/${bot.id}`, { method: 'DELETE' })
    load()
    refresh()
  }

  const publicCount = bots?.filter((b) => b.is_public).length ?? 0

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">My bots</h1>
          {bots && bots.length > 0 && (
            <p className="mt-2 text-fog-300">{bots.length} {bots.length === 1 ? 'bot' : 'bots'}, {publicCount} public</p>
          )}
        </div>
        <button className="btn-primary" onClick={() => setEditing({})}><Plus /> New bot</button>
      </div>

      {bots && bots.length === 0 && (
        <div className="mt-12 max-w-md">
          <p className="font-display text-2xl font-bold">No bots yet.</p>
          <p className="mt-2 text-fog-300">A bot is a name, an avatar and a few lines about how it should talk. Start with something simple, like a recipe helper or a study buddy.</p>
          <button className="btn-primary mt-6" onClick={() => setEditing({})}><Plus /> Make your first bot</button>
          <p className="hand mt-3 -rotate-2 text-2xl">takes about a minute!</p>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bots?.map((b) => <BotCard key={b.id} bot={b} onChat={startChat} onEdit={setEditing} onDelete={remove} />)}
      </div>

      {editing && <BotForm initial={editing.id ? editing : null} onSave={save} onCancel={() => setEditing(null)} />}
    </div>
  )
}
