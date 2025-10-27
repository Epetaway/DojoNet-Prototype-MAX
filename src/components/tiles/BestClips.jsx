import React from 'react'
import { Play, Video } from 'lucide-react'
import { useInView } from '../../lib/useInView'
import { getPlaceholders, FALLBACK_SRC } from '../../lib/placeholders'
import AttributionBadge from '../AttributionBadge.jsx'
import BentoCard from '../BentoCard'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay, Keyboard, A11y, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

export default function BestClips(){
  const { ref, visible } = useInView()
  const [clips, setClips] = React.useState([
    { id:'c1', title:'Guard Pass Series', user:'Maria', views: 1240, src:null, _credit:null },
    { id:'c2', title:'Low Kick Timing', user:'Lee', views: 980, src:null, _credit:null },
    { id:'c3', title:'Side Control Basics', user:'Jason', views: 745, src:null, _credit:null },
  ])
  const [paused, setPaused] = React.useState(false)

  // Load bento placeholders and assign to clips
  React.useEffect(()=>{ (async()=>{
    let list = await getPlaceholders('bento')
    if(!Array.isArray(list) || list.length===0){
      // Fallback to events placeholders when bento is empty
      list = await getPlaceholders('events')
    }
    if(Array.isArray(list) && list.length){
      setClips(prev => prev.map((c, idx)=>{
        const it = list[idx % list.length]
        return it ? { ...c, src: it.src || c.src, _credit: it } : c
      }))
    }
  })() }, [])

  const wrapRef = React.useRef(null)

  return (
    <div ref={ref} className={`fade-in ${visible? 'visible':''}`}>
      <BentoCard 
        title="Best Clips" 
        subtitle="Highlighting the top training clips"
        className="md:col-span-2"
      >

      <div
        ref={wrapRef}
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label="Best Clips"
        className="relative outline-none bg-fallback-dark -mx-4 md:-mx-5 -mb-4 md:-mb-5"
        onMouseEnter={()=>setPaused(true)}
        onMouseLeave={()=>setPaused(false)}
      >
        <Swiper
          modules={[Pagination, Autoplay, Keyboard, A11y, EffectFade]}
          pagination={{ clickable: true, dynamicBullets: true }}
          keyboard={{ enabled: true }}
          autoplay={clips.length > 1 ? { delay: 7000, disableOnInteraction: false, pauseOnMouseEnter: false } : false}
          loop={clips.length > 1}
          loopAdditionalSlides={0}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          slidesPerView={1}
          className="w-full aspect-video"
        >
          {clips.map((clip)=> (
            <SwiperSlide key={clip.id} className="!aspect-video">
              <div className="w-full aspect-video bg-fallback-dark relative">
                <img src={clip?.src || FALLBACK_SRC} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e)=>{ if(e.currentTarget.src!==FALLBACK_SRC){ e.currentTarget.src = FALLBACK_SRC } }} />
                <div className="absolute inset-0 bg-black/25" />
                {clip?._credit && <AttributionBadge item={clip._credit} />}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-3 shadow-lg">
                    <Play size={24} className="text-black" fill="currentColor" />
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-sm font-medium text-white truncate">{clip.title}</p>
                  <p className="text-xs text-white/80">{clip.user} • {clip.views.toLocaleString()} views</p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </BentoCard>
  </div>
  )
}
