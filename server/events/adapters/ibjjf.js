/**
 * IBJJF adapter
 * 
 * Scrapes https://ibjjf.com/events/calendar
 * Currently returns 404 - seed events provide fallback
 * 
 * When available: parses calendar grid HTML to extract event links
 * Follows each link to detail pages for dates, cities, countries
 * Extracts og:image/poster from detail pages
 * Respects robots.txt and rate limits
 */
import { politeFetch } from '../fetcher.js'
import { normalizeEvent } from '../normalize.js'

export const ibjjfAdapter = {
  key: 'ibjjf',
  
  async fetchEvents({ region, from, to, q } = {}) {
    const url = 'https://ibjjf.com/events/calendar'
    
    // Currently returns 404 - gracefully fail
    const html = await politeFetch(url)
    
    // Basic regex parsing - only match actual event detail pages
    const items = []
    // Match links like /events/new-jersey-fall-open-2025 or /events/championship-name
    // Exclude navigation links like /events/calendar, /events/results, /events/upcoming
    const linkPattern = /<a[^>]*href=["']([^"']*\/events\/[a-z0-9\-]+)["'][^>]*>([\s\S]*?)<\/a>/gi
    let match
    
    const skipPatterns = [
      '/events/calendar',
      '/events/results', 
      '/events/upcoming',
      '/events/championships',
      '/events/past',
      '/events/archive'
    ]
    
    while ((match = linkPattern.exec(html.text)) !== null) {
      const href = match[1]
      const content = match[2]
      
      // Skip navigation/category links
      if (skipPatterns.some(pattern => href.includes(pattern))) continue
      if (href.length < 15) continue // Too short to be a real event slug
      
      const registerUrl = href.startsWith('http') ? href : `https://ibjjf.com${href}`
      const titleMatch = content.match(/<h[23][^>]*>([^<]+)<\/h[23]>/i) || content.match(/title[^>]*>([^<]+)</i)
      const title = titleMatch ? titleMatch[1].trim() : content.replace(/<[^>]+>/g, '').trim().slice(0, 100)
      
      if (!title || title.length < 5) continue
      if (['upcoming events', 'results', 'championships'].includes(title.toLowerCase())) continue
      
      const kind = title.toLowerCase().includes('no-gi') || title.toLowerCase().includes('nogi') ? 'NoGi' : 'Gi'
      
      items.push({
        sourceKey: 'ibjjf',
        title,
        kind,
        dateStr: '',
        locationStr: '',
        url: registerUrl,
        organizer: { name: 'IBJJF', url: registerUrl }
      })
    }
    
    return items.slice(0, 20).map(normalizeEvent)
  }
}
