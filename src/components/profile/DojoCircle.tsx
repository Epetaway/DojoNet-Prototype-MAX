// DojoCircle: MySpace-style Top 8 friends display
import React from 'react'
import { Link } from 'react-router-dom'

interface Friend {
  id: string
  name: string
  avatar: string
  rank?: string
  primaryArt?: string
}

interface Props {
  friends: Friend[]
  isOwner?: boolean
  onReorder?: (friends: Friend[]) => void
}

export function DojoCircle({ friends, isOwner = false }: Props) {
  const topEight = friends.slice(0, 8)
  
  // Fill empty slots if less than 8
  const slots = [...topEight]
  while (slots.length < 8) {
    slots.push({ 
      id: `empty-${slots.length}`, 
      name: 'Add Friend', 
      avatar: '', 
      rank: '', 
      primaryArt: '' 
    })
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Dojo Circle
        </h3>
        {isOwner && (
          <button className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition">
            Edit
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {slots.map((friend, index) => {
          const isEmpty = !friend.avatar
          
          if (isEmpty) {
            return (
              <div
                key={friend.id}
                className="group relative"
              >
                <div className="w-full aspect-square rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center">
                  <span className="text-2xl text-zinc-400 dark:text-zinc-600">+</span>
                </div>
                <div className="mt-1.5 text-center">
                  <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
                    {isOwner ? 'Add Friend' : 'Empty'}
                  </div>
                </div>
              </div>
            )
          }

          return (
            <Link
              key={friend.id}
              to={`/u/${friend.id}`}
              className="group relative"
            >
              {/* Position Badge */}
              <div className="absolute -top-1.5 -left-1.5 z-10 h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                {index + 1}
              </div>
              
              {/* Avatar */}
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-full aspect-square object-cover rounded-xl shadow-sm ring-2 ring-zinc-200 dark:ring-zinc-800 group-hover:ring-blue-500 dark:group-hover:ring-blue-400 transition"
              />
              
              {/* Info */}
              <div className="mt-1.5">
                <div className="text-xs font-medium truncate text-zinc-900 dark:text-zinc-100 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition">
                  {friend.name}
                </div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  {friend.rank && friend.primaryArt 
                    ? `${friend.rank} • ${friend.primaryArt}`
                    : friend.rank || friend.primaryArt || '\u00A0'}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
