/**
 * Scheduled event refresh system
 * 
 * Implements monthly cron job to refresh event cache from all sources
 * Provides manual trigger endpoint for testing
 * Stores results in persistent cache with timestamps
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { searchEvents } from './search.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CACHE_DIR = path.join(__dirname, '../.cache')
const CACHE_FILE = path.join(CACHE_DIR, 'event-cache.json')
const REFRESH_LOG = path.join(CACHE_DIR, 'refresh-log.json')

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}

// Prevent concurrent refreshes
let refreshInProgress = false

/**
 * Refresh events from all sources and cache results
 * @returns {Promise<{count: number, timestamp: string}>}
 */
export async function refreshEventCache() {
  if (refreshInProgress) {
    console.log('[scheduler] Refresh already in progress, skipping...')
    return { count: 0, timestamp: new Date().toISOString(), skipped: true }
  }
  
  refreshInProgress = true
  console.log('[scheduler] Starting event cache refresh...')
  const startTime = Date.now()
  
  try {
    // Fetch events for next 6 months
    const from = new Date()
    const to = new Date(Date.now() + 1000 * 60 * 60 * 24 * 180) // 6 months
    
    const result = await searchEvents({
      from,
      to,
      radiusKm: 500, // broad search
      region: 'united-states' // can be made configurable
    })
    
    const cache = {
      items: result.items || [],
      timestamp: new Date().toISOString(),
      count: (result.items || []).length,
      duration: Date.now() - startTime
    }
    
    // Write cache
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
    
    // Log refresh
    const log = {
      timestamp: cache.timestamp,
      count: cache.count,
      duration: cache.duration,
      success: true
    }
    appendRefreshLog(log)
    
    console.log(`[scheduler] Refresh complete: ${cache.count} events in ${cache.duration}ms`)
    return { count: cache.count, timestamp: cache.timestamp }
  } catch (err) {
    console.error('[scheduler] Refresh failed:', err.message)
    appendRefreshLog({
      timestamp: new Date().toISOString(),
      error: err.message,
      success: false
    })
    throw err
  } finally {
    refreshInProgress = false
  }
}

/**
 * Get cached events (if available and fresh)
 * @param {number} maxAgeMs - Maximum age in milliseconds (default: 30 days)
 * @returns {object|null}
 */
export function getCachedEvents(maxAgeMs = 30 * 24 * 60 * 60 * 1000) {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null
    
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
    const age = Date.now() - new Date(cache.timestamp).getTime()
    
    if (age > maxAgeMs) {
      console.log('[scheduler] Cache expired (age: %d days)', Math.floor(age / (24 * 60 * 60 * 1000)))
      return null
    }
    
    return cache
  } catch {
    return null
  }
}

/**
 * Append to refresh log
 * @param {object} entry - Log entry
 */
function appendRefreshLog(entry) {
  try {
    let log = []
    if (fs.existsSync(REFRESH_LOG)) {
      log = JSON.parse(fs.readFileSync(REFRESH_LOG, 'utf8'))
    }
    log.push(entry)
    // Keep last 50 entries
    if (log.length > 50) log = log.slice(-50)
    fs.writeFileSync(REFRESH_LOG, JSON.stringify(log, null, 2))
  } catch (err) {
    console.error('[scheduler] Failed to write refresh log:', err.message)
  }
}

/**
 * Get refresh history
 * @returns {array}
 */
export function getRefreshHistory() {
  try {
    if (!fs.existsSync(REFRESH_LOG)) return []
    return JSON.parse(fs.readFileSync(REFRESH_LOG, 'utf8'))
  } catch {
    return []
  }
}

/**
 * Start monthly refresh schedule
 * In production, use a proper cron service or task scheduler
 * This is a simple in-process interval for demonstration
 */
export function startScheduler() {
  // Run every 30 days
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
  
  // Initial refresh on startup (if cache is stale or missing)
  const cache = getCachedEvents()
  if (!cache) {
    console.log('[scheduler] No valid cache on startup, triggering initial refresh...')
    refreshEventCache().catch(console.error)
  } else {
    console.log('[scheduler] Using existing cache with %d events (age: %d days)', 
      cache.count, 
      Math.floor((Date.now() - new Date(cache.timestamp).getTime()) / (24 * 60 * 60 * 1000))
    )
  }
  
  console.log('[scheduler] Scheduler initialized (use POST /api/events/refresh for manual updates)')
  console.log('[scheduler] Note: Automatic 30-day refresh disabled in development. In production, use a proper cron service.')
  
  // In production, use a real cron service instead of setInterval
  // Example: node-cron, or external scheduler like AWS EventBridge, GitHub Actions, etc.
  // Uncomment below to enable auto-refresh (not recommended for development):
  /*
  setInterval(() => {
    console.log('[scheduler] Monthly refresh triggered')
    refreshEventCache().catch(console.error)
  }, THIRTY_DAYS)
  */
}
