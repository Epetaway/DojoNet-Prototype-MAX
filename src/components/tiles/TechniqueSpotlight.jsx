import React from 'react'
import { useInView } from '../../lib/useInView'
import { PlayCircle, Sparkles } from 'lucide-react'
import { getPlaceholders, FALLBACK_SRC } from '../../lib/placeholders'
import AttributionBadge from '../AttributionBadge.jsx'
import BentoCard from '../BentoCard'

export default function TechniqueSpotlight(){
  const { ref, visible } = useInView()
  const tech = { name:'Armbar from Guard', desc:'Fundamentals of angle creation and hip engagement to finish cleanly.', thumb: null }
  return (
  <div ref={ref} className={`fade-in ${visible? 'visible':''}`}>
    <BentoCard title="Technique Spotlight" subtitle="One technique worth drilling this week">
      <div className="rounded-xl overflow-hidden relative group bg-fallback-dark">
        <SpotlightImage/>
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayCircle className="text-white drop-shadow-lg" size={48} />
        </div>
      </div>
        <div className="mt-3">
          <div className="text-sm font-medium text-[var(--color-text)]">{tech.name}</div>
          <div className="text-xs text-[var(--color-text-muted)] line-clamp-2">{tech.desc}</div>
        </div>
    </BentoCard>
  </div>
  )
}

function SpotlightImage(){
  const [src, setSrc] = React.useState(null)
  const [item, setItem] = React.useState(null)
  React.useEffect(()=>{ (async()=>{ 
    let list = await getPlaceholders('bento'); 
    if(!Array.isArray(list) || list.length===0){ list = await getPlaceholders('events') }
    if(Array.isArray(list) && list[0]){ setSrc(list[0].src || null); setItem(list[0]) }
  })() },[])
  return (
    <div className="w-full aspect-[4/3] bg-fallback-dark relative">
      <img src={src || FALLBACK_SRC} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e)=>{ if(e.currentTarget.src!==FALLBACK_SRC){ e.currentTarget.src = FALLBACK_SRC } }} />
      <div className="absolute inset-0 bg-black/30" />
      {item && <AttributionBadge item={item} />}
    </div>
  )
}