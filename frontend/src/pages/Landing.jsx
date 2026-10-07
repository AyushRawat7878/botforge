import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { ArrowRight, Logo } from '../components/icons'
import { BotAvatar, Scribble } from '../components/theme'
import ThemeToggle from '../components/ThemeToggle'
import Typewriter from '../components/Typewriter'

const DEMO_REPLY =
  'Make a quick **curd rice**. Mix the rice with curd and a pinch of salt, then pour over a tempering of mustard seeds and curry leaves sizzled in hot oil. Ready in 10 minutes.'

/* Hand-drawn arrow. `dir` is where it points. */
function HandArrow({ dir = 'left', className = '' }) {
  const paths = {
    left: { d: 'M58 8 C 44 2, 22 4, 6 18', head: 'M6 18 L 8 7 M6 18 L 16 15' },
    down: { d: 'M8 4 C 22 10, 30 26, 24 44', head: 'M24 44 L 18 35 M24 44 L 31 37' },
    up: { d: 'M6 40 C 10 26, 22 14, 40 8', head: 'M40 8 L 30 6 M40 8 L 34 16' },
  }[dir]
  return (
    <svg viewBox="0 0 64 48" className={`h-8 w-11 shrink-0 text-coral ${className}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d={paths.d} />
      <path d={paths.head} />
    </svg>
  )
}

function Note({ children, arrow = 'left', className = '' }) {
  return (
    <div className={`flex items-start gap-1 ${className}`}>
      {arrow && <HandArrow dir={arrow} className="hidden md:block" />}
      <p className="hand text-[22px] leading-tight">{children}</p>
    </div>
  )
}

function ChatPreview() {
  // Replays the typing every few seconds so visitors see how replies come in.
  const [round, setRound] = useState(0)
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => {
      setDone(false)
      setRound((r) => r + 1)
    }, 5000)
    return () => clearTimeout(t)
  }, [done])

  return (
    <div className="card overflow-hidden bg-ink-900">
      <div className="flex items-center gap-3 border-b border-ink-700 px-4 py-3">
        <BotAvatar name="Chef Remy" avatar="👨‍🍳" className="h-8 w-8 text-base" rounded="rounded-md" />
        <div className="text-sm font-semibold">Chef Remy</div>
        <div className="ml-auto text-xs text-fog-500">by priya_dev</div>
      </div>
      <div className="space-y-3 p-4 text-[15px] leading-relaxed">
        <div className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-on-accent">I've got rice, curd and some curry leaves. Dinner?</div>
        </div>
        <div className="flex gap-2.5">
          <BotAvatar name="Chef Remy" avatar="👨‍🍳" className="h-8 w-8 text-base" rounded="rounded-md" />
          <div className="min-h-[124px] max-w-[85%] rounded-2xl rounded-tl-sm bg-ink-800 px-4 py-2.5">
            <Typewriter key={round} text={DEMO_REPLY} speed={45} onDone={() => setDone(true)} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* One row of the "what's inside a bot" sheet: the field on the left, a hand-written note on the right. */
function SheetRow({ label, children, note }) {
  return (
    <div className="grid gap-x-6 gap-y-2 border-t border-ink-700 py-5 first:border-t-0 md:grid-cols-[1fr_240px] md:items-center">
      <div>
        <div className="mb-1.5 text-sm text-fog-500">{label}</div>
        {children}
      </div>
      <Note>{note}</Note>
    </div>
  )
}

function FakeToggle({ on }) {
  return (
    <span className={`relative inline-block h-6 w-10 rounded-full ${on ? 'bg-accent' : 'bg-ink-600'}`}>
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white ${on ? 'left-5' : 'left-1'}`} />
    </span>
  )
}

