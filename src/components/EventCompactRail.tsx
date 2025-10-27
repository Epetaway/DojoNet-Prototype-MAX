// EventCompactCard: Compact horizontal scrolling event cards
import React from 'react'
import { Link } from 'react-router-dom'

type CompactEvent = {
  id: string
  title: string
  locationLabel: string
  imageUrl: string
}

interface EventCompactRailProps {
  events: CompactEvent[]
}

export default function EventCompactRail({ events }: EventCompactRailProps) {
  return (
    <div className="mt-6 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {events.map((e) => (
        <Link
          key={e.id}
          to={`/event/${e.id}`}
          state={{ event: e as any }}
          className="relative min-w-[16rem] h-48 rounded-2xl overflow-hidden ring-1 ring-zinc-200/60 dark:ring-zinc-800 hover:ring-2 hover:ring-brand transition-all group"
        >
          <img
            src={e.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 p-3 text-white">
            <p className="text-sm opacity-90">{e.locationLabel}</p>
            <h4 className="text-base font-semibold leading-snug">{e.title}</h4>
          </div>
        </Link>
      ))}
    </div>
  )
}
