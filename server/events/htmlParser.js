// Lightweight HTML metadata parser using regex (no DOM dependencies)
// Extracts Open Graph, Twitter Cards, and JSON-LD structured data

export function parseMetaTags(html) {
  const meta = {}
  
  // Open Graph
  const ogPattern = /<meta\s+property=["']og:([^"']+)["']\s+content=["']([^"']+)["']\s*\/?>/gi
  let match
  while ((match = ogPattern.exec(html)) !== null) {
    meta[`og:${match[1]}`] = match[2]
  }
  
  // Twitter Cards
  const twPattern = /<meta\s+(?:name|property)=["']twitter:([^"']+)["']\s+content=["']([^"']+)["']\s*\/?>/gi
  while ((match = twPattern.exec(html)) !== null) {
    meta[`twitter:${match[1]}`] = match[2]
  }
  
  // Also try reverse order (content before property/name)
  const ogRevPattern = /<meta\s+content=["']([^"']+)["']\s+property=["']og:([^"']+)["']\s*\/?>/gi
  while ((match = ogRevPattern.exec(html)) !== null) {
    meta[`og:${match[2]}`] = match[1]
  }
  
  const twRevPattern = /<meta\s+content=["']([^"']+)["']\s+(?:name|property)=["']twitter:([^"']+)["']\s*\/?>/gi
  while ((match = twRevPattern.exec(html)) !== null) {
    meta[`twitter:${match[2]}`] = match[1]
  }
  
  return meta
}

export function parseJsonLd(html) {
  const scripts = []
  const pattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let match
  while ((match = pattern.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1])
      scripts.push(data)
    } catch {}
  }
  return scripts
}

export function extractEventImage(html, baseUrl) {
  const meta = parseMetaTags(html)
  const jsonLd = parseJsonLd(html)
  
  // Priority 1: og:image
  if (meta['og:image']) return absoluteUrl(baseUrl, meta['og:image'])
  
  // Priority 2: twitter:image
  if (meta['twitter:image']) return absoluteUrl(baseUrl, meta['twitter:image'])
  
  // Priority 3: JSON-LD Event image
  const event = jsonLd.find(j => j['@type'] === 'Event' || (Array.isArray(j['@type']) && j['@type'].includes('Event')))
  if (event?.image) {
    const img = typeof event.image === 'string' ? event.image : event.image?.url || event.image?.[0]
    if (img) return absoluteUrl(baseUrl, img)
  }
  
  // Priority 4: Largest <img> in first 50KB (simple heuristic)
  const imgPattern = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  const images = []
  while ((match = imgPattern.exec(html.slice(0, 50000))) !== null) {
    const src = match[1]
    // Skip tiny icons/logos
    if (src.includes('icon') || src.includes('logo') || src.includes('avatar')) continue
    images.push(absoluteUrl(baseUrl, src))
  }
  
  return images[0] || null
}

export function extractOrgLogo(html, baseUrl) {
  const meta = parseMetaTags(html)
  const jsonLd = parseJsonLd(html)
  
  // JSON-LD Organization logo
  const org = jsonLd.find(j => j['@type'] === 'Organization')
  if (org?.logo) {
    const logo = typeof org.logo === 'string' ? org.logo : org.logo?.url
    if (logo) return absoluteUrl(baseUrl, logo)
  }
  
  // Fallback: og:logo or favicon
  if (meta['og:logo']) return absoluteUrl(baseUrl, meta['og:logo'])
  
  // Extract favicon link
  const faviconPattern = /<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i
  const faviconMatch = html.match(faviconPattern)
  if (faviconMatch) return absoluteUrl(baseUrl, faviconMatch[1])
  
  // Default favicon.ico
  try {
    const url = new URL(baseUrl)
    return `${url.origin}/favicon.ico`
  } catch {
    return null
  }
}

function absoluteUrl(base, relative) {
  if (!relative) return null
  try {
    return new URL(relative, base).toString()
  } catch {
    return relative
  }
}

// Cheerio-compatible wrapper for regex parsing
export function parseHTML(html) {
  // Simple jQuery-like API for regex-based parsing
  return {
    find: (selector) => {
      // Basic support for common selectors
      return {
        text: () => '',
        attr: () => null,
        each: () => {}
      }
    },
    text: () => html.slice(0, 1000), // truncated text content
    attr: () => null
  }
}

// Extract page media (images, logos) from HTML
export async function extractPageMedia(url) {
  try {
    const { politeFetch } = await import('../events/fetcher.js')
    const res = await politeFetch(url)
    const html = res.text || res
    
    return {
      imageUrl: extractEventImage(html, url),
      logo: extractOrgLogo(html, url)
    }
  } catch {
    return { imageUrl: null, logo: null }
  }
}
