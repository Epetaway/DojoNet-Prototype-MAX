import React, { useEffect, useMemo, useState } from 'react'
import { useInView } from '../../lib/useInView'
import BentoCard from '../BentoCard'
import { DEFAULT_EVENT_PLACEHOLDER } from '../../lib/placeholders'
import { searchEvents } from '../../lib/eventsApi'

export default function UpcomingEvents(){
  const { ref, visible } = useInView()
  const [events, setEvents] = useState([])
  const [images, setImages] = useState({})

  // Fetch aggregated events (fallback: empty)
  useEffect(()=>{
    const from = new Date().toISOString().slice(0,10)
    const to = new Date(Date.now()+1000*60*60*24*60).toISOString().slice(0,10)
    searchEvents({ region: 'new-york', from, to }).then(res => {
      const items = Array.isArray(res?.items) ? res.items : []
      setEvents(items)
    }).catch(()=> setEvents([]))
  }, [])
  
  // Preload event images if present (no random placeholders)
  useEffect(()=>{
    const imgs = {}
    for(const ev of events.slice(0,4)){
      if(ev.imageUrl) imgs[ev.id] = ev.imageUrl
      else if(ev.thumbUrl) imgs[ev.id] = ev.thumbUrl
    }
    setImages(imgs)
  }, [events])

  const list = useMemo(()=> events.slice(0,4), [events])
  
  const formatDate = (date) => {
    if (!date) return 'TBA'
    return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
  
  return (
    <div ref={ref} className={`fade-in ${visible? 'visible':''}`}>
      <BentoCard title="Upcoming events" subtitle="Based on your interests">
        <div className="overflow-y-auto max-h-[250px] scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent hover:scrollbar-thumb-zinc-400 dark:hover:scrollbar-thumb-zinc-600 pr-1">
          <ul className="space-y-3">
            {list.map(e => (
              <li
                key={e.id}
                className="flex items-center gap-3 rounded-lg hover:bg-[var(--color-elevated)] p-1 transition cursor-pointer"
                onClick={() => window.router?.navigate ? window.router.navigate(`/event/${e.id}`, { state: { event: e } }) : (location.href = `#/event/${e.id}`)}
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md relative">
                  {(e.thumbUrl || e.imageUrl || images[e.id]) ? (
                    <img src={(e.thumbUrl || e.imageUrl || images[e.id])} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-[var(--color-bg)]" />
                  )}
                  {/* Host Avatar Badge */}
                  {e.hostAvatar && (
                    <img 
                      src={e.hostAvatar} 
                      alt="" 
                      className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full avatar-ring"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{e.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {e.venue ? [e.venue.city, e.venue.state].filter(Boolean).join(', ') : 'Location TBA'} • {formatDate(e.start)}
                  </p>
                  {/* Distance badge */}
                  {e.distanceKm != null && Number.isFinite(e.distanceKm) && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {Math.round(e.distanceKm * 0.621371)} miles away
                    </p>
                  )}
                </div>
                <span className="ml-auto shrink-0 rounded-md bg-[var(--color-bg)] text-[var(--color-text)] px-2 py-1 text-xs">View</span>
              </li>
            ))}
            {!list.length && (
              <li className="py-3 text-xs text-[var(--color-text-muted)]">No upcoming events yet.</li>
            )}
          </ul>
        </div>
      </BentoCard>
    </div>
  )
}
