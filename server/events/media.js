import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { brandForUrl, DEFAULT_ORG_AVATAR } from './brand.js'
import { extractEventImage, extractOrgLogo } from './htmlParser.js'
import { fetchHtmlPolite } from './fetcher.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASSETS_DIR = path.join(__dirname, '../assets')

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }) }

export async function extractPageMedia(url){
  try{
    const html = await fetchHtmlPolite(url)
    const imageUrl = extractEventImage(html, url)
    const logoUrl = extractOrgLogo(html, url)
    return { html, imageUrl, logoUrl }
  }catch{
    return { html:'', imageUrl:null, logoUrl:null }
  }
}

function abs(base, maybe){ if(!maybe) return null; try{ return new URL(maybe, base).toString() }catch{ return null } }

export async function cacheImageToLocal(srcUrl, kind='poster'){
  const res = await fetch(srcUrl, { redirect:'follow' })
  if(!res.ok) throw new Error(`image fetch ${srcUrl} -> ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const sha1 = crypto.createHash('sha1').update(buf).digest('hex')
  const base = path.join(ASSETS_DIR, 'events', sha1)
  ensureDir(base)
  const heroPath = path.join(base, 'hero.jpg')
  const thumbPath = path.join(base, 'thumb.jpg')
  try{
    const img = sharp(buf)
    await img.resize({ width:1600, withoutEnlargement:true }).jpeg({ quality:82 }).toFile(heroPath)
    await img.resize({ width:320, height:320, fit:'cover' }).jpeg({ quality:80 }).toFile(thumbPath)
  }catch{
    // fallback: write original
    fs.writeFileSync(heroPath, buf)
    fs.writeFileSync(thumbPath, buf)
  }
  const heroUrl = `/assets/events/${sha1}/hero.jpg`
  const thumbUrl = `/assets/events/${sha1}/thumb.jpg`
  return { heroUrl, thumbUrl, sha1 }
}

export async function resolveHostAvatar(eventUrl, pageMedia){
  const brand = brandForUrl(eventUrl)
  if(brand) return brand.avatarUrl
  
  // Try extracted logo from page
  if(pageMedia?.logoUrl){
    try{
      const cached = await cacheImageToLocal(pageMedia.logoUrl, 'logo')
      return cached.thumbUrl
    }catch{}
  }
  
  // Favicon fallback: try /favicon.ico at the origin
  try{
    const origin = new URL(eventUrl).origin
    const ico = `${origin}/favicon.ico`
    const cached = await cacheImageToLocal(ico, 'logo')
    return cached.thumbUrl
  }catch{}
  return DEFAULT_ORG_AVATAR
}

function sizeVal(s){ const m = String(s||'').match(/(\d+)x(\d+)/); return m ? Number(m[1])*Number(m[2]) : 0 }
