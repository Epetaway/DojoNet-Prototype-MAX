/**
 * Smoothcomp adapter
 * 
 * Scrapes https://smoothcomp.com/en/events/upcoming
 * Currently blocked by robots.txt - seed events provide fallback
 * 
 * When unblocked: targets card elements (.sc-card) for title, date, location, badges
 * Enriches with poster images from detail pages
 * Respects robots.txt and rate limits
 */
import { politeFetch } from '../fetcher.js'
import { normalizeEvent } from '../normalize.js'

export const smoothcompAdapter = {
  key: 'smoothcomp',
  
  async fetchEvents({ region, from, to, q } = {}) {
    const url = 'https://smoothcomp.com/en/events/upcoming'
    
    // Currently blocked by robots.txt - gracefully fail
    // When access is available, this will parse the HTML and extract events
    const html = await politeFetch(url)
    
    // Basic regex-based parsing for resilience
    const items = []
    const linkPattern = /<a[^>]*href=["']([^"']*\/en\/event\/[^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
    let match
    
    while ((match = linkPattern.exec(html.text)) !== null) {
      const href = match[1]
      const content = match[2]
      
      const registerUrl = href.startsWith('http') ? href : `https://smoothcomp.com${href}`
      const titleMatch = content.match(/<h[23][^>]*>([^<]+)<\/h[23]>/i) || content.match(/title[^>]*>([^<]+)</i)
      const title = titleMatch ? titleMatch[1].trim() : null
      
      if (!title) continue
      
      const kind = title.toLowerCase().includes('no-gi') || title.toLowerCase().includes('nogi') ? 'NoGi' : 'Gi'
      
      items.push({
        sourceKey: 'smoothcomp',
        title,
        kind,
        dateStr: '',
        locationStr: '',
        url: registerUrl,
        organizer: { name: 'Smoothcomp', url: registerUrl }
      })
    }
    
    return items.slice(0, 20).map(normalizeEvent)
  }
}
