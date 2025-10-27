import { normalizeEvent } from '../normalize.js'

export const meetupAdapter = {
  key: 'meetup',
  label: 'Meetup',
  baseUrls: ['https://www.meetup.com'],
  /** Skeleton: use keyword search for "bjj", "judo", etc., by city */
  async fetchEvents({ region='new-york', from, to, q='bjj' }){
    return []
  }
}
