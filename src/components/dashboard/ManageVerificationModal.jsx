import React, { useEffect, useState } from 'react'
import Modal from '../../components/Modal.jsx'
import { USE_BACKEND, api } from '../../lib/api'
import { Button } from '../index'

export default function ManageVerificationModal({ open, onClose, me, requests=[] }){
  const [list, setList] = useState(requests)
  useEffect(()=>{ setList(requests) }, [requests])

  function updateEmail(id, email){ setList(prev => prev.map(r => r.id===id ? { ...r, gymEmail: email } : r)) }
  async function save(){
    try{
      localStorage.setItem(`verifications_${me.id}`, JSON.stringify(list))
      if(USE_BACKEND){
        const arts = list.map(r => ({ artKey:r.artKey, rank:r.claimRank||null, years:r.claimYears||null, gymEmail:r.gymEmail||'', gymName:r.gymName||'' }))
        await api('POST','/claims',{ userId: me.id, arts })
      }
      onClose?.(true)
    }catch{ onClose?.(false) }
  }
  return (
    <Modal open={open} onClose={()=>onClose?.(false)} title="Manage Verification">
      <div className="space-y-3">
        {list.map(r => (
          <div key={r.id} className="p-3 rounded-lg border" style={{borderColor:'var(--color-border)'}}>
            <div className="text-sm font-medium">{r.gymName || 'Your affiliation'} — {r.artKey.toUpperCase?.()||r.artKey}</div>
            <div className="mt-2 grid md:grid-cols-2 gap-2">
              <input className="input" aria-label="Affiliation contact email" placeholder="Affiliation contact email" value={r.gymEmail||''} onChange={e=>updateEmail(r.id, e.target.value)} />
              <input className="input" aria-label="Affiliation name" placeholder="Affiliation name" value={r.gymName||''} onChange={e=>setList(prev=>prev.map(x=>x.id===r.id?{...x, gymName:e.target.value}:x))} />
            </div>
            <div className="mt-2 flex gap-2">
              <Button variant="outline" className="h-9" onClick={()=>alert('Upload evidence coming soon')}>Upload evidence</Button>
            </div>
          </div>
        ))}
        {!list.length && <div className="text-sm text-[var(--color-text-muted)]">No pending requests</div>}
        <div className="pt-2 flex gap-2 justify-end">
          <Button variant="outline" className="h-10" onClick={()=>onClose?.(false)}>Cancel</Button>
          <Button className="h-10" onClick={save}>Save & Resend</Button>
        </div>
      </div>
    </Modal>
  )
}
