import { eventbriteAdapter } from './adapters/eventbrite.js'
import { ibjjfAdapter } from './adapters/ibjjf.js'
import { nagaAdapter } from './adapters/naga.js'
import { smoothcompAdapter } from './adapters/smoothcomp.js'
import { meetupAdapter } from './adapters/meetup.js'
import { localAdapter } from './adapters/local.js'
import { extractPageMedia, resolveHostAvatar, cacheImageToLocal } from './media.js'
import { geocodePlace, geocodeEvents } from './geocode.js'
import { seedEvents } from './seed.js'

function haversine(lat1, lon1, lat2, lon2){
  const toRad = d => d * Math.PI/180
  const R = 6371
  const dLat = toRad(lat2-lat1)
  const dLon = toRad(lon2-lon1)
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

function trustBySource(key){
  if(['ibjjf','smoothcomp','naga'].includes(key)) return 1.0
  if(['eventbrite','meetup'].includes(key)) return 0.8
  return 0.6
}

function recencyScore(date){
  const days = Math.max(0, (new Date(date).getTime() - Date.now()) / 86400000)
  return Math.exp(-days/30)
}

function interestScoreFromTags(userInterests = [], tags = [], kind = ''){
  const a = new Set((userInterests||[]).map(x=>String(x).toLowerCase()))
  const b = new Set([...(tags||[]).map(x=>String(x).toLowerCase()), String(kind||'').toLowerCase()])
  const inter = [...a].filter(x => b.has(x)).length
  const union = new Set([...a, ...b]).size || 1
  return inter / union
}

async function enrichOne(evt){
  const page = await extractPageMedia(evt.registerUrl || evt.organizer?.url || '')
  let heroUrl = evt.imageUrl || page.imageUrl || null
  let thumbUrl = null
  if(heroUrl){
    try{ 
      const cached = await cacheImageToLocal(heroUrl, 'poster')
      heroUrl = cached.heroUrl
      thumbUrl = cached.thumbUrl
    }catch{}
  }
  const hostAvatar = await resolveHostAvatar(evt.registerUrl || evt.organizer?.url || '', page)
  return { ...evt, imageUrl: heroUrl, thumbUrl, hostAvatar }
}

export async function runAllAdapters(window, region, q){
  // Include local/dummy adapter along with external sources
  const adapters = [localAdapter, ibjjfAdapter, nagaAdapter, smoothcompAdapter, eventbriteAdapter, meetupAdapter]
  const results = []
  for(const ad of adapters){
    try{
      const items = await ad.fetchEvents({ region, ...window, q })
      results.push(...items)
    }catch(err){
      // eslint-disable-next-line no-console
      console.warn('adapter failed', ad.key, err?.message || err)
    }
  }
  
  // Fallback: if all adapters failed and we got nothing, return seed events for dev
  if(results.length === 0 && process.env.NODE_ENV !== 'production'){
    console.log('⚠️  All adapters blocked/failed; returning seed events for dev')
    return seedEvents
  }
  
  return results
}

export async function searchEvents({ lat, lng, radiusKm=80, kinds, from, to, intent, q, region, userInterests=[] }){
  // 0) user location: if not provided, try to resolve from region
  let userLat = lat, userLng = lng
  if((userLat==null || userLng==null) && region){
    const g = await geocodePlace(region)
    if(g){ userLat = g.lat; userLng = g.lng }
  }

  // 1) gather
  const base = await runAllAdapters({ from, to }, region, q)
  // 2) enrich media
  const enriched = await Promise.all(base.map(enrichOne))
  // 3) geocode missing event coords
  const withGeo = await geocodeEvents(enriched)
  // 4) score & distance
  const scored = withGeo.map(e => {
    const hasGeo = typeof e.lat==='number' && typeof e.lng==='number'
    const distanceKm = (userLat!=null && userLng!=null && hasGeo) ? haversine(userLat, userLng, e.lat, e.lng) : Infinity
    const distanceScore = Number.isFinite(distanceKm) ? Math.max(0, 1 - distanceKm/Number(radiusKm)) : 0
    const iScore = interestScoreFromTags(userInterests, e.tags, e.kind)
    const rScore = recencyScore(e.start)
    const tScore = trustBySource(e.sourceKey)
    const pop = e.popularity ?? 0.3
    const score = 0.35*distanceScore + 0.30*iScore + 0.15*rScore + 0.10*tScore + 0.10*pop
    return { ...e, distanceKm, score }
  })
  // 4) filter on radius & kind if provided
  const filtered = scored.filter(e => {
    const byRadius = (!Number.isFinite(e.distanceKm)) || (e.distanceKm <= Number(radiusKm))
    const byKind = kinds ? kinds.includes(e.kind) : true
    return byRadius && byKind
  })
  filtered.sort((a,b) => b.score - a.score)
  return { items: filtered.slice(0, 60) }
}
