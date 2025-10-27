// EventCoverCard: Cover-style event card with image, gradient overlay, and metadata
import React from 'react'
import { MapPin, Calendar } from 'lucide-react'

type Event = {
  id: string
  title: string
  dateLabel: string   // e.g. "Nov 22" or "3d"
  locationLabel: string // e.g. "Secaucus, NJ"
  imageUrl: string
  hostAvatarUrl?: string
}

export function EventCoverCard({
  title,
  dateLabel,
  locationLabel,
  imageUrl,
  hostAvatarUrl = '/placeholders/host.png',
}: Event) {
  return (
    <article
      className="relative h-72 md:h-80 lg:h-96 w-full overflow-hidden rounded-3xl shadow-lg ring-1 ring-zinc-200/60 dark:ring-zinc-800 bg-zinc-900 group cursor-pointer"
      aria-label={title}
    >
      {/* Background image */}
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        loading="lazy"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0" />
      <div className="absolute inset-0 bg-zinc-900/10 mix-blend-multiply" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col text-white p-6 md:p-8">
        <h3 className="mt-auto text-2xl md:text-3xl font-bold leading-tight drop-shadow-sm">
          {title}
        </h3>

        <ul className="mt-4 flex items-center gap-4 text-sm text-white/90">
          <li className="me-auto">
            <img
              src={hostAvatarUrl}
              alt=""
              className="h-8 w-8 rounded-full ring-2 ring-white/70"
              loading="lazy"
            />
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 opacity-90" aria-hidden="true" />
            <small className="font-medium">{locationLabel}</small>
          </li>
          <li className="flex items-center gap-2">
            <Calendar className="h-4 w-4 opacity-90" aria-hidden="true" />
            <small className="font-medium">{dateLabel}</small>
          </li>
        </ul>
      </div>

      {/* Focus state */}
      <span className="absolute inset-0 ring-0 focus-visible:ring-2 focus-visible:ring-rose-500 rounded-3xl" />
    </article>
  )
}
