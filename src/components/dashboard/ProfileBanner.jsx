import React, { useMemo, useState } from 'react'
import { useStore } from '../../app/store'
import DojoEditorModal from './DojoEditorModal.jsx'
import { Skeleton, Button } from '../index'

export default function ProfileBanner(){
  const { users, session, updateUser } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const [tagline, setTagline] = useState(me?.status || '')
  const [open, setOpen] = useState(false)

  const username = useMemo(()=>{
    const u = (typeof window!=='undefined') ? (localStorage.getItem('ob_username')||'') : ''
    if(u) return u
    return String(me?.name||'user').toLowerCase().replace(/[^a-z0-9_-]/g,'').replace(/\s+/g,'')
  }, [me?.name])

  function saveTagline(){ if(me && tagline!==me.status){ updateUser(me.id, { status: tagline }) } }

  // Skeleton while user data hydrates
  if(session.userId && !me){
    return (
      <section className="md:col-span-12 card p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="avatar-skeleton avatar-xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="mt-2 h-4 w-56" />
            <div className="mt-3 flex items-center gap-3">
              <Skeleton className="h-10 w-full max-w-sm" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
        </div>
      </section>
    )
  }
  if(!me) return null

  // Compose claim summary from onboarding local selections
  let claimSummary = ''
  try{
    const sel = JSON.parse(localStorage.getItem('ob_practice')||'[]')
    if(Array.isArray(sel) && sel.length){
      const parts = sel.map(a => {
        const art = a.artKey?.toUpperCase?.() || a.artKey
        if(a.rank) return `${art} • ${a.rank}`
        if(a.years) return `${art} • ${a.years} years`
        return art
      })
      claimSummary = parts.join(' • ')
    }
  }catch{}

  // Gym badge — show verified or pending based on stored verification requests
  let gymBadge = null
  try{
    const reqs = JSON.parse(localStorage.getItem(`verifications_${me.id}`)||'[]')
    if(Array.isArray(reqs) && reqs.length){
      const anyApproved = reqs.some(r => r.status==='APPROVED')
      const first = reqs[0]
      gymBadge = anyApproved ? (
        <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">✅ {first.gymName||'Verified gym'}</span>
      ) : (
        <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">⏳ Pending {first.gymName||'gym'} confirmation</span>
      )
    }
  }catch{}

  return (
    <section className="md:col-span-12 card p-4">
      <div className="flex items-start gap-4">
  <img src={me.avatar} alt="" aria-hidden="true" className="avatar avatar-xl" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-lg font-medium truncate">{me.name}</div>
            <div className="text-xs text-[var(--color-text-muted)] truncate">@{username}</div>
            {gymBadge}
          </div>
          <div className="text-sm text-[var(--color-text-muted)] mt-1 truncate">{claimSummary || me.rank}</div>
          <div className="mt-3 flex items-center gap-3">
            <input className="input flex-1" aria-label="Tagline" placeholder="Today I’m training…" value={tagline} onChange={e=>setTagline(e.target.value)} onBlur={saveTagline} />
            <Button variant="outline" className="h-10" onClick={()=>setOpen(true)}>Edit Dojo Page</Button>
          </div>
          <DojoEditorModal open={open} onClose={()=>setOpen(false)} />
        </div>
      </div>
    </section>
  )
}
