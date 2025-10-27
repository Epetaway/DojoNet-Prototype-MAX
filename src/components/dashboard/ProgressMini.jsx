import React, { useEffect, useState } from 'react'
import { ProgressBar, Button } from '../index'
import { USE_BACKEND, api } from '../../lib/api'
import { useStore } from '../../app/store'

export default function ProgressMini(){
  const { users, session } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const [streak, setStreak] = useState(1)
  const [xp, setXp] = useState(30)
  const [last, setLast] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        if(USE_BACKEND && me){ const data = await api('GET',`/stats/progress?userId=${me.id}`); if(mounted){ setStreak(data.streak||1); setXp(data.xp||30); setLast(data.lastCheckIn||null) } }
        else { const s = Number(localStorage.getItem('streak')||'1'); const x = Number(localStorage.getItem('xp')||'30'); const l = localStorage.getItem('lastCheckIn')||null; if(mounted){ setStreak(s); setXp(x); setLast(l) } }
      }catch{}
    }
    load(); return ()=>{ mounted=false }
  },[me?.id])
  const todayKey = new Date().toISOString().slice(0,10)
  const checkedToday = last===todayKey
  async function checkIn(){
    if(busy || checkedToday) return
    setBusy(true)
    try{
      if(USE_BACKEND && me){
        const data = await api('POST','/stats/progress',{ userId: me.id, action:'checkin' })
        setStreak(data.streak||streak)
        setXp(data.xp||xp)
        setLast(data.lastCheckIn||todayKey)
      }else{
        const prevStreak = Number(localStorage.getItem('streak')||'0')
        const prevLast = localStorage.getItem('lastCheckIn')
        const yesterdayKey = new Date(Date.now()-86400000).toISOString().slice(0,10)
        const nextStreak = (prevLast===yesterdayKey) ? prevStreak+1 : 1
        const nextXp = Number(localStorage.getItem('xp')||'0') + 5
        localStorage.setItem('streak', String(nextStreak))
        localStorage.setItem('xp', String(nextXp))
        localStorage.setItem('lastCheckIn', todayKey)
        setStreak(nextStreak); setXp(nextXp); setLast(todayKey)
      }
    }finally{ setBusy(false) }
  }
  return (
    <div className="card p-4">
      <div className="text-sm font-medium">Progress</div>
      <div className="text-xs text-[var(--color-text-muted)]">{streak}‑day streak</div>
      <div className="mt-2"><ProgressBar value={xp} max={100} /></div>
      <div className="text-xs text-[var(--color-text-muted)] mt-1">XP to next rank</div>
      <div className="mt-3">
        <Button className="h-9" onClick={checkIn} loading={busy} disabled={busy || checkedToday}>
          {checkedToday ? 'Checked in today' : 'Check in'}
        </Button>
      </div>
    </div>
  )
}
