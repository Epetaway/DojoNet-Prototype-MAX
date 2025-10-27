import React from 'react'
import { useStore } from '../../app/store'
import { useInView } from '../../lib/useInView'
import { getPlaceholders, FALLBACK_SRC } from '../../lib/placeholders'
import BentoCard from '../BentoCard'

export default function NewMembers(){
  const { users, session } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const raw = users.slice(-6)
  const [ph, setPh] = React.useState([])
  React.useEffect(()=>{ (async()=>{ const list = await getPlaceholders('avatars'); setPh(list) })() },[])
  const list = raw.map((u,idx)=>{
    const it = ph[idx]
    return {
      ...u,
      _ph: it,
      _avatarSrc: u.avatar || it?.src || ''
    }
  })
  const { ref, visible } = useInView()
  
  return (
    <div ref={ref} className={`fade-in ${visible? 'visible':''}`}>
      <BentoCard title="New members" subtitle="Say hello and connect">
        {/* 3x2 grid of hoverable avatar cards */}
        <div className="grid grid-cols-3 gap-3 w-fit mx-auto">
          {list.slice(0,6).map((m) => (
                      <a 
            key={m.id}
            href={`/user/${m.id}`}
            className="group relative aspect-square w-[105px] h-[105px] rounded-xl overflow-hidden bg-[var(--color-bg)] hover:ring-2 hover:ring-[var(--color-text-muted)] transition-all duration-200"
          >
              {/* Avatar image */}
              <img
                src={m._avatarSrc || FALLBACK_SRC}
                alt={m.name}
                className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-110"
                loading="lazy"
                onError={(e)=>{ if(e.currentTarget.src!==FALLBACK_SRC){ e.currentTarget.src = FALLBACK_SRC } }}
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute inset-x-0 bottom-0 p-2">
                  <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                  <p className="text-[10px] text-white/80 truncate">@{m.name.toLowerCase().replace(/\s+/g, '_')}</p>
                  <p className="text-[10px] text-white/70 mt-0.5">{m.rank}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </BentoCard>
    </div>
  )
}
