import { useEffect, useState } from 'react'
import { Moon, Sun } from './icons'

const KEY = 'botforge_theme'

// Saved choice first, otherwise the device setting. index.html applies the same rule before React loads, so there is no flash.
function initialTheme() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* storage blocked: fall back to the device setting */
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

let current = typeof document !== 'undefined' ? document.documentElement.dataset.theme || initialTheme() : 'dark'
const listeners = new Set()

function apply(theme) {
  current = theme
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn(theme))
}

export function useTheme() {
  const [theme, setTheme] = useState(current)
  useEffect(() => {
    document.documentElement.dataset.theme = current
    listeners.add(setTheme)
    return () => listeners.delete(setTheme)
  }, [])
  return [theme, () => apply(theme === 'dark' ? 'light' : 'dark')]
}

export default function ThemeToggle({ className = '' }) {
  const [theme, toggle] = useTheme()
  const next = theme === 'dark' ? 'day' : 'night'
  return (
    <button type="button" onClick={toggle} className={`btn-ghost p-2 ${className}`} title={`Switch to ${next} mode`} aria-label={`Switch to ${next} mode`}>
      {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  )
}
