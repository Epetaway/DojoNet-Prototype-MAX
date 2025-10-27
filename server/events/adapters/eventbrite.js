import { normalizeEvent } from '../normalize.js'

export const eventbriteAdapter = {
  key: 'eventbrite',
  label: 'Eventbrite',
  baseUrls: ['https://www.eventbrite.com'],
  /**
   * Very naive HTML search by region and keyword; consider using Eventbrite APIs if available.
   */
  async fetchEvents({ region='new-york', from, to, q='martial arts' }){
    // NOTE: For stability and ESM compat in this prototype, we return an empty set.
    // Implement HTML parsing with jsdom or the official API if available.
    return []
  }
}
