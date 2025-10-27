import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../app/store'
import { USE_BACKEND, api } from '../../lib/api'
import { Skeleton } from '../index'

export default function PeopleSuggestions(){
  const { users, session } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const [remote, setRemote] = useState(null)
  useEffect(()=>{
    let mounted=true
    async function load(){
      if(!USE_BACKEND || !me){ setRemote(null); return }
      try{ const data = await api('GET', `/user/suggestions?userId=${me.id}`); if(mounted) setRemote(data) }catch{ if(mounted) setRemote(null) }
    }
    load(); return ()=>{ mounted=false }
  }, [me?.id])
  const suggestions = remote?.suggestions ?? users.filter(u=>me && u.id!==me.id).slice(0,5)
  return (
    <div className="card p-4">
      <div className="text-sm font-medium">People you may know</div>
      {!remote && USE_BACKEND && me ? (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2"><Skeleton className="avatar-skeleton h-7 w-7" /><Skeleton className="h-4 w-32" /></div>
          <div className="flex items-center gap-2"><Skeleton className="avatar-skeleton h-7 w-7" /><Skeleton className="h-4 w-40" /></div>
          <div className="flex items-center gap-2"><Skeleton className="avatar-skeleton h-7 w-7" /><Skeleton className="h-4 w-28" /></div>
        </div>
      ) : (
      <ul className="mt-2 space-y-2">
        {suggestions.map(s => (
          <li key={s.id} className="flex items-center gap-2">
            <img src={s.avatar} alt="" aria-hidden="true" className="avatar h-7 w-7" />
            <Link to={`/profile/${s.id}`} className="text-sm">{s.name}</Link>
          </li>
        ))}
      </ul>
      )}
    </div>
  )
}
