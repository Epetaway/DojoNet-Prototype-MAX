import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { CONFIG } from './config.js'
import { processImage } from './image-utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function ensureDir(dir){ await fs.promises.mkdir(dir, { recursive: true }) }

async function fetchUnsplash(query, perPage=12){
  const url = new URL('https://api.unsplash.com/search/photos')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', String(perPage))
  url.searchParams.set('content_filter', 'high')
  url.searchParams.set('orientation', 'landscape')
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } })
  if(!res.ok) throw new Error(`Unsplash ${res.status}`)
  const data = await res.json()
  return (data.results||[]).map(r => ({
    url: r.urls.raw + '&fit=max',
    sourceUrl: r.links.html,
    authorName: r.user?.name,
    authorUrl: r.user?.links?.html,
    width: r.width, height: r.height,
  }))
}

async function fetchPexels(query, perPage=12){
  const url = new URL('https://api.pexels.com/v1/search')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', String(perPage))
  url.searchParams.set('orientation', 'landscape')
  const res = await fetch(url, { headers: { Authorization: process.env.PEXELS_API_KEY||'' } })
  if(!res.ok) throw new Error(`Pexels ${res.status}`)
  const data = await res.json()
  return (data.photos||[]).map(p => ({
    url: p.src?.original,
    sourceUrl: p.url,
    authorName: p.photographer,
    authorUrl: p.photographer_url,
    width: p.width, height: p.height,
  }))
}

async function download(url){
  const res = await fetch(url)
  if(!res.ok) throw new Error(`Download ${res.status}`)
  const buf = await res.arrayBuffer()
  return Buffer.from(buf)
}

function pick(arr, n){
  if(arr.length<=n) return arr
  const copy = [...arr]
  const out = []
  while(out.length<n && copy.length){
    const i = Math.floor(Math.random()*copy.length)
    out.push(copy.splice(i,1)[0])
  }
  return out
}

async function main(){
  const outRoot = path.join(process.cwd(), CONFIG.outputDir)
  await ensureDir(outRoot)
  const manifest = []
  for(const t of CONFIG.targets){
    const sectionDir = path.join(outRoot, t.key)
    await ensureDir(sectionDir)
    const fetcher = (CONFIG.provider==='unsplash') ? fetchUnsplash : fetchPexels
    const pools = await Promise.all(t.queries.map(q => fetcher(q, 12).catch(()=>[])))
    const pool = pools.flat().filter(Boolean)
    const chosen = pick(pool, t.count)
    let idx=0
    for(const item of chosen){
      try{
        const raw = await download(item.url)
        const processed = await processImage(raw, { width: CONFIG.sizes[t.sizeKey], grayscale: t.grayscale, muted: t.muted })
        const filename = `${t.key}_${String(idx+1).padStart(2,'0')}.jpg`
        await fs.promises.writeFile(path.join(sectionDir, filename), processed)
        manifest.push({ section:t.key, filename:`${t.key}/${filename}`, width: CONFIG.sizes[t.sizeKey], height: 0, provider: CONFIG.provider, query:'mixed', sourceUrl:item.sourceUrl, authorName:item.authorName, authorUrl:item.authorUrl })
        idx++
        await new Promise(r=>setTimeout(r,300))
      }catch(e){ console.warn('skip failed image', e.message) }
    }
  }
  await fs.promises.writeFile(path.join(outRoot, 'manifest.json'), JSON.stringify(manifest,null,2),'utf8')
  console.log(`✓ Placeholders saved to ${CONFIG.outputDir}`)
}

main().catch(e=>{ console.error(e); process.exit(1) })
