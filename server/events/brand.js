// Simple brand map for recognizable organizer avatars.
// You can replace avatarUrl values with local files served from /brand (put PNGs under server/public/brand)

export const BRAND_MAP = {
  'ibjjf.com':   { key: 'ibjjf',   name: 'IBJJF',   avatarUrl: '/brand/ibjjf.svg' },
  'naga':        { key: 'naga',    name: 'NAGA',    avatarUrl: '/brand/naga.png' },
  'smoothcomp.com': { key: 'smoothcomp', name: 'Smoothcomp', avatarUrl: '/brand/smoothcomp.svg' },
  'tapology.com':{ key: 'tapology',name: 'Tapology',avatarUrl: '/brand/tapology.png' },
}

export function brandForUrl(eventUrl){
  try{
    const host = new URL(eventUrl).hostname.replace(/^www\./,'')
    const domainKey = Object.keys(BRAND_MAP).find(k => host.includes(k))
    return domainKey ? BRAND_MAP[domainKey] : null
  }catch{ return null }
}

export const DEFAULT_ORG_AVATAR = 'https://dummyimage.com/64x64/1f2937/e5e7eb.png&text=MA'
