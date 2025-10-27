// Polite HTTP fetcher with in-memory cache, rate limiting, and robots.txt respect
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple in-memory cache with TTL
const cache = new Map()
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

// Rate limiting: track last request time per domain
const rateLimits = new Map()
const MIN_DELAY_MS = 1000 // 1 second between requests to same domain

// Robots.txt cache (simple: just store disallowed paths per domain)
const robotsCache = new Map()

function getCacheKey(url, method = 'GET') {
  return `${method}:${url}`
}

function isExpired(timestamp, ttl = CACHE_TTL) {
  return Date.now() - timestamp > ttl
}

async function respectRateLimit(domain) {
  const last = rateLimits.get(domain)
  if (last) {
    const elapsed = Date.now() - last
    if (elapsed < MIN_DELAY_MS) {
      await new Promise(resolve => setTimeout(resolve, MIN_DELAY_MS - elapsed))
    }
  }
  rateLimits.set(domain, Date.now())
}

async function checkRobots(url) {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname
    const pathname = urlObj.pathname
    
    // Check cache first
    if (robotsCache.has(domain)) {
      const disallowed = robotsCache.get(domain)
      for (const pattern of disallowed) {
        if (pathname.startsWith(pattern)) {
          return false // disallowed
        }
      }
      return true
    }
    
    // Fetch robots.txt
    const robotsUrl = `${urlObj.protocol}//${domain}/robots.txt`
    const res = await fetch(robotsUrl, { redirect: 'follow' })
    if (!res.ok) {
      robotsCache.set(domain, []) // no robots.txt = allow all
      return true
    }
    
    const text = await res.text()
    const lines = text.split('\n')
    const disallowed = []
    let userAgentMatch = false
    
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('User-agent:')) {
        const agent = trimmed.slice(11).trim()
        userAgentMatch = agent === '*' || agent.toLowerCase().includes('bot')
      }
      if (userAgentMatch && trimmed.startsWith('Disallow:')) {
        const path = trimmed.slice(9).trim()
        if (path) disallowed.push(path)
      }
    }
    
    robotsCache.set(domain, disallowed)
    
    // Check again
    for (const pattern of disallowed) {
      if (pathname.startsWith(pattern)) {
        return false
      }
    }
    return true
  } catch {
    // If we can't check robots.txt, be conservative and allow
    return true
  }
}

export async function politeFetch(url, options = {}) {
  const method = options.method || 'GET'
  const cacheKey = getCacheKey(url, method)
  
  // Check cache first
  if (cache.has(cacheKey)) {
    const entry = cache.get(cacheKey)
    if (!isExpired(entry.timestamp)) {
      return { ...entry.response, fromCache: true }
    }
    cache.delete(cacheKey)
  }
  
  // Check robots.txt
  const allowed = await checkRobots(url)
  if (!allowed) {
    throw new Error('Blocked by robots.txt')
  }
  
  // Rate limit
  const domain = new URL(url).hostname
  await respectRateLimit(domain)
  
  // Fetch
  const res = await fetch(url, {
    ...options,
    headers: {
      'User-Agent': 'DojoNet/1.0 (Event Aggregator; +https://dojonet.local)',
      ...options.headers
    },
    redirect: 'follow'
  })
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`)
  }
  
  const text = await res.text()
  const result = {
    status: res.status,
    statusText: res.statusText,
    text,
    url: res.url,
    fromCache: false
  }
  
  // Cache it
  cache.set(cacheKey, {
    timestamp: Date.now(),
    response: result
  })
  
  return result
}

export async function fetchHtmlPolite(url) {
  const res = await politeFetch(url)
  return res.text
}
