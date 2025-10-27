import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Users, MessageSquare, Bookmark, Settings } from 'lucide-react'

const items = [
  { to:'/dashboard', label:'Dashboard', icon: Home },
  { to:'/profile/me', label:'My Circle', icon: Users },
  { to:'/explore?t=tutorials', label:'Tutorials', icon: BookOpen },
  { to:'/saved', label:'Saved', icon: Bookmark },
  { to:'/messages', label:'Messages', icon: MessageSquare },
  { to:'/settings', label:'Settings', icon: Settings },
]

export default function NavMenu(){
  const loc = useLocation()
  return (
    <nav className="card p-3">
      <ul className="space-y-1">
        {items.map(it => {
          const active = loc.pathname===it.to
          return (
            <li key={it.to}>
              <Link to={it.to} className={`flex items-center gap-2 px-3 h-9 rounded hover:bg-[var(--color-elevated)] ${active?'text-[var(--accent-primary)]':''}`}>
                {it.icon ? <it.icon size={16} /> : null}
                <span>{it.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
