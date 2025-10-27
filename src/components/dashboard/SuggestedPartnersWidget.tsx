// SuggestedPartnersWidget: Show 2-3 partner suggestions with quick match buttons
import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../app/store'
import { Icon, icons } from '../../lib/icons'

export default function SuggestedPartnersWidget() {
  const { session, users } = useStore()
  const me = users.find((u) => u.id === session.userId)
  
  if (!me) return null

  // Get users not already following/friends, same location preferred
  const suggestions = users
    .filter((u) => 
      u.id !== me.id && 
      !me.following?.includes(u.id) &&
      !me.friends?.includes(u.id)
    )
    .sort((a, b) => {
      // Prioritize same location
      const aLocal = a.location === me.location ? 1 : 0
      const bLocal = b.location === me.location ? 1 : 0
      return bLocal - aLocal
    })
    .slice(0, 3)

  if (suggestions.length === 0) return null

  const handleMatch = (userId: string) => {
    // TODO: Wire up matching logic
    console.log('Match with', userId)
  }

  return (
    <div className="card rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--color-text)]">Suggested Partners</h3>
        <Link 
          to="/partners" 
          className="text-xs text-[var(--accent-primary)] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {suggestions.map((user) => (
          <div 
            key={user.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-bg)] transition"
          >
            <Link to={`/u/${user.id}`}>
              <img
                src={user.avatar}
                alt={user.name}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-[var(--color-border)]"
              />
            </Link>
            
            <div className="flex-1 min-w-0">
              <Link to={`/u/${user.id}`}>
                <p className="font-medium text-sm text-[var(--color-text)] truncate hover:text-[var(--accent-primary)]">
                  {user.name}
                </p>
              </Link>
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                {user.rank}
              </p>
              {user.location === me.location && (
                <p className="text-xs text-[var(--accent-primary)] flex items-center gap-1 mt-0.5">
                  <Icon icon={icons.location} className="h-3 w-3" />
                  <span>Nearby</span>
                </p>
              )}
            </div>

            <button
              onClick={() => handleMatch(user.id)}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium hover:shadow-lg transition"
            >
              Connect
            </button>
          </div>
        ))}
      </div>

      <Link
        to="/partners"
        className="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition"
      >
        <Icon icon={icons.sparkles} className="h-4 w-4" />
        <span>Find More Partners</span>
      </Link>
    </div>
  )
}
