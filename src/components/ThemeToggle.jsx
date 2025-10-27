import React from 'react'
import { applyTheme, getStoredTheme } from '../lib/theme'
import { Icon, icons } from '../lib/icons'

export default function ThemeToggle(){
  const [mode, setMode] = React.useState(
    getStoredTheme() || (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
  )
  const toggle = ()=>{
    const next = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    applyTheme(next)
  }
  const isDark = mode === 'dark'
  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center h-9 w-9 rounded-md border border-[var(--color-border)] hover:bg-[var(--color-elevated)] text-[var(--color-text)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
        {isDark ? <Icon icon={icons.sun} className="h-4 w-4" /> : <Icon icon={icons.moon} className="h-4 w-4" />}
    </button>
  )
  }
