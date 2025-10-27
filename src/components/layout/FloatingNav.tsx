import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon, icons } from '../../lib/icons'
import { useStore } from '../../store'

const navItems = [
  { to: '/dashboard', icon: icons.home, label: 'Home', color: 'text-slate-500' },
  { to: '/forums', icon: icons.message, label: 'Forums', color: 'text-blue-500' },
  { to: '/training-journal', icon: icons.book, label: 'Journal', color: 'text-orange-500' },
  { to: '/partners', icon: icons.users, label: 'Partners', color: 'text-pink-500' },
  { to: '/search', icon: icons.search, label: 'Search', color: 'text-green-500' },
]

export default function FloatingNav() {
  const location = useLocation()
  const { session, users } = useStore()
  const me = users.find(u => u.id === session.userId)

  // Hide on home, login, and signup pages
  const hideOnPages = ['/', '/login', '/signup']
  const shouldHide = hideOnPages.includes(location.pathname)

  // Don't show if not logged in or on excluded pages
  if (!session.userId || shouldHide) {
    return null
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="card rounded-full px-4 py-3 shadow-2xl border-2 border-[var(--color-border)] backdrop-blur-xl bg-[var(--color-bg)]/95">
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`
                  flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all
                  ${
                    isActive
                      ? 'bg-[var(--color-surface)] scale-110'
                      : 'hover:scale-110 hover:bg-[var(--color-surface)]'
                  }
                `}
              >
                <Icon
                  icon={item.icon}
                  size={24}
                  className={isActive ? 'text-gray-400' : item.color}
                />
                <span className={`text-[10px] font-medium ${isActive ? 'text-gray-400' : 'text-[var(--color-text-muted)]'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}

          {/* Profile Avatar Button */}
          {me && (
            <Link
              to={`/u/${me.id}`}
              className={`
                flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all
                ${
                  location.pathname === `/u/${me.id}`
                    ? 'bg-[var(--color-surface)] scale-110'
                    : 'hover:scale-110 hover:bg-[var(--color-surface)]'
                }
              `}
            >
              <img 
                src={me.avatar} 
                alt={me.name}
                className={`h-6 w-6 rounded-full object-cover ring-2 transition ${
                  location.pathname === `/u/${me.id}`
                    ? 'ring-gray-400'
                    : 'ring-purple-500'
                }`}
              />
              <span className={`text-[10px] font-medium ${
                location.pathname === `/u/${me.id}`
                  ? 'text-gray-400'
                  : 'text-[var(--color-text-muted)]'
              }`}>
                Profile
              </span>
            </Link>
          )}

          {/* New Post Button */}
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-all hover:scale-110 hover:bg-[var(--color-surface)]"
          >
            <Icon icon={icons.plus} size={24} className="text-green-500" />
            <span className="text-[10px] font-medium text-[var(--color-text-muted)]">
              New Post
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
