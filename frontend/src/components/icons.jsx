// Small stroke icons used across the app (24px grid, inherit text color).
const Icon = ({ children, className = 'h-4 w-4', ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" {...rest}>
    {children}
  </svg>
)

// Flat mark: a speech bubble with two eyes.
export const Logo = ({ className = 'h-8 w-8' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <path d="M6 5h20a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H14l-6 5v-5H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" style={{ fill: 'var(--color-accent)' }} />
    <circle cx="12" cy="14" r="2" style={{ fill: 'var(--color-on-accent)' }} />
    <circle cx="20" cy="14" r="2" style={{ fill: 'var(--color-on-accent)' }} />
  </svg>
)

export const Compass = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></Icon>
export const Bot = (p) => <Icon {...p}><rect x="4" y="8" width="16" height="12" rx="4" /><path d="M12 4v4M9 14h.01M15 14h.01" /></Icon>
export const Plus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
export const ArrowLeft = (p) => <Icon {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Icon>
export const ArrowRight = (p) => <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>
export const Send = (p) => <Icon {...p}><path d="M12 19V5M6 11l6-6 6 6" /></Icon>
export const Menu = (p) => <Icon {...p}><path d="M4 7h16M4 12h16M4 17h10" /></Icon>
export const X = (p) => <Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>
export const LogOut = (p) => <Icon {...p}><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" /></Icon>
export const Search = (p) => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>
export const Trash = (p) => <Icon {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></Icon>
export const Pencil = (p) => <Icon {...p}><path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" /></Icon>
export const Sun = (p) => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>
export const Moon = (p) => <Icon {...p}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" /></Icon>
