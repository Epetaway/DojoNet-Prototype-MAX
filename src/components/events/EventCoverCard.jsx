import React from 'react'

export default function EventCoverCard({ event }){
  const loc = [event?.venue?.city, event?.venue?.state].filter(Boolean).join(', ')
  const date = event?.start ? new Date(event.start).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' }) : 'TBA'
  return (
    <article className="relative h-72 w-full overflow-hidden rounded-2xl ring-1 ring-zinc-200/60 dark:ring-zinc-800 bg-zinc-900">
      {event?.imageUrl ? (
        <img src={event.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
      <div className="relative z-10 flex h-full flex-col p-4 text-white">
        <div className="mt-auto">
          <h3 className="text-xl font-bold leading-tight line-clamp-2">{event.title}</h3>
          <div className="mt-2 flex items-center gap-3 text-sm">
            {event?.hostAvatar ? (
              <img src={event.hostAvatar} alt="" className="h-7 w-7 rounded-full ring-1 ring-white/60" />
            ) : null}
            <span className="opacity-90">{loc || 'Location TBA'}</span>
            <span className="opacity-90">• {date}</span>
            {event?.registerUrl ? (
              <a href={event.registerUrl} target="_blank" rel="noopener" className="ml-auto rounded-md bg-white/90 px-3 py-1.5 text-zinc-900 font-semibold hover:bg-white">Details</a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  )
}
