// TestProfiles: Quick access page to test all user profiles
import React from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'

export default function TestProfiles() {
  const { users } = useStore()

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
          Test User Profiles
        </h1>
        <p className="text-[var(--color-text-muted)] mb-8">
          Quick links to test all user profiles with their themes and features
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Link
              key={user.id}
              to={`/u/${user.id}`}
              className="block p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--accent-primary)] transition group"
            >
              <div className="flex items-start gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-[var(--color-border)] group-hover:ring-[var(--accent-primary)] transition"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--accent-primary)] transition">
                    {user.name}
                  </h3>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {user.rank} • {user.primaryArt}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      user.theme === 'tatami' ? 'bg-amber-500/20 text-amber-500' :
                      user.theme === 'iron' ? 'bg-indigo-500/20 text-indigo-500' :
                      user.theme === 'neon' ? 'bg-pink-500/20 text-pink-500' :
                      'bg-blue-500/20 text-blue-500'
                    }`}>
                      {user.theme || 'default'}
                    </span>
                    {user.playlist && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-500">
                        🎵 music
                      </span>
                    )}
                    {user.verifiedGym && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-500">
                        ✓ verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            Quick Access URLs:
          </h2>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <span className="text-[var(--color-text-muted)]">Demo User:</span>{' '}
              <code className="text-[var(--accent-primary)]">http://localhost:5173/u/u_demo</code>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Jason (Purple Belt):</span>{' '}
              <code className="text-[var(--accent-primary)]">http://localhost:5173/u/u_jason</code>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Maria (Brown Belt):</span>{' '}
              <code className="text-[var(--accent-primary)]">http://localhost:5173/u/u_maria</code>
            </div>
            <div>
              <span className="text-[var(--color-text-muted)]">Lee (Black Belt, Neon):</span>{' '}
              <code className="text-[var(--accent-primary)]">http://localhost:5173/u/u_lee</code>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-primary-hover)] transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
