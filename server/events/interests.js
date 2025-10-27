/**
 * User interest mapping system
 * 
 * Maps Smoothcomp "Type of game" options to user selectable interests
 * Allows filtering event discovery based on user preferences
 * Supports matching event tags to user interests
 */

export const InterestChoices = [
  { value: 'Gi', label: 'BJJ – Gi', category: 'grappling' },
  { value: 'NoGi', label: 'BJJ – No-Gi', category: 'grappling' },
  { value: 'BJJ', label: 'BJJ – Mixed', category: 'grappling' },
  { value: 'OpenMat', label: 'Open Mat', category: 'training' },
  { value: 'Seminar', label: 'Seminars & Workshops', category: 'training' },
  { value: 'Judo', label: 'Judo', category: 'grappling' },
  { value: 'Wrestling', label: 'Wrestling', category: 'grappling' },
  { value: 'MMA', label: 'MMA', category: 'mixed' },
  { value: 'Sumo', label: 'Sumo', category: 'grappling' },
  { value: 'WatchParty', label: 'Watch Parties', category: 'social' },
]

/**
 * Check if an event matches user interests
 * @param {string[]} eventTags - Event tags (normalized to lowercase)
 * @param {string[]} userInterests - User selected interests
 * @returns {boolean}
 */
export function matchEventToInterests(eventTags, userInterests) {
  if (!userInterests || userInterests.length === 0) return true // no filter = show all
  if (!eventTags || eventTags.length === 0) return false
  
  const userSet = new Set(userInterests.map(v => String(v).toLowerCase()))
  return eventTags.some(tag => userSet.has(String(tag).toLowerCase()))
}

/**
 * Get interest labels for display
 * @param {string[]} values - Interest values
 * @returns {string[]}
 */
export function getInterestLabels(values) {
  const map = new Map(InterestChoices.map(c => [c.value, c.label]))
  return values.map(v => map.get(v) || v)
}

/**
 * Map external event types to our interest system
 * @param {string} externalType - Type from external source (e.g., Smoothcomp "Type of game")
 * @returns {string}
 */
export function mapExternalType(externalType) {
  const lower = String(externalType).toLowerCase().trim()
  
  if (lower.includes('gi') && !lower.includes('no')) return 'Gi'
  if (lower.includes('no-gi') || lower.includes('nogi')) return 'NoGi'
  if (lower.includes('mixed') || lower.includes('bjj')) return 'BJJ'
  if (lower.includes('mma')) return 'MMA'
  if (lower.includes('judo')) return 'Judo'
  if (lower.includes('wrestling')) return 'Wrestling'
  if (lower.includes('sumo')) return 'Sumo'
  if (lower.includes('open') || lower.includes('mat')) return 'OpenMat'
  if (lower.includes('seminar') || lower.includes('workshop')) return 'Seminar'
  if (lower.includes('watch') || lower.includes('party')) return 'WatchParty'
  
  return 'BJJ' // default fallback
}
