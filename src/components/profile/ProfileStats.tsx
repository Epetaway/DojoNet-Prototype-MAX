// ProfileStats: Quick numbers for followers, following, posts, journals
import React from 'react'

interface Stats {
  followers: number
  following: number
  posts: number
  journals?: number
}

interface Props {
  stats: Stats
}

export function ProfileStats({ stats }: Props) {
  return (
    <div className="flex justify-around py-6 text-zinc-300 bg-zinc-900/50 rounded-xl">
      <div className="text-center">
        <p className="text-2xl font-semibold text-zinc-100">{stats.followers}</p>
        <p className="text-xs text-zinc-500 uppercase tracking-wide">Followers</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-semibold text-zinc-100">{stats.following}</p>
        <p className="text-xs text-zinc-500 uppercase tracking-wide">Following</p>
      </div>
      <div className="text-center">
        <p className="text-2xl font-semibold text-zinc-100">{stats.posts}</p>
        <p className="text-xs text-zinc-500 uppercase tracking-wide">Posts</p>
      </div>
      {stats.journals !== undefined && (
        <div className="text-center">
          <p className="text-2xl font-semibold text-zinc-100">{stats.journals}</p>
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Journals</p>
        </div>
      )}
    </div>
  )
}
