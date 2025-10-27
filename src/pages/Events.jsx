
import React, { useEffect, useState } from 'react'
import { searchEvents } from '../lib/eventsApi'
import { EventCoverCard } from '../components/EventCoverCard.tsx'
import { useNavigate } from 'react-router-dom'

export default function Events(){
  const [agg, setAgg] = useState([])
  const [lat, setLat] = useState(null)
  const [lng, setLng] = useState(null)
  const [zip, setZip] = useState('')
  const [region, setRegion] = useState('new-york')
  const [radiusKm, setRadiusKm] = useState(80)
  const [kinds, setKinds] = useState('BJJ,Judo,Seminar')
  const today = new Date().toISOString().slice(0,10)
  const in60 = new Date(Date.now()+1000*60*60*24*60).toISOString().slice(0,10)
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(in60)
  const nav = useNavigate()

  const useMyLocation = () => {
    if(!navigator.geolocation){ alert('Geolocation not supported'); return }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setRegion('') // clear region since we have coords
        setZip('')
      },
      err => { alert(`Location error: ${err.message}`) }
    )
  }

  const handleZipChange = async (val) => {
    setZip(val)
    if(/^\d{5}$/.test(val)){
      try{
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${val}&country=US&limit=1`)
        const list = await res.json()
        if(list.length){
          setLat(Number(list[0].lat))
          setLng(Number(list[0].lon))
          setRegion('')
        }
      }catch{}
    }
  }

  // Single aggregated search only (no local/dummy events)
  useEffect(()=>{
    let mounted = true
    const params = { radiusKm, kinds, from, to }
    if(lat!=null && lng!=null){ params.lat = lat; params.lng = lng }
    else if(region){ params.region = region }
    searchEvents(params)
      .then(res => { if(mounted) setAgg(Array.isArray(res?.items)?res.items:[]) })
      .catch(()=>{ if(mounted) setAgg([]) })
    return ()=>{ mounted=false }
  }, [lat, lng, region, radiusKm, kinds, from, to])

  // Removed legacy createEvent flow and local POST /events usage

  return (
    <div className="max-w-6xl mx-auto px-4">
            <div className="card p-4 mb-6">
        <h2 className="text-lg font-heading uppercase">Find Events Near You</h2>
        <div className="mt-3 grid md:grid-cols-7 gap-3 text-sm">
          <input className="input" aria-label="ZIP" value={zip} onChange={e=>handleZipChange(e.target.value)} placeholder="ZIP (auto-locates)" />
          <input className="input" aria-label="City/Region" value={region} onChange={e=>{setRegion(e.target.value);setLat(null);setLng(null);setZip('')}} placeholder="City or region" />
          <button type="button" onClick={useMyLocation} className="px-3 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-surface)] text-xs hover:opacity-90 font-medium">Use My Location</button>
          <select className="input" aria-label="Radius" value={radiusKm} onChange={e=>setRadiusKm(Number(e.target.value))}>
            <option value={25}>25 miles</option>
            <option value={50}>50 miles</option>
            <option value={80}>80 miles</option>
            <option value={160}>100+ miles</option>
          </select>
          <input className="input" aria-label="Kinds" value={kinds} onChange={e=>setKinds(e.target.value)} placeholder="Kinds (comma)" />
          <input className="input" aria-label="From" type="date" value={from} onChange={e=>setFrom(e.target.value)} />
          <input className="input" aria-label="To" type="date" value={to} onChange={e=>setTo(e.target.value)} />
        </div>
        {lat!=null && lng!=null && (
          <div className="mt-2 text-xs text-[var(--color-text-muted)]">Using your location: {lat.toFixed(2)}, {lng.toFixed(2)}</div>
        )}
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agg.map(ev => (
            <div
              key={ev.id}
              onClick={() => nav(`/event/${ev.id}`, { state: { event: ev } })}
              className="cursor-pointer"
            >
              <EventCoverCard 
                id={ev.id}
                title={ev.title}
                dateLabel={ev.start ? new Date(ev.start).toLocaleDateString(undefined, { month:'short', day:'numeric' }) : 'TBA'}
                locationLabel={ev.venue ? [ev.venue.city, ev.venue.state].filter(Boolean).join(', ') : 'Location TBA'}
                imageUrl={ev.imageUrl || ev.previewImage || ''}
                hostAvatarUrl={ev.hostAvatar || ev.hostAvatarUrl || ''}
              />
            </div>
          ))}
          {!agg.length && (
            <div className="text-xs text-[var(--color-text-muted)]">No matches. Try adjusting filters.</div>
          )}
        </div>
      </div>
    </div>
  )
}