export default function Landing() {
  const { user } = useAuth()
  if (user) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="mx-auto flex max-w-5xl items-center gap-2.5 px-5 py-5 md:px-8">
        <Logo className="h-7 w-7" />
        <span className="font-display text-lg font-bold tracking-tight">BotForge</span>
        <nav className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Link to="/login" className="btn-ghost">Log in</Link>
          <Link to="/register" className="btn-primary">Sign up</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-5xl gap-12 px-5 pb-20 pt-10 md:px-8 lg:grid-cols-[1.2fr_400px] lg:items-center lg:pt-16">
        <div className="min-w-0">
          <h1 className="font-display text-[40px] font-bold leading-[1.05] tracking-tight sm:text-[56px]">
            Make a chatbot with its own <Scribble>personality</Scribble>.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-fog-300">
            Write a few lines about who your bot is. BotForge turns that into a chatbot you can talk to, keep to yourself, or share with everyone.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/register" className="btn-primary px-5 py-2.5 text-[15px]">Make a bot <ArrowRight /></Link>
            <Link to="/login" className="btn-outline px-5 py-2.5 text-[15px]">Log in</Link>
          </div>
          <div className="mt-3 flex items-start gap-1 pl-6">
            <HandArrow dir="up" className="-mt-1" />
            <p className="hand min-w-0 -rotate-2 text-[22px]">it's free, and takes about a minute</p>
          </div>
        </div>
        <ChatPreview />
      </section>

      {/* What's inside a bot */}
      <section className="border-t border-ink-700 bg-ink-900">
        <div className="mx-auto max-w-5xl px-5 py-20 md:px-8">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">What's inside a bot</h2>
          <p className="mt-3 max-w-lg text-fog-300">Every bot is just a few settings. Here's Chef Remy, one of the bots people have made.</p>

          <div className="card mt-10 px-5 md:px-7">
            <SheetRow label="Name and avatar" note="pick a name and an emoji">
              <div className="flex items-center gap-3">
                <BotAvatar name="Chef Remy" avatar="👨‍🍳" className="h-10 w-10 text-xl" />
                <span className="font-display text-xl font-semibold">Chef Remy</span>
              </div>
            </SheetRow>
            <SheetRow label="Personality" note="this is how it talks. only you can see it">
              <p className="rounded-lg bg-ink-800 px-4 py-3 text-[15px] leading-relaxed text-fog-100">
                You are a friendly Indian home chef. Suggest easy recipes using what's already in the kitchen. Keep answers short.
              </p>
            </SheetRow>
            <SheetRow label="Can send pictures" note={<>ask it to draw, and it sends a picture back</>}>
              <FakeToggle on />
            </SheetRow>
            <SheetRow label="Public" note="turn this on and anyone can find it on Explore">
              <FakeToggle on />
            </SheetRow>
          </div>
          <p className="mt-6 text-fog-300">
            Chats remember what you said earlier, so you can ask follow-up questions without repeating yourself.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-5 py-20 md:px-8">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3">
          {[
            ['Make a bot', 'Give it a name, an emoji and a few lines about its personality.'],
            ['Talk to it', 'Open a chat. Replies appear as they are written, and the bot remembers the conversation.'],
            ['Share it if you like', 'Switch it to public and it shows up on Explore for everyone.'],
          ].map(([t, d], i) => (
            <li key={t}>
              <span className="font-display text-4xl font-bold text-accent-text">{i + 1}</span>
              <h3 className="mt-2 text-lg font-semibold">{t}</h3>
              <p className="mt-1.5 leading-relaxed text-fog-300">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-14 flex flex-wrap items-center gap-4 border-t border-ink-700 pt-10">
          <p className="font-display text-2xl font-bold">Ready to make one?</p>
          <Link to="/register" className="btn-primary px-5 py-2.5 text-[15px]">Make a bot <ArrowRight /></Link>
        </div>
      </section>

      <footer className="border-t border-ink-700">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-3 gap-y-1 px-5 py-6 text-sm text-fog-500 md:px-8">
          <Logo className="h-5 w-5" />
          <span>BotForge is a side project by Ayush Rawat, built with FastAPI, React and SQLite.</span>
        </div>
      </footer>
    </div>
  )
}
