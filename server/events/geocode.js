import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { politeFetch } from './fetcher.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CACHE_DIR = path.join(__dirname, '../.cache')
const CACHE_FILE = path.join(CACHE_DIR, 'geocode.json')

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }) }
function loadCache(){ try{ return JSON.parse(fs.readFileSync(CACHE_FILE,'utf8')) }catch{ return {} } }
function saveCache(data){ ensureDir(CACHE_DIR); fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2)) }

const mem = { data: null }
function cache(){ if(!mem.data) mem.data = loadCache(); return mem.data }

export async function geocodePlace(query){
  if(!query || !String(query).trim()) return null
  const key = String(query).trim().toLowerCase()
  const c = cache()
  if(c[key]) return c[key]
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
  try{
    const res = await politeFetch(url, { headers: { 'Accept-Language': 'en' }})
    const list = JSON.parse(res.text)
    if(Array.isArray(list) && list.length){
      const lat = Number(list[0].lat), lon = Number(list[0].lon)
      c[key] = { lat, lng: lon }
      saveCache(c)
      return c[key]
    }
  }catch(err){ /* ignore and fall through */ }
  return null
}

export async function geocodeEvents(events){
  const out = []
  for(const e of events){
    if(typeof e.lat === 'number' && typeof e.lng === 'number') { out.push(e); continue }
    const label = [e?.venue?.city, e?.venue?.state, e?.venue?.country].filter(Boolean).join(', ')
    if(label){
      const g = await geocodePlace(label)
      if(g) { out.push({ ...e, lat: g.lat, lng: g.lng }); continue }
    }
    out.push(e)
  }
  return out
}
