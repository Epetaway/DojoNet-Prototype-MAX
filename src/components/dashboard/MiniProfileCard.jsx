import React from 'react'
import { Link } from 'react-router-dom'

export default function MiniProfileCard({ user }) {
  return (
    <div className="card rounded-xl p-4">
      <div className="flex items-center gap-3">
        <img 
          src={user.avatar} 
          alt={user.name}
          className="w-12 h-12 rounded-full avatar-ring" 
        />
        <div className="flex-1">
          <h3 className="text-[var(--color-text)] font-semibold">{user.name}</h3>
          <p className="text-xs text-[var(--color-text-muted)]">@{user.username}</p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-around text-center">
        <div>
          <p className="text-lg font-semibold text-[var(--color-text)]">{user.followers || 0}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Followers</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-[var(--color-text)]">{user.following || 0}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Following</p>
        </div>
        <div>
          <p className="text-lg font-semibold text-[var(--color-text)]">{user.posts || 0}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Posts</p>
        </div>
      </div>
      
      <Link 
        to={`/user/${user.id}`}
        className="mt-4 block text-center text-sm link transition-colors"
      >
        View Profile
      </Link>
    </div>
  )
}
