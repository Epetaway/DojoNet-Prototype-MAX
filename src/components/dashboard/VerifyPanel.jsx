import React from 'react'
import { USE_BACKEND, api } from '../../lib/api'
import { Button } from '../index'

export default function VerifyPanel({ me, requests = [], onRefresh }){
  if(!me) return null
  const pending = requests.filter(r => r.status==='PENDING')
  if(!pending.length) return null

  async function resend(){
    // For demo: re-POST the same claims (backend optional)
    try{
      if(USE_BACKEND){
        const arts = pending.map(r => ({ artKey:r.artKey, rank:r.claimRank||null, years:r.claimYears||null, gymEmail:r.gymEmail||'', gymName:r.gymName||'' }))
        await api('POST','/claims',{ userId: me.id, arts })
      }
      alert('Verification email resent (demo).')
    }catch{}
  }
  function changeEmail(){
    const email = prompt('Enter a new gym email to contact:')
    if(!email) return
    try{
      const key = `verifications_${me.id}`
      const list = JSON.parse(localStorage.getItem(key)||'[]')
      const next = list.map(r => ({ ...r, gymEmail: email }))
      localStorage.setItem(key, JSON.stringify(next))
      onRefresh?.()
    }catch{}
  }

  return (
    <div className="card p-4">
      <div className="text-sm font-medium">Verification pending</div>
      <div className="text-xs text-[var(--color-text-muted)] mt-1">
        We’ve emailed {pending[0].gymName || 'your gym'} to confirm your affiliation.
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" className="h-9" onClick={resend}>Resend</Button>
        <Button variant="outline" className="h-9" onClick={changeEmail}>Change email</Button>
        <Button variant="outline" className="h-9" onClick={()=>alert('Upload evidence coming soon')}>Upload evidence</Button>
      </div>
    </div>
  )
}
