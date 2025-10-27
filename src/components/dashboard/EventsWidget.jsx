import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, USE_BACKEND } from '../../lib/api'
import { searchEvents } from '../../lib/eventsApi'
import { Skeleton } from '../index'

export default function EventsWidget(){
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        if(USE_BACKEND){
          setLoading(true)
          const from = new Date().toISOString().slice(0,10)
          const to = new Date(Date.now()+1000*60*60*24*60).toISOString().slice(0,10)
          
          // Try to get user's saved location from localStorage
          const geo = JSON.parse(localStorage.getItem('geo')||'null')
          const lat = geo?.lat ?? geo?.latitude
          const lng = geo?.lon ?? geo?.lng ?? geo?.longitude
          const hasCoords = typeof lat==='number' && typeof lng==='number'
          
          // Use searchEvents API with location if available
          const params = { from, to, radiusKm: 160 }
          if(hasCoords){ params.lat = lat; params.lng = lng }
          else { params.region = 'new-york' }
          
          const result = await searchEvents(params)
          const items = Array.isArray(result?.items) ? result.items : []
          
          if(mounted) setEvents(items.slice(0,3))
        }
      }catch{}
      finally{ if(mounted) setLoading(false) }
    }
    load(); return ()=>{mounted=false}
  },[])
  return (
    <div className="card p-4">
      <div className="text-sm font-medium">Upcoming Events</div>
      {loading ? (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-48" /><span className="ml-auto"><Skeleton className="h-7 w-14" /></span></div>
          <div className="flex items-center gap-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-40" /><span className="ml-auto"><Skeleton className="h-7 w-14" /></span></div>
        </div>
      ) : !events.length ? (
        <div className="text-sm text-[var(--color-text-muted)] mt-2">No upcoming events</div>
      ) : (
        <ul className="mt-2 space-y-2">
          {events.map(e => (
            <li key={e.id} className="text-sm flex items-center gap-2 group">
              {/* Thumbnail + Host Avatar */}
              <div className="relative h-10 w-10 shrink-0 rounded overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-700">
                {(e.thumbUrl || e.imageUrl) && (
                  <img src={e.thumbUrl || e.imageUrl} alt="" className="h-full w-full object-cover" />
                )}
                {e.hostAvatar && (
                  <img 
                    src={e.hostAvatar} 
                    alt="" 
                    className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ring-2 ring-white dark:ring-zinc-900"
                  />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <Link to={`/event/${e.id}`} state={{ event: e }} className="link font-medium truncate block">{e.title||e.name}</Link>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {new Date(e.start || e.date || Date.now()).toLocaleDateString()}
                  {e.distanceKm != null && Number.isFinite(e.distanceKm) && (
                    <> • {Math.round(e.distanceKm * 0.621371)} mi</>
                  )}
                </span>
              </div>
              
              <Link 
                to={`/event/${e.id}`} 
                state={{ event: e }}
                className="ml-auto text-xs px-2 h-7 rounded border flex items-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition" 
                style={{borderColor:'var(--color-border)'}}
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
