import React from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function AggregatedEventCard({ event, onClick }) {
  const dateStr = event.start ? new Date(event.start).toLocaleDateString() : 'TBA'
  const location = [event.venue?.city, event.venue?.state].filter(Boolean).join(', ') || 'Location TBA'
  const imageUrl = event.imageUrl || event.thumbUrl || event.previewImage
  const hasDistance = event.distanceKm != null && Number.isFinite(event.distanceKm)
  const distanceMiles = hasDistance ? Math.round(event.distanceKm * 0.621371) : null

  return (
    <div
      onClick={onClick}
      className="overflow-hidden rounded-xl ring-1 ring-zinc-200/60 dark:ring-zinc-800 hover:ring-zinc-400 dark:hover:ring-zinc-600 transition cursor-pointer group"
    >
      {/* Cover Image */}
      <div className="relative h-44">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="" 
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900"/>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"/>
        
        {/* Verified Badge */}
        {event.verified && (
          <div className="absolute top-2 right-2 bg-emerald-500/90 text-white text-[10px] leading-4 px-2 py-1 rounded-full flex items-center gap-1 shadow">
            <CheckCircle2 size={12} /> <span>Verified</span>
          </div>
        )}
        
        {/* Distance Badge */}
        {hasDistance && (
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full shadow">
            {distanceMiles} mi
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Host Avatar + Title */}
        <div className="flex items-start gap-2">
          {event.hostAvatar && (
            <img 
              src={event.hostAvatar} 
              alt="" 
              className="h-6 w-6 rounded-full ring-1 ring-zinc-200/50 dark:ring-zinc-700/50 shrink-0 mt-0.5"
            />
          )}
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 flex-1">
            {event.title}
          </h3>
        </div>

        {/* Location & Date */}
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1">
            <span>📍</span>
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span>📅</span>
            <span>{dateStr}</span>
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag, idx) => (
              <span 
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="mt-3 flex gap-2">
          {event.registerUrl ? (
            <a 
              href={event.registerUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-1.5 text-xs font-medium hover:opacity-90 transition"
            >
              Register
            </a>
          ) : (
            <button
              className="rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3 py-1.5 text-xs font-medium hover:opacity-90 transition"
            >
              Details
            </button>
          )}
          
          {/* Source Badge */}
          {event.sourceKey && event.sourceKey !== 'local' && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 self-center ml-auto">
              via {event.sourceKey}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
