import React from 'react'

export default function UpcomingList({ items = [] }){
  return (
    <ul className="space-y-1">
      {items.map(e => (
        <li key={e.id} className="flex items-center gap-3 rounded-lg hover:bg-zinc-800/40 p-1">
          <div className="h-12 w-12 overflow-hidden rounded-md ring-1 ring-zinc-700 bg-zinc-900">
            {e.thumbUrl || e.imageUrl ? (
              <img src={e.thumbUrl || e.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-zinc-400">No Image</div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-100 truncate">{e.title}</p>
            <p className="text-xs text-zinc-400">
              {[e.venue?.city, e.venue?.state].filter(Boolean).join(', ')}
              {e.start ? ` • ${new Date(e.start).toLocaleDateString()}` : ''}
            </p>
          </div>
          {e.hostAvatar ? (
            <img src={e.hostAvatar} alt="" className="ml-auto h-6 w-6 rounded-full ring-1 ring-white/50" />
          ) : null}
          {e.registerUrl ? (
            <a href={e.registerUrl} target="_blank" rel="noopener" className="ml-2 rounded-md bg-zinc-800 text-zinc-200 px-2 py-1 text-xs hover:bg-zinc-700">
              Details
            </a>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
