import React, { useState } from 'react'
import { useStore } from '../store'
import { Icon, icons } from '../lib/icons'
import { Link } from 'react-router-dom'

export default function Partners(){
  const { session, users } = useStore()
  const me = users.find(u => u.id === session.userId)
  
  if (!me) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-[var(--color-text-muted)]">
          <Link to="/login" className="text-[var(--accent-primary)] hover:underline">Login</Link> to find training partners
        </div>
      </div>
    )
  }

  // Filter potential partners (not already following, not self)
  const candidates = users.filter(u => 
    u.id !== me.id && 
    !me.following?.includes(u.id) &&
    !me.friends?.includes(u.id)
  )

  const [index, setIndex] = useState(0)
  const [matches, setMatches] = useState([])
  
  const card = candidates[index]
  
  const onPass = () => {
    if (index < candidates.length - 1) {
      setIndex(i => i + 1)
    }
  }
  
  const onLike = () => {
    if (card) {
      setMatches([...matches, card.id])
      // TODO: Wire to store to update following/friends
      console.log('Matched with:', card.name)
    }
    if (index < candidates.length - 1) {
      setIndex(i => i + 1)
    }
  }

  const calculateDistance = (user) => {
    // Mock distance calculation - in real app would use geolocation
    return user.location === me.location ? '2 mi' : '15 mi'
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-4 pt-24">
        <div className="text-center">
          <Icon icon={icons.checkCircle} className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">You're all caught up!</h2>
          <p className="text-[var(--color-text-muted)] mb-6">
            No more partners to show right now. Check back later for new matches.
          </p>
          <Link 
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-primary-hover)] transition"
          >
            <Icon icon={icons.home} className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-24">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Find Training Partners</h1>
          <p className="text-[var(--color-text-muted)]">
            Swipe or use buttons to connect with compatible partners near you
          </p>
          {matches.length > 0 && (
            <p className="text-sm text-green-500 mt-2 flex items-center gap-2">
              <Icon icon={icons.checkCircle} className="h-4 w-4" />
              {matches.length} new {matches.length === 1 ? 'match' : 'matches'} today!
            </p>
          )}
        </div>

        <div className="relative h-[32rem]">
          {candidates.slice(index, index + 3).map((p, i) => (
            <div 
              key={p.id} 
              className={`absolute inset-0 transition-all duration-300 ${
                i === 0 ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
              }`} 
              style={{ zIndex: 10 - i }}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="relative h-3/5">
                  <img 
                    src={p.avatar} 
                    alt={p.name}
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">{p.name}</h3>
                        <p className="text-sm text-white/80 mt-1">{p.rank} • {p.primaryArt}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm flex items-center gap-1">
                            <Icon icon={icons.location} className="h-3 w-3" />
                            {calculateDistance(p)}
                          </span>
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-md backdrop-blur-sm">
                            {p.gym || 'Unaffiliated'}
                          </span>
                        </div>
                      </div>
                      {p.verifiedGym && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/80 backdrop-blur-sm text-xs font-semibold">
                          <Icon icon={icons.check} className="h-3 w-3" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[var(--color-text)] mb-4">
                    {p.bio || 'No bio available'}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
                    <Icon icon={icons.location} className="h-4 w-4" />
                    <span>{p.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-6">
          <button 
            onClick={onPass}
            className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 ring-2 ring-zinc-300 dark:ring-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition flex items-center justify-center group"
          >
            <Icon icon={icons.close} className="h-6 w-6 group-hover:scale-110 transition" />
          </button>
          <button 
            onClick={onLike}
            className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl text-white transition flex items-center justify-center group"
          >
            <Icon icon={icons.heart} className="h-6 w-6 group-hover:scale-110 transition" />
          </button>
          <Link
            to={`/u/${card.id}`}
            className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 ring-2 ring-zinc-300 dark:ring-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition flex items-center justify-center group"
          >
            <Icon icon={icons.eye} className="h-6 w-6 group-hover:scale-110 transition" />
          </Link>
        </div>

        <p className="text-center text-xs text-[var(--color-text-muted)] mt-6">
          {index + 1} of {candidates.length}
        </p>
      </div>
    </div>
  )
}
