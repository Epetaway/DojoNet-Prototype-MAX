
import React from 'react'
import { Link } from 'react-router-dom'
import { pickPlaceholder, FALLBACK_SRC } from '../lib/placeholders'
import { useStore } from '../app/store'
import { Button } from '../components'

export default function Explore(){
  const { users, session, follow } = useStore()
  const me = users.find(u => u.id===session.userId)
  const [phAvatars, setPhAvatars] = React.useState({})
  React.useEffect(()=>{ let mounted=true; (async()=>{
    const map = {}
    for(const u of users){ const pick = await pickPlaceholder('avatars', u.id || u.name); if(!mounted) return; if(pick?.src) map[u.id] = pick.src }
    if(mounted) setPhAvatars(map)
  })(); return ()=>{ mounted=false } }, [users])
  return (
    <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
      {users.map(u => (
        <div key={u.id} className="card p-4">
          <div className="flex items-center gap-3">
            <AvatarWithFallback src={u.avatar} fallback={phAvatars[u.id] || ''} />
            <div className="flex-1">
              <Link to={`/profile/${u.id}`} className="font-medium hover:underline">{u.name}</Link>
              <div className="text-xs text-[var(--color-text-muted)]">{u.rank} • {u.location}</div>
            </div>
          </div>
          <div className="mt-3 text-sm text-[var(--color-text-muted)] line-clamp-2">{u.bio || 'No bio yet'}</div>
          <div className="mt-4 flex justify-between items-center">
            <span className="text-xs text-[var(--color-text-muted)]">{u.followers.length} followers</span>
            {me && me.id!==u.id && (
              <Button onClick={()=>follow(me.id, u.id)}>Follow</Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function AvatarWithFallback({ src, fallback }){
  const [val, setVal] = React.useState(src||'')
  const [err, setErr] = React.useState(false)
  React.useEffect(()=>{ setErr(false); setVal(src||'') }, [src])
  React.useEffect(()=>{ if(err){ if(fallback && val!==fallback){ setVal(fallback) } else if(val!==FALLBACK_SRC){ setVal(FALLBACK_SRC) } } }, [err, fallback, val])
  return <img src={val || fallback || FALLBACK_SRC} alt="" aria-hidden="true" className="avatar avatar-lg" onError={()=>setErr(true)} />
}
