// MiniProfileCard: Condensed user card for right panel
import React from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'

interface User {
  id: string
  name: string
  username: string
  avatar: string
  rank?: string
  verified?: boolean
}

interface Props {
  user: User
  stats?: {
    followers: number
    following: number
    journals: number
  }
}

export function MiniProfileCard({ user, stats }: Props) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 ring-1 ring-zinc-800">
      <Link to={`/profile/${user.id}`} className="flex items-center gap-3 group">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-12 h-12 rounded-full ring-2 ring-zinc-800 group-hover:ring-brand transition"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-zinc-100 font-semibold group-hover:text-brand transition truncate">
              {user.name}
            </h3>
            {user.verified && (
              <Check className="h-4 w-4 text-brand flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-zinc-500 truncate">@{user.username}</p>
          {user.rank && (
            <p className="text-xs text-zinc-400 truncate">{user.rank}</p>
          )}
        </div>
      </Link>

      {stats && (
        <div className="mt-3 pt-3 border-t border-zinc-800 flex justify-around text-xs">
          <div className="text-center">
            <p className="font-semibold text-zinc-200">{stats.followers}</p>
            <p className="text-zinc-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-zinc-200">{stats.following}</p>
            <p className="text-zinc-500">Following</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-zinc-200">{stats.journals}</p>
            <p className="text-zinc-500">Journals</p>
          </div>
        </div>
      )}
    </div>
  )
}
