// Robust placeholder manifest loader + helpers
// - Caches per section
// - Normalizes each item to include an absolute `src`
// - Provides deterministic picker given a seed

const _cache = new Map()
let _manifestLoaded = false
let _manifest = []

export const FALLBACK_SRC = '/placeholders/hero/hero_mats.svg'
export const DEFAULT_EVENT_PLACEHOLDER = '/placeholders/events/event_bjj.svg'

async function loadManifest(){
  if(_manifestLoaded) return _manifest
  try{
    const res = await fetch('/placeholders/manifest.json', { cache:'no-store' })
    if(res.ok){
      const list = await res.json()
      _manifest = Array.isArray(list) ? list : []
      _manifestLoaded = true
      return _manifest
    }
  }catch{/* ignore and fall back */}
  // As a last resort, keep an empty manifest so fallbacks still work
  _manifest = []
  _manifestLoaded = true
  return _manifest
}

function normalizeItems(items){
  if(!Array.isArray(items)) return []
  return items.map(it => {
    // Ensure absolute src path when filename is present
    const src = it.src || (it.filename ? `/placeholders/${it.filename}` : undefined)
    return { ...it, src }
  })
}

export async function getPlaceholders(section){
  try{
    if(_cache.has(section)) return _cache.get(section)
    const man = await loadManifest()
    const filtered = normalizeItems(man.filter(i => i.section === section))
    if(import.meta?.env?.DEV && filtered.length===0){
      // eslint-disable-next-line no-console
      console.warn(`[placeholders] No entries for section="${section}". If you expect Unsplash/Pexels images, run the placeholders fetcher (see README).`)
    }
    _cache.set(section, filtered)
    return filtered
  }catch{
    return []
  }
}

export async function pickPlaceholder(section, seed){
  const list = await getPlaceholders(section)
  if(!Array.isArray(list) || list.length===0) return null
  const key = String(seed ?? section ?? '')
  let hash = 0
  for(let i=0;i<key.length;i++){ hash = ((hash<<5)-hash) + key.charCodeAt(i); hash |= 0 }
  const idx = Math.abs(hash) % list.length
  const pick = list[idx]
  return pick || null
}
