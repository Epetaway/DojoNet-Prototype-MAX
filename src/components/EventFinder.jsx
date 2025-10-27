import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Button } from './index'

function ttlGet(key){
  try{ const v = JSON.parse(localStorage.getItem(key)); if(!v) return null; if(v.expiresAt && Date.now()>v.expiresAt){ localStorage.removeItem(key); return null } return v.value ?? null }catch{ return null }
}
function ttlSet(key, value, days=7){ const expiresAt = Date.now()+days*24*60*60*1000; localStorage.setItem(key, JSON.stringify({ value, expiresAt })) }

export default function EventFinder({ onResults }){
  const [asked, setAsked] = useState(!!ttlGet('geo'))
  const [zip, setZip] = useState(ttlGet('geo')?.zip || '')
  const [type, setType] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    if(asked) return
    if(!('geolocation' in navigator)) return setAsked(true)
    navigator.geolocation.getCurrentPosition((pos)=>{
      ttlSet('geo', { lat: pos.coords.latitude, lon: pos.coords.longitude })
      setAsked(true)
    }, ()=>{ setAsked(true) }, { timeout: 3000 })
  }, [asked])

  async function search(){
    setLoading(true)
    try{
      const list = await api('GET', '/events')
      const results = list.filter(e => (!type || e.type===type) && (!from || new Date(e.date)>=new Date(from)) && (!to || new Date(e.date)<=new Date(to)))
      onResults(results)
      if(zip) ttlSet('geo', { zip })
    }catch{
      onResults([])
    }finally{ setLoading(false) }
  }

  return (
    <section className="mt-4 card p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="text-sm text-[var(--color-text-muted)]">
          {!ttlGet('geo') ? 'Enable location or enter ZIP' : 'Location saved'}
        </div>
        <input inputMode="numeric" pattern="[0-9]*" placeholder="ZIP" aria-label="ZIP code" className="input w-28" value={zip} onChange={e=>setZip(e.target.value)} />
        <select aria-label="Type" className="input" value={type} onChange={e=>setType(e.target.value)}>
          <option value="">Any type</option>
          <option value="Sparring">Sparring</option>
          <option value="Tournament">Tournament</option>
          <option value="Seminar">Seminar</option>
          <option value="Workshop">Workshop</option>
        </select>
  <label className="text-sm">From <input type="date" aria-label="From date" className="input" value={from} onChange={e=>setFrom(e.target.value)} /></label>
  <label className="text-sm">To <input type="date" aria-label="To date" className="input" value={to} onChange={e=>setTo(e.target.value)} /></label>
        <Button className="ml-auto h-10" onClick={search} loading={loading}>
          {loading ? 'Searching…' : 'Find events near me'}
        </Button>
      </div>
    </section>
  )
}
