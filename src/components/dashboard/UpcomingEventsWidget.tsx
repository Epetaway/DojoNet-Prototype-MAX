// UpcomingEventsWidget: Show next 3 upcoming events with quick actions
import React from 'react'
import { Link } from 'react-router-dom'
import { Icon, icons } from '../../lib/icons'

interface Event {
  id: string
  title: string
  dateLabel: string
  locationLabel: string
  imageUrl: string
  hostAvatarUrl?: string
}

export default function UpcomingEventsWidget() {
  // Mock data - TODO: wire to real events from store/API
  const events: Event[] = [
    {
      id: 'evt_1',
      title: 'No-Gi Open Mat',
      dateLabel: 'Tomorrow, 6pm',
      locationLabel: 'AMA Fight Club',
      imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=400',
      hostAvatarUrl: 'https://i.pravatar.cc/100?img=68'
    },
    {
      id: 'evt_2',
      title: 'BJJ Competition Prep',
      dateLabel: 'Sat, 10am',
      locationLabel: 'Gracie Barra LA',
      imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400',
      hostAvatarUrl: 'https://i.pravatar.cc/100?img=12'
    },
    {
      id: 'evt_3',
      title: 'Muay Thai Sparring',
      dateLabel: 'Sun, 4pm',
      locationLabel: 'Tiger Muay Thai',
      imageUrl: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=400',
      hostAvatarUrl: 'https://i.pravatar.cc/100?img=33'
    }
  ].slice(0, 3)

  if (events.length === 0) return null

  return (
    <div className="card rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--color-text)]">Upcoming Events</h3>
        <Link 
          to="/events" 
          className="text-xs text-[var(--accent-primary)] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <Link
            key={event.id}
            to={`/events/${event.id}`}
            className="flex gap-3 p-2 rounded-lg hover:bg-[var(--color-bg)] transition group"
          >
            <div className="relative flex-shrink-0">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="h-16 w-16 rounded-lg object-cover ring-2 ring-[var(--color-border)]"
              />
              {event.hostAvatarUrl && (
                <img
                  src={event.hostAvatarUrl}
                  alt="Host"
                  className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full ring-2 ring-[var(--color-surface)] object-cover"
                />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-[var(--color-text)] truncate group-hover:text-[var(--accent-primary)]">
                {event.title}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                <Icon icon={icons.clock} className="h-3 w-3" />
                <span>{event.dateLabel}</span>
              </p>
              <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                <Icon icon={icons.location} className="h-3 w-3" />
                <span className="truncate">{event.locationLabel}</span>
              </p>
            </div>
          </Link>
        ))}
      </div>

      <Link
        to="/events"
        className="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition"
      >
        <Icon icon={icons.calendar} className="h-4 w-4" />
        <span>Browse All Events</span>
      </Link>
    </div>
  )
}
