
import React, { useEffect, useMemo, useState } from 'react'
import { useStore } from '../app/store'
import { useNavigate, Link } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import EventRail from '../components/EventRail.jsx'
import BentoGrid from '../components/BentoGrid.jsx'
import CTAJoin from '../components/CTAJoin.jsx'
import Footer from '../components/Footer.jsx'
import AuthGateModal from '../components/AuthGateModal.jsx'
import { searchEvents } from '../lib/eventsApi'

export default function Home(){
  const { session } = useStore()
  const nav = useNavigate()
  const [events, setEvents] = useState([])
  const [authGate, setAuthGate] = useState({ open:false, intent:null })

  function handlePrimary(evt){
    const to = `/event/${evt.id}`
    if(!session.userId){ setAuthGate({ open:true, intent:{ to, copy:'Create a free account to continue.' } }) }
    else { nav(to, { state: { event: evt } }) }
  }

  useEffect(()=>{
    // Load upcoming events from aggregated sources only
    const from = new Date().toISOString().slice(0,10)
    const to = new Date(Date.now()+1000*60*60*24*90).toISOString().slice(0,10)
    // Fallback to a region if no geolocation is set so we always show something
    const geo = JSON.parse(localStorage.getItem('geo')||'null')
    const lat = geo?.lat ?? geo?.latitude
    const lng = geo?.lon ?? geo?.lng ?? geo?.longitude
    const params = { from, to, radiusKm: 160 }
    if(typeof lat==='number' && typeof lng==='number'){ params.lat = lat; params.lng = lng }
    else { params.region = 'new-york' }
    searchEvents(params)
      .then(res => {
        const items = Array.isArray(res?.items) ? res.items : []
        const sorted = items.slice().sort((a,b)=>{
          return new Date(a.start || a.date || 0) - new Date(b.start || b.date || 0)
        })
        setEvents(sorted)
      })
      .catch(()=> setEvents([]))
  }, [])

  // Derive "near you" list (matches user state if available)
  const nearEvents = useMemo(()=>{
    if(!Array.isArray(events) || events.length===0) return []
    const users = useStore.getState().users
    const me = users.find(u => u.id === session.userId)
    const stateFromLocation = (loc)=>{
      if(!loc) return ''
      const m = String(loc).match(/,\s*([A-Z]{2})\b/)
      return m ? m[1] : ''
    }
    const myState = me ? stateFromLocation(me.location) : ''
    if(!myState) return events
    const filtered = events.filter(e => String(e?.location?.state||'').toUpperCase()===myState)
    return filtered.length ? filtered : events
  }, [events, session.userId])

  return (
    <main id="main">
      {/* Dev Helper Banner */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 text-center">
        <p className="text-sm font-medium">
          🚀 Testing Mode: <Link to="/test-profiles" className="underline font-bold hover:text-blue-100">View All User Profiles</Link>
          {' • '}
          <Link to="/u/u_demo" className="underline hover:text-blue-100">Demo Profile</Link>
          {' • '}
          <Link to="/dashboard" className="underline hover:text-blue-100">Dashboard</Link>
        </p>
      </div>

      <div className="mx-auto max-w-[1440px]">
        <Hero />
        
        {/* Events Near You - Cover Cards with Swiper */}
        <EventRail events={nearEvents} onPrimary={handlePrimary} />
        
        <div className="px-4 md:px-6 lg:px-8 text-sm text-zinc-500 dark:text-zinc-400 text-right max-w-6xl mx-auto">
          <Link to="/events" className="hover:text-brand transition-colors">View all events →</Link>
        </div>
      </div>
      
      <div className="mx-auto max-w-[1440px] px-6 mt-8">
        <BentoGrid />
        <CTAJoin />
      </div>
      
      <Footer />
      <AuthGateModal open={authGate.open} intent={authGate.intent} onClose={()=>setAuthGate({ open:false, intent:null })} />
    </main>
  )
}
