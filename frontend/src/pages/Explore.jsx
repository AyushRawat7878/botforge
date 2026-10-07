import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import BotCard from '../components/BotCard'
import { Search } from '../components/icons'
import { useChats } from '../components/Layout'

export default function Explore() {
  const { startChat } = useChats()
  const [query, setQuery] = useState('')
  const [picturesOnly, setPicturesOnly] = useState(false)
  const [bots, setBots] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => {
      api(`/bots/public?q=${encodeURIComponent(query)}`).then(setBots).catch((e) => setError(e.message))
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  const shown = bots?.filter((b) => !picturesOnly || b.image_replies)

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 md:px-10">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Explore</h1>
        {shown && <span className="text-sm text-fog-500">{shown.length} public {shown.length === 1 ? 'bot' : 'bots'}</span>}
      </div>
      <p className="mt-2 text-fog-300">Bots other people made and shared. Open one to start a chat.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-fog-500" />
          <input className="input pl-9" placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search bots" />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-fog-300">
          <input type="checkbox" className="h-4 w-4 accent-accent" checked={picturesOnly} onChange={(e) => setPicturesOnly(e.target.checked)} />
          Only bots that send pictures
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-coral">{error}</p>}
      {shown && shown.length === 0 && (
        <p className="mt-10 text-fog-300">
          Nothing here{query ? ` for “${query}”` : ' yet'}. <Link to="/my-bots" className="text-link underline underline-offset-2">Make a bot</Link> and set it to public.
        </p>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown?.map((b) => <BotCard key={b.id} bot={b} onChat={startChat} />)}
      </div>
    </div>
  )
}
