import crypto from 'crypto'

export function sanitizeTitle(s){ return String(s||'').trim().replace(/\s+/g,' ') }

export function parseDate(maybe){
  if(!maybe) return new Date().toISOString()
  const d = new Date(maybe)
  if(!isNaN(d)) return d.toISOString()
  // TODO: add natural language date parsing if needed
  return new Date().toISOString()
}

export function parseLocation(text){
  const t = String(text||'').trim()
  if(!t) return { city:'', state:'', country:'' }
  // naive split by comma: City, ST, Country
  const parts = t.split(',').map(x=>x.trim())
  return {
    city: parts[0]||'',
    state: parts[1]||'',
    country: parts[2]||''
  }
}

export function inferTags(title){
  const t = String(title||'').toLowerCase()
  const tags = []
  if(/bjj|jiu[-\s]?jitsu|grappling/.test(t)) tags.push('BJJ')
  if(/judo/.test(t)) tags.push('Judo')
  if(/wrestling/.test(t)) tags.push('Wrestling')
  if(/sumo/.test(t)) tags.push('Sumo')
  if(/muay|kickboxing/.test(t)) tags.push('Muay Thai')
  if(/mma|fight|card/.test(t)) tags.push('MMA')
  if(/seminar|workshop/.test(t)) tags.push('Seminar')
  if(/open\s*mat/.test(t)) tags.push('OpenMat')
  return tags
}

export function makeId(sourceKey, title, city, startISO){
  const fingerprint = `${sourceKey}|${sanitizeTitle(title)}|${String(city||'')}|${String(startISO||'').slice(0,10)}`
  return crypto.createHash('sha1').update(fingerprint).digest('hex')
}

export function normalizeEvent(input){
  const startISO = input.dateISO ?? parseDate(input.startText)
  const { city, state, country } = parseLocation(input.locationText)
  return {
    id: makeId(input.sourceKey, input.title, city, startISO),
    sourceKey: input.sourceKey,
    kind: input.kind,
    title: sanitizeTitle(input.title),
    start: startISO,
    venue: { city, state, country },
    registerUrl: input.url,
    imageUrl: input.imageUrl || null,
    tags: inferTags(input.title),
    organizer: input.organizer || { name: input.sourceKey, url: input.url },
    createdAt: new Date().toISOString()
  }
}
