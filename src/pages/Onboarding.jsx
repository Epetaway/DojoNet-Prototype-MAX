import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Stepper from '../components/onboarding/Stepper.jsx'
import InterestChip from '../components/onboarding/InterestChip.jsx'
import { INTERESTS, BELT_ARTS, artHasBelts } from '../lib/interests'
import { useStore } from '../app/store'
import { USE_BACKEND, api } from '../lib/api'
import { Button } from '../components'

function ttlGet(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback }catch{ return fallback } }
function ttlSet(key, val){ localStorage.setItem(key, JSON.stringify(val)) }

export default function Onboarding(){
  const nav = useNavigate()
  const { session, users, updateUser } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const [step, setStep] = useState(1)

  // Step 2 — Basic Profile
  const [name, setName] = useState(me?.name || '')
  const [username, setUsername] = useState(ttlGet('ob_username',''))
  const [location, setLocation] = useState(ttlGet('ob_location',''))
  const [userErr, setUserErr] = useState('')
  const usernameAvailable = useMemo(()=> username.length>=3 && /^[a-z0-9_-]+$/i.test(username), [username])

  // Step 3 — Top-3 interests
  const [query, setQuery] = useState('')
  const [top3, setTop3] = useState(ttlGet('ob_top3', []))
  const filtered = INTERESTS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))

  // Step 4 — Practice claims
  const [selectedArts, setSelectedArts] = useState(ttlGet('ob_practice', []))

  function toggleTop(key){
    setTop3(prev => {
      const has = prev.includes(key)
      if(has) return prev.filter(k=>k!==key)
      if(prev.length>=3) return prev
      return [...prev, key]
    })
  }

  function togglePractice(key){
    setSelectedArts(prev => prev.some(p=>p.artKey===key) ? prev.filter(p=>p.artKey!==key) : [...prev, { artKey:key, rank:'', years:'', gymName:'', gymEmail:'' }])
  }

  function updatePractice(key, patch){
    setSelectedArts(prev => prev.map(p => p.artKey===key ? { ...p, ...patch } : p))
  }

  function next(){
    if(step===2){
      if(!usernameAvailable){ setUserErr('Username must be 3+ chars, letters/numbers/_- only.'); return }
      ttlSet('ob_username', username); ttlSet('ob_location', location)
      if(me) updateUser(me.id, { name, location })
    }
    if(step===3){ ttlSet('ob_top3', top3) }
    if(step===4){ ttlSet('ob_practice', selectedArts) }
    setStep(s => Math.min(5, s+1))
  }

  function skip(){ setStep(s => Math.min(5, s+1)) }

  async function finish(){
    // Create pending verification "requests" in localStorage for demo
    if(me){
  const requests = selectedArts.filter(a=>a.gymEmail).map(a => ({
        id: 'vr_'+Math.random().toString(36).slice(2,9),
        userId: me.id,
        artKey: a.artKey,
        claimRank: a.rank || null,
        claimYears: a.years ? Number(a.years) : null,
  gymName: a.gymName || '',
  gymEmail: a.gymEmail,
        status: 'PENDING'
      }))
      localStorage.setItem(`verifications_${me.id}`, JSON.stringify(requests))
      if(USE_BACKEND){
  try{ await api('POST','/claims',{ userId: me.id, arts: selectedArts.map(a=>({ artKey:a.artKey, rank:a.rank||null, years: a.years?Number(a.years):null, gymEmail:a.gymEmail||'', gymName:a.gymName||'' })) }) }catch{}
      }
    }
    nav('/dashboard')
  }

  return (
    <div className="mx-auto max-w-[720px] px-6 py-8">
      <Stepper step={Math.min(step,5)} total={5} />

      {step===1 && (
        <div className="card p-6">
          <h1 className="text-xl font-heading uppercase">Let’s set up your dojo profile.</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">You can skip any step and finish later.</p>
          <div className="mt-6 flex gap-3">
            <Button className="h-11 px-4" onClick={next}>Continue</Button>
            <Button variant="outline" className="h-11 px-4" onClick={skip}>Skip for now</Button>
          </div>
        </div>
      )}

      {step===2 && (
        <div className="card p-6 space-y-3">
          <h2 className="text-lg font-medium">Basic Profile</h2>
          <input className="input" aria-label="Name" value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
          <div>
            <label className="text-sm block mb-1">Username</label>
            <input className="input" aria-label="Username" value={username} onChange={e=>{setUsername(e.target.value); setUserErr('')}} placeholder="username" />
            <div className="text-xs text-[var(--color-text-muted)] mt-1">Slug: @{username || 'yourname'}</div>
            {!!userErr && <div className="text-xs text-red-600 mt-1">{userErr}</div>}
          </div>
          <input className="input" aria-label="Location" value={location} onChange={e=>setLocation(e.target.value)} placeholder="City, State / Country" />
          <div className="pt-2">
            <Button className="h-11 px-4" onClick={next}>Continue</Button>
          </div>
        </div>
      )}

      {step===3 && (
        <div className="card p-6">
          <h2 className="text-lg font-medium">Pick your Top‑3 interests</h2>
          <p className="text-sm text-[var(--color-text-muted)]">We’ll personalize your feed with these.</p>
          <input className="input mt-3" aria-label="Search interests" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search arts" />
          <div className="mt-4 flex flex-wrap gap-2">
            {filtered.map(i => (
              <InterestChip key={i.key} icon={i.icon} label={i.label} active={top3.includes(i.key)} onClick={()=>toggleTop(i.key)} />
            ))}
          </div>
          <div className="mt-4 text-xs text-[var(--color-text-muted)]">Selected: {top3.length}/3</div>
          <div className="pt-2">
            <Button className="h-11 px-4" disabled={top3.length!==3} onClick={next}>Continue</Button>
          </div>
        </div>
      )}

      {step===4 && (
        <div className="card p-6">
          <h2 className="text-lg font-medium">What do you practice?</h2>
          <p className="text-sm text-[var(--color-text-muted)]">Add your styles, ranks or years, and your affiliation (optional).</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {INTERESTS.map(i => (
              <InterestChip key={i.key} icon={i.icon} label={i.label} active={selectedArts.some(a=>a.artKey===i.key)} onClick={()=>togglePractice(i.key)} />
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {selectedArts.map(a => (
              <div key={a.artKey} className="p-3 rounded-lg border" style={{borderColor:'var(--color-border)'}}>
                <div className="text-sm font-medium mb-2">{INTERESTS.find(i=>i.key===a.artKey)?.label}</div>
                {artHasBelts(a.artKey) ? (
                  <select className="input" aria-label="Rank" value={a.rank} onChange={e=>updatePractice(a.artKey, { rank:e.target.value, years:'' })}>
                    <option value="">Select rank</option>
                    {BELT_ARTS[a.artKey].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                ) : (
                  <input className="input" aria-label="Years training" inputMode="numeric" placeholder="Years training" value={a.years} onChange={e=>updatePractice(a.artKey, { years:e.target.value, rank:'' })} />
                )}
                <div className="mt-2 grid md:grid-cols-2 gap-2">
                  <input className="input" aria-label="Affiliation (gym or school)" placeholder="Affiliation (gym or school)" value={a.gymName} onChange={e=>updatePractice(a.artKey, { gymName:e.target.value })} />
                  <input className="input" aria-label="Affiliation contact email" placeholder="Affiliation contact email" value={a.gymEmail} onChange={e=>updatePractice(a.artKey, { gymEmail:e.target.value })} />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2">
            <Button className="h-11 px-4" onClick={next}>Continue</Button>
          </div>
        </div>
      )}

      {step===5 && (
        <div className="card p-6">
          <h2 className="text-lg font-medium">Review & Submit</h2>
          <p className="text-sm text-[var(--color-text-muted)]">We’ll email your affiliation contact to confirm your affiliation and rank/experience.</p>
          <div className="mt-3 space-y-3">
            {selectedArts.map(a => (
              <div key={a.artKey} className="p-3 rounded-lg border" style={{borderColor:'var(--color-border)'}}>
                <div className="text-sm"><strong>{INTERESTS.find(i=>i.key===a.artKey)?.label}</strong> — {a.rank || (a.years ? `${a.years} years` : 'Unspecified')}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{a.gymName || 'No gym'} • {a.gymEmail || 'no email'}</div>
                <div className="text-xs mt-1 text-[var(--color-text-muted)]">Status: Pending verification</div>
              </div>
            ))}
          </div>
          <div className="pt-3 flex gap-3">
            <Button variant="outline" className="h-11 px-4" onClick={()=>setStep(4)}>Back</Button>
            <Button className="h-11 px-4" onClick={finish}>Finish & Go to Dashboard</Button>
          </div>
        </div>
      )}
    </div>
  )
}
