import { normalizeEvent } from '../normalize.js'
import { fetchHtmlPolite } from '../fetcher.js'

export const nagaAdapter = {
  key: 'naga',
  label: 'NAGA',
  baseUrls: ['https://www.nagafighter.com','https://nagafighter.com'],
  /** Parse NAGA public tournament listing */
  async fetchEvents({ region='USA', from, to, q }){
    try{
      const url = 'https://www.nagafighter.com/tournaments/'
      const html = await fetchHtmlPolite(url)
      const events = []
      // Look for tournament links and card blocks
      const cardPattern = /<a[^>]*href=["']([^"']*\/tournaments\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
      let m
      while((m = cardPattern.exec(html)) !== null){
        const href = m[1]
        const content = m[2]
        const titleMatch = content.match(/<h[2-4][^>]*>(.*?)<\/h[2-4]>/i)
        const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g,'').trim() : ''
        const dateMatch = content.match(/\b([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})\b/)
        const dateText = dateMatch ? dateMatch[1] : ''
        const locMatch = content.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/)
        const location = locMatch ? locMatch[1] : region
        if(!title || !href) continue
        const full = href.startsWith('http') ? href : `https://www.nagafighter.com${href}`
        events.push(normalizeEvent({
          title,
          startText: dateText,
          locationText: location,
          url: full,
          kind: 'BJJ',
          sourceKey: 'naga',
          organizer: { name: 'NAGA', url }
        }))
      }
      return events.slice(0,50)
    }catch(err){
      console.warn('naga adapter failed:', err?.message)
      return []
    }
  }
}
