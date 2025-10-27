export function getStoredTheme(){
  try { return localStorage.getItem('theme') || '' } catch { return '' }
}

export function applyTheme(theme){
  const root = document.documentElement
  if(theme === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
  try { localStorage.setItem('theme', theme) } catch {}
}

export function initTheme(){
  const stored = getStoredTheme()
  if(stored){ applyTheme(stored); return stored }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = prefersDark ? 'dark' : 'light'
  applyTheme(theme)
  return theme
}
