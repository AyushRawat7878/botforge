import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Reveals markdown text word by word, like a streaming reply.
 * Long replies speed up so the whole animation stays under ~3 seconds.
 */
export default function Typewriter({ text, onTick, onDone, speed = 28 }) {
  const tokens = useMemo(() => text.split(/(\s+)/), [text])
  const skip = reducedMotion()
  const [shown, setShown] = useState(skip ? tokens.length : 0)
  const done = useRef(false)
  const step = Math.max(1, Math.ceil(tokens.length / (3000 / speed)))

  useEffect(() => {
    if (shown >= tokens.length) {
      if (!done.current) {
        done.current = true
        onDone?.()
      }
      return
    }
    const t = setTimeout(() => {
      setShown((n) => Math.min(tokens.length, n + step))
      onTick?.()
    }, speed)
    return () => clearTimeout(t)
  }, [shown, tokens.length, step, speed, onTick, onDone])

  const finished = shown >= tokens.length
  return (
    <div className={`prose-chat ${finished ? '' : 'typing'}`}>
      <ReactMarkdown>{tokens.slice(0, shown).join('') || ' '}</ReactMarkdown>
    </div>
  )
}
