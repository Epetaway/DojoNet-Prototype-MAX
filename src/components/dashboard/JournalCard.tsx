// JournalCard: User reflections on training days with visibility tag
import React from 'react'
import { Lock, Users, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Journal {
  id: string
  title: string
  body: string
  date: string
  visibility: 'PRIVATE' | 'FRIENDS' | 'PUBLIC'
}

interface Props {
  journal: Journal
  onClick?: () => void
}

const visibilityConfig = {
  PRIVATE: { icon: Lock, label: 'Private', color: 'text-zinc-500' },
  FRIENDS: { icon: Users, label: 'Friends', color: 'text-blue-400' },
  PUBLIC: { icon: Globe, label: 'Public', color: 'text-green-400' },
}

export function JournalCard({ journal, onClick }: Props) {
  const config = visibilityConfig[journal.visibility]
  const Icon = config.icon

  return (
    <div
      onClick={onClick}
      className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition cursor-pointer group"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-brand transition truncate">
            {journal.title}
          </h3>
          <p className="text-sm text-zinc-400">{journal.date}</p>
        </div>
        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded bg-zinc-800 ${config.color}`}>
          <Icon className="h-3 w-3" />
          <span>{config.label}</span>
        </div>
      </div>
      <p className="mt-2 text-zinc-300 line-clamp-3 leading-relaxed">{journal.body}</p>
    </div>
  )
}
