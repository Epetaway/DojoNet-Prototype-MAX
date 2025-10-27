import React from 'react'
import { Button } from './index'
import { CheckCircle2 } from 'lucide-react'
import { pickPlaceholder, FALLBACK_SRC, DEFAULT_EVENT_PLACEHOLDER } from '../lib/placeholders'
import AttributionBadge from './AttributionBadge.jsx'

export default function EventCard({ evt, onPrimary }){
  const [ph, setPh] = React.useState('')
  const [phItem, setPhItem] = React.useState(null)
  const [src, setSrc] = React.useState(evt?.imageUrl || evt?.previewImage || DEFAULT_EVENT_PLACEHOLDER)
  const [tried, setTried] = React.useState({ ph:false, fallback:false })

  React.useEffect(()=>{
    let mounted = true
    // Pick a deterministic placeholder per event so we can recover if a bad URL fails
    ;(async()=>{
      const pick = await pickPlaceholder('events', evt?.id || evt?.title)
      if(!mounted) return
      if(pick){
        setPh(pick.src || '')
        setPhItem(pick)
      } else {
        setPh('')
        setPhItem(null)
      }
    })()
    return ()=>{ mounted = false }
  }, [evt?.id, evt?.title, evt?.imageUrl, evt?.previewImage])

  // Keep src in sync with event prop changes
  React.useEffect(()=>{
    setTried({ ph:false, fallback:false })
    setSrc(evt?.imageUrl || evt?.previewImage || DEFAULT_EVENT_PLACEHOLDER)
  }, [evt?.imageUrl, evt?.previewImage])

  function handleImageError(){
    // Try placeholder once
    if(!tried.ph && ph && src !== ph){ setTried(s=>({...s, ph:true})); setSrc(ph); return }
    // Then try static fallback once
    if(!tried.fallback && src !== FALLBACK_SRC){ setTried(s=>({...s, fallback:true})); setSrc(FALLBACK_SRC); return }
    // Otherwise, do nothing to avoid loops
  }

  function handleClick(){ onPrimary?.(evt) }
  function onKey(e){ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); handleClick() } }

  const dateStr = evt.date ? new Date(evt.date).toLocaleString() : ''
  const locStr = evt.location
    ? `${evt.location.venue ? evt.location.venue + ' • ' : ''}${[evt.location.city, evt.location.state].filter(Boolean).join(', ')}`
    : `Hosted by ${evt.createdBy || 'Unknown'}${evt.affiliation ? ` • ${evt.affiliation}` : ''}`

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={onKey}
      onClick={handleClick}
      aria-label={`Event: ${evt.title}${dateStr ? ` on ${dateStr}`:''}${locStr ? ` at ${locStr}`:''}`}
      data-card-type="event"
      className="min-w-[280px] max-w-[320px] h-48 relative rounded-xl overflow-hidden cursor-pointer group shadow-[0_10px_28px_rgba(0,0,0,0.18)] bg-fallback-dark transition-transform duration-300 hover:scale-[1.01] hover:-translate-y-0.5"
    >
      <img
        src={src || ph || DEFAULT_EVENT_PLACEHOLDER}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        onError={handleImageError}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/35 to-transparent transition-opacity duration-300 group-hover:from-black/70" />
      {/* subtle shine on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
        style={{ background:'linear-gradient(120deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 80%)' }}
      />
      {/* verified ribbon */}
      {evt.verified && (
        <div className="absolute top-2 left-2 bg-emerald-500/90 text-white text-[10px] leading-4 px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
          <CheckCircle2 size={12} /> <span>Verified</span>
        </div>
      )}
      {phItem && ((!evt?.imageUrl && !evt?.previewImage) || (src===ph || src===phItem?.src)) && (
        <AttributionBadge item={phItem} />
      )}
      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
        <div className="text-[11px] opacity-90 truncate">{dateStr}</div>
        <div className="mt-0.5 font-medium truncate flex items-center gap-1" title={evt.title}>
          <span className="truncate">{evt.title}</span>
          {evt.verified && <CheckCircle2 size={14} className="text-emerald-400 drop-shadow shrink-0" aria-label="Verified" />}
        </div>
        <div className="text-[12px] opacity-90 truncate">{locStr}</div>
        <div className="mt-2 flex items-center justify-between">
          {Array.isArray(evt.tags) && evt.tags.length>0 ? (
            <div className="flex flex-wrap gap-1 text-[10px]">
              {evt.tags.slice(0,2).map(t => (
                <span key={t} className="px-1.5 py-0.5 rounded bg-white/15 text-white/95">{t}</span>
              ))}
            </div>
          ) : <span />}
          <Button
            variant="outline"
            className="h-7 px-3 text-white border-white/80 hover:border-white hover:bg-white/10"
            onClick={(e)=>{ e.stopPropagation(); handleClick() }}
          >
            {evt.cta || 'Details'}
          </Button>
        </div>
      </div>
    </div>
  )
}
