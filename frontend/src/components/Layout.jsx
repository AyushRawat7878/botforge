import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { NavLink, Outlet, useMatch, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'
import { Bot, Compass, Logo, LogOut, Menu, X } from './icons'
import { BotAvatar } from './theme'
import ThemeToggle from './ThemeToggle'

// Lets pages refresh the sidebar's conversation list and start new chats.
const ChatsContext = createContext(null)
export const useChats = () => useContext(ChatsContext)

const navClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-ink-800 text-fog-100' : 'text-fog-300 hover:bg-ink-800/60 hover:text-fog-100'
  }`

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const activeId = useMatch('/chat/:id')?.params.id
  const [conversations, setConversations] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)

  const refresh = useCallback(() => api('/conversations').then(setConversations).catch(() => {}), [])
  useEffect(() => {
    refresh()
  }, [refresh])

  const startChat = async (botId) => {
    const conv = await api('/conversations', { method: 'POST', body: { bot_id: botId } })
    await refresh()
    navigate(`/chat/${conv.id}`)
  }

  const removeChat = async (e, convId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this conversation?')) return
    await api(`/conversations/${convId}`, { method: 'DELETE' })
    await refresh()
    if (String(convId) === activeId) navigate('/')
  }

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-ink-700 bg-ink-900">
      <div className="flex items-center gap-2.5 px-4 pb-4 pt-5">
        <Logo className="h-7 w-7" />
        <span className="font-display text-lg font-bold tracking-tight">BotForge</span>
        <button className="btn-ghost ml-auto p-2 md:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button>
      </div>
      <nav className="space-y-0.5 px-2" onClick={() => setMenuOpen(false)}>
        <NavLink to="/" end className={navClass}><Compass className="h-[18px] w-[18px]" /> Explore</NavLink>
        <NavLink to="/my-bots" className={navClass}><Bot className="h-[18px] w-[18px]" /> My bots</NavLink>
      </nav>
      <div className="mt-6 px-5 text-xs font-medium text-fog-500">Recent chats</div>
      <div className="mt-1.5 flex-1 space-y-0.5 overflow-y-auto px-2 pb-3" onClick={() => setMenuOpen(false)}>
        {conversations.length === 0 && <p className="px-3 py-2 text-sm text-fog-500">Nothing yet. Open a bot and say hi.</p>}
        {conversations.map((c) => (
          <NavLink key={c.id} to={`/chat/${c.id}`}
            className={({ isActive }) => `group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors ${isActive ? 'bg-ink-800 text-fog-100' : 'text-fog-300 hover:bg-ink-800/60'}`}>
            <BotAvatar name={c.bot_name} avatar={c.bot_avatar} className="h-8 w-8 text-base" rounded="rounded-md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate">{c.title}</span>
              <span className="block truncate text-xs text-fog-500">{c.bot_name}</span>
            </span>
            <button onClick={(e) => removeChat(e, c.id)} title="Delete chat" aria-label="Delete chat"
              className="rounded p-1 text-fog-500 opacity-0 transition hover:text-coral focus:opacity-100 group-hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </NavLink>
        ))}
      </div>
      <div className="flex items-center gap-3 border-t border-ink-700 px-4 py-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-ink-700 text-sm font-semibold uppercase text-fog-100">{user.username[0]}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{user.username}</div>
          <div className="truncate text-xs text-fog-500">{user.email}</div>
        </div>
        <ThemeToggle />
        <button className="btn-ghost p-2" onClick={logout} title="Log out" aria-label="Log out"><LogOut /></button>
      </div>
    </aside>
  )

  return (
    <ChatsContext.Provider value={{ refresh, startChat }}>
      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:block">{sidebar}</div>
        {menuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {sidebar}
            <div className="flex-1 bg-black/60" onClick={() => setMenuOpen(false)} />
          </div>
        )}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-ink-700 bg-ink-900 px-3 py-2.5 md:hidden">
            <button onClick={() => setMenuOpen(true)} className="btn-ghost p-2" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
            <Logo className="h-6 w-6" />
            <span className="font-display text-lg font-bold">BotForge</span>
            <ThemeToggle className="ml-auto" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </ChatsContext.Provider>
  )
}
