// Each bot gets one flat color, picked from its name, so bots are easy to tell apart.
const COLORS = ['#2dd4bf', '#fb7185', '#38bdf8', '#fbbf24', '#a78bfa', '#4ade80']

export function botColor(key = '') {
  let h = 0
  for (const ch of String(key)) h = (h * 31 + ch.codePointAt(0)) >>> 0
  return COLORS[h % COLORS.length]
}

/** Square tile behind the bot's emoji, tinted with its color. */
export function BotAvatar({ name, avatar, className = 'h-12 w-12 text-2xl', rounded = 'rounded-lg' }) {
  return (
    <div className={`grid shrink-0 place-items-center ${rounded} ${className}`} style={{ background: `${botColor(name)}26` }}>
      {avatar}
    </div>
  )
}

/** Hand-drawn underline (coral by default). */
export function Scribble({ children, color = 'var(--color-coral)' }) {
  return (
    <span className="scribble">
      {children}
      <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
        <path d="M2 8 C 40 3, 80 3, 120 6 S 180 10, 198 4" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </span>
  )
}
