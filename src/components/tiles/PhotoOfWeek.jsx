import React from 'react'
import { useInView } from '../../lib/useInView'
import { Image as ImageIcon } from 'lucide-react'
import { getPlaceholders, FALLBACK_SRC } from '../../lib/placeholders'
import AttributionBadge from '../AttributionBadge.jsx'
import BentoCard from '../BentoCard'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay, Keyboard, A11y, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
// Uses 'feed' placeholders for photo carousel, with gradient fallback

export default function PhotoOfWeek(){
  const { ref, visible } = useInView()
  const [photos, setPhotos] = React.useState([
    { src:null, caption:'Training rounds', user:'@community' },
    { src:null, caption:'Drilling fundamentals', user:'@community' },
    { src:null, caption:'Open mat energy', user:'@community' },
  ])
  React.useEffect(()=>{ (async()=>{
    let list = await getPlaceholders('feed')
    if(!Array.isArray(list) || list.length===0){
      // Fallback to events placeholders when feed is empty
      list = await getPlaceholders('events')
    }
    if(Array.isArray(list) && list.length){
      setPhotos(prev => prev.map((p, idx)=>{
        const it = list[idx % list.length]
        return it ? { ...p, src: it.src || p.src, _credit: it } : p
      }))
    }
  })() },[])
  const [paused, setPaused] = React.useState(false)
  const wrapRef = React.useRef(null)
  return (
    <div ref={ref} className={`fade-in ${visible? 'visible':''}`}>
    <BentoCard 
      title="Photo of the Week" 
      subtitle="A standout community moment"
      className="md:col-span-2"
    >
      <div
        ref={wrapRef}
        tabIndex={0}
        aria-roledescription="carousel"
        aria-label="Photo of the Week"
        className="relative outline-none bg-fallback-dark -mx-4 md:-mx-5 -mb-4 md:-mb-5"
        onMouseEnter={()=>setPaused(true)}
        onMouseLeave={()=>setPaused(false)}
      >
        <Swiper
          modules={[Pagination, Autoplay, Keyboard, A11y, EffectFade]}
          pagination={{ clickable: true, dynamicBullets: true }}
          keyboard={{ enabled: true }}
          autoplay={photos.length > 1 ? { delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: false } : false}
          loop={photos.length > 1}
          loopAdditionalSlides={0}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          slidesPerView={1}
          className="w-full aspect-[4/3]"
        >
          {photos.map((photo)=> (
            <SwiperSlide key={photo.id} className="!aspect-[4/3]">
              <div className="w-full aspect-[4/3] bg-fallback-dark relative">
                <img src={photo.src || FALLBACK_SRC} alt="" className="absolute inset-0 w-full h-full object-cover" onError={(e)=>{ if(e.currentTarget.src!==FALLBACK_SRC){ e.currentTarget.src = FALLBACK_SRC } }} />
                <div className="absolute inset-0 bg-black/20" />
                {photo._credit && <AttributionBadge item={photo._credit} />}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </BentoCard>
  </div>
  )
}
