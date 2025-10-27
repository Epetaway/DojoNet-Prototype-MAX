// ProfileHero: Hero section with avatar, name, rank, affiliation + theme support
import React from 'react'
import { Icon, icons } from '../../lib/icons'

interface User {
  id: string
  name: string
  rank?: string
  location?: string
  bio?: string
  avatar: string
  banner?: string
  verifiedGym?: boolean
  gym?: string
  affiliation?: {
    school: string
    beltOrRank: string
  }
  interests?: string[]
  theme?: string
}

interface ThemeConfig {
  primary: string
  pattern?: 'dots' | 'grid' | 'fibers' | 'tatami' | 'iron' | 'neon'
}

interface Props {
  user: User
  themeConfig?: ThemeConfig
}

// Theme presets
const themePresets: Record<string, { primary: string; secondary: string }> = {
  tatami: { primary: '#f59e0b', secondary: '#78350f' },
  iron: { primary: '#6366f1', secondary: '#312e81' },
  neon: { primary: '#ec4899', secondary: '#831843' },
  default: { primary: '#0ea5e9', secondary: '#0c4a6e' },
}

export function ProfileHero({ user, themeConfig }: Props) {
  const theme = themePresets[user.theme || 'default']
  const primaryColor = themeConfig?.primary || theme.primary
  const pattern = themeConfig?.pattern || user.theme || 'default'

  return (
    <section 
      className="relative rounded-3xl overflow-hidden shadow-xl"
      style={{
        background: `radial-gradient(1200px 200px at 0% 0%, ${primaryColor}22, transparent)`,
        backgroundColor: 'rgb(9 9 11)' // zinc-950
      }}
    >
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-10"
        style={{
          backgroundImage: pattern === 'dots' 
            ? 'radial-gradient(circle, currentColor 1px, transparent 1px)'
            : pattern === 'grid'
            ? 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)'
            : undefined,
          backgroundSize: pattern === 'dots' ? '20px 20px' : pattern === 'grid' ? '20px 20px' : undefined,
          color: primaryColor
        }}
      />

      {/* Banner background */}
      {user.banner && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${user.banner})` }}
        />
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 p-8">
        {/* Avatar */}
        <img
          src={user.avatar}
          alt={user.name}
          className="w-24 h-24 md:w-32 md:h-32 rounded-2xl ring-4 shadow-lg flex-shrink-0 object-cover"
          style={{ 
            ringColor: primaryColor,
            boxShadow: `0 0 0 4px ${primaryColor}40`
          }}
        />

        {/* Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-50">{user.name}</h1>
            {user.verifiedGym && (
              <div 
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold"
                style={{ 
                  backgroundColor: `${primaryColor}20`,
                  color: primaryColor
                }}
              >
                <Icon icon={icons.check} className="h-3 w-3" />
                <span>Verified</span>
              </div>
            )}
          </div>

          {(user.rank || user.gym) && (
            <p className="text-zinc-400 mt-1">
              {user.rank ? `${user.rank}` : ''}
              {user.rank && user.gym ? ' • ' : ''}
              {user.gym || ''}
            </p>
          )}

          {user.location && (
            <p className="text-zinc-500 text-sm mt-1 flex items-center justify-center md:justify-start gap-1">
              <Icon icon={icons.location} className="h-4 w-4" />
              <span>{user.location}</span>
            </p>
          )}

          {user.bio && (
            <p className="mt-3 text-zinc-300 max-w-2xl">{user.bio}</p>
          )}

          {user.interests && user.interests.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
              {user.interests.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full hover:bg-zinc-700 transition"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
