// EventsNearYou: Section displaying event cover cards in a grid
import React from 'react'
import { EventCoverCard } from './EventCoverCard'

type Event = {
  id: string
  title: string
  dateLabel: string
  locationLabel: string
  imageUrl: string
  hostAvatarUrl?: string
}

// Helper to format event data from JSON
export const toEventCard = (e: any): Event => ({
  id: e.id,
  title: e.title,
  dateLabel: new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  locationLabel: `${e.location.city}, ${e.location.state}`,
  imageUrl: e.imageUrl ?? '/images/events/placeholder.jpg',
  hostAvatarUrl: e.hostAvatarUrl ?? '/placeholders/host.png'
})

// Default demo events
const defaultEvents: Event[] = [
  {
    id: 'evt-1',
    title: 'IBJJF New Jersey Fall Open (No-Gi)',
    dateLabel: 'Nov 22',
    locationLabel: 'Secaucus, NJ',
    imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&auto=format&fit=crop',
    hostAvatarUrl: '/placeholders/host.png',
  },
  {
    id: 'evt-2',
    title: 'NAGA Hillsborough – Gi / No-Gi',
    dateLabel: 'Nov 22',
    locationLabel: 'Hillsborough, NJ',
    imageUrl: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&auto=format&fit=crop',
    hostAvatarUrl: '/placeholders/host.png',
  },
  {
    id: 'evt-3',
    title: 'Open Mat – Saturday Roll',
    dateLabel: 'Sat 10am',
    locationLabel: 'Parsippany, NJ',
    imageUrl: 'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&auto=format&fit=crop',
  },
]

interface EventsNearYouProps {
  events?: Event[]
}

export default function EventsNearYou({ events = defaultEvents }: EventsNearYouProps) {
  return (
    <section className="px-4 md:px-6 lg:px-8 py-10" aria-labelledby="events-title">
      <div className="mx-auto max-w-6xl">
        <h2 id="events-title" className="pb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Events near you
        </h2>
        <div className="border-b border-zinc-200 dark:border-zinc-800 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {events.map((e) => (
            <EventCoverCard {...{ key: e.id, ...e }} />
          ))}
        </div>
      </div>
    </section>
  )
}
