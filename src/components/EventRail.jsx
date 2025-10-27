import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Keyboard, A11y, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { MapPin, Calendar } from 'lucide-react'

export default function EventRail({ events = [], onPrimary }){
  return (
    <section className="px-4 md:px-6 lg:px-8 py-10" aria-labelledby="events-title">
      <div className="mx-auto max-w-6xl">
        <h2 id="events-title" className="pb-3 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Events near you
        </h2>
        <div className="border-b border-zinc-200 dark:border-zinc-800 mb-6" />

        {events.length === 0 ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400 px-1">
            No events yet
            {import.meta?.env?.DEV && (
              <span className="ml-2 opacity-80">• Tip: start the API server to load seed data.</span>
            )}
          </div>
        ) : (
          <Swiper
            modules={[Pagination, Keyboard, A11y, Autoplay]}
            pagination={{ clickable: true, dynamicBullets: true }}
            keyboard={{ enabled: true }}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 24 },
              1024: { slidesPerView: 3, spaceBetween: 32 }
            }}
            loop={events.length > 3}
            loopAdditionalSlides={0}
            autoplay={ events.length > 3 ? { delay: 6000, disableOnInteraction: false } : false }
            aria-roledescription="carousel"
            className="pb-12"
          >
            {events.map(evt => (
              <SwiperSlide key={evt.id} className="!h-auto">
                <EventCoverCard evt={evt} onClick={()=>onPrimary?.(evt)} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  )
}

function EventCoverCard({ evt, onClick }){
  const [hadError, setHadError] = React.useState(false)
  const src = evt?.imageUrl || evt?.previewImage || ''
  const onImgError = () => setHadError(true)

  const dateValue = evt.start || evt.date
  const dateLabel = dateValue 
    ? new Date(dateValue).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'TBA'
  
  const loc = evt.venue || evt.location
  const locationLabel = loc
    ? [loc.city, loc.state].filter(Boolean).join(', ')
    : 'Location TBA'
  
  // Use event host avatar or generate one based on event ID
  const hostAvatar = evt.hostAvatar 
    || evt.hostAvatarUrl 
    || (evt.createdBy ? `https://i.pravatar.cc/200?u=${evt.createdBy}` : null)
    || `https://i.pravatar.cc/200?u=${evt.id}`

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); onClick?.() } }}
      className="relative h-72 md:h-80 lg:h-96 w-full overflow-hidden rounded-3xl shadow-lg ring-1 ring-zinc-200/60 dark:ring-zinc-800 bg-zinc-900 group cursor-pointer"
      aria-label={evt.title}
    >
      {/* Background image */}
      {src && !hadError ? (
        <img
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          loading="lazy"
          onError={onImgError}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
      )}

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0" />
      <div className="absolute inset-0 bg-zinc-900/10 mix-blend-multiply" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col text-white p-6 md:p-8">
        {evt.category && (
          <span className="absolute top-4 right-4 text-[11px] px-3 py-1 bg-brand/90 backdrop-blur-sm rounded-full uppercase tracking-wide font-semibold">
            {evt.category}
          </span>
        )}
        
        <h3 className="mt-auto text-2xl md:text-3xl font-bold leading-tight drop-shadow-sm">
          {evt.title}
        </h3>

        <ul className="mt-4 flex items-center gap-4 text-sm text-white/90">
          <li className="me-auto">
            <img
              src={hostAvatar}
              alt=""
              className="h-8 w-8 rounded-full ring-2 ring-white/70"
              loading="lazy"
            />
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="h-4 w-4 opacity-90" aria-hidden="true" />
            <small className="font-medium">{locationLabel}</small>
          </li>
          <li className="flex items-center gap-2">
            <Calendar className="h-4 w-4 opacity-90" aria-hidden="true" />
            <small className="font-medium">{dateLabel}</small>
          </li>
        </ul>
      </div>

      {/* Focus state */}
      <span className="absolute inset-0 ring-0 focus-visible:ring-2 focus-visible:ring-rose-500 rounded-3xl" />
    </article>
  )
}
