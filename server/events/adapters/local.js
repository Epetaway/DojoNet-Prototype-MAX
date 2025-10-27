import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Prefer a dedicated local events file to avoid coupling to large app data.json
const LEGACY_DATA = path.join(__dirname, '../../data.json')
const LOCAL_EVENTS = path.join(__dirname, '../local-events.json')

export const localAdapter = {
  key: 'local',
  label: 'LocalDB',
  baseUrls: [],
  async fetchEvents(){
    try{
      let events = []
      if (fs.existsSync(LOCAL_EVENTS)) {
        const raw = JSON.parse(fs.readFileSync(LOCAL_EVENTS,'utf8'))
        events = Array.isArray(raw) ? raw : (raw.events || [])
      } else if (fs.existsSync(LEGACY_DATA)) {
        const db = JSON.parse(fs.readFileSync(LEGACY_DATA,'utf8'))
        events = db.events || []
      }
      return events.map(e => ({
        id: e.id,
        sourceKey: 'local',
        kind: e.kind || 'Seminar',
        title: e.title,
        start: e.date ? new Date(e.date).toISOString() : new Date().toISOString(),
        venue: e.location ? { city: e.location.city||'', state: e.location.state||'', country: 'USA' } : { city:'', state:'', country:'' },
        registerUrl: e.link || '',
        imageUrl: e.imageUrl || null,
        tags: [],
        organizer: { name: e.affiliation || 'Local', url: e.link || '' },
        createdAt: new Date().toISOString()
      }))
    }catch{ return [] }
  }
}
