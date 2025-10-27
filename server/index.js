
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { searchEvents } from './events/search.js'
import { refreshEventCache, getCachedEvents, getRefreshHistory, startScheduler } from './events/scheduler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA = path.join(__dirname, 'data.json')

function load(){
  try{ return JSON.parse(fs.readFileSync(DATA, 'utf8')) } catch{ return { users:[], posts:[] } }
}
function save(db){ fs.writeFileSync(DATA, JSON.stringify(db, null, 2)) }

const app = express()
app.use(cors())
app.use(express.json())
// serve local cached assets (event posters, thumbs, brand logos)
app.use('/assets', express.static(path.join(__dirname, 'assets')))
app.use('/brand', express.static(path.join(__dirname, 'public/brand')))

// Start monthly event cache refresh scheduler
if (process.env.NODE_ENV !== 'test') {
  startScheduler()
}

app.get('/api/ping', (req,res)=>res.json({ ok:true }))
app.get('/api/users', (req,res)=>{ res.json(load().users) })
app.post('/api/users', (req,res)=>{
  const db = load(); const user = req.body; db.users.push(user); save(db); res.json(user)
})
app.patch('/api/users/:id', (req,res)=>{
  const db = load(); const id = req.params.id; const idx = db.users.findIndex(u=>u.id===id)
  if(idx<0) return res.status(404).send('not found')
  db.users[idx] = { ...db.users[idx], ...req.body }; save(db); res.json(db.users[idx])
})
app.post('/api/posts', (req,res)=>{
  const db = load(); const { userId, post } = req.body
  const u = db.users.find(u=>u.id===userId); if(!u) return res.status(404).send('user not found')
  u.posts = [post, ...(u.posts||[])]; save(db); res.json({ ok:true })
})
app.post('/api/follow', (req,res)=>{
  const db = load(); const { meId, targetId } = req.body
  const me = db.users.find(u=>u.id===meId); const t = db.users.find(u=>u.id===targetId)
  if(!me || !t) return res.status(404).send('user not found')
  me.following = Array.from(new Set([...(me.following||[]), targetId]))
  t.followers = Array.from(new Set([...(t.followers||[]), meId]))
  save(db); res.json({ ok:true })
})
app.post('/api/comment', (req,res)=>{
  const db = load(); const { targetUserId, authorId, text, ts } = req.body
  const u = db.users.find(u=>u.id===targetUserId); if(!u) return res.status(404).send('user not found')
  u.comments = [{ id:'c_'+Math.random().toString(36).slice(2,9), userId:authorId, text, ts }, ...(u.comments||[])]
  save(db); res.json({ ok:true })
})

const PORT = process.env.PORT || 8787
const HOST = process.env.HOST || '127.0.0.1'

// Legacy gyms endpoints removed (affiliation-first model; no public gyms API)

// Removed legacy local events endpoints and placeholder enrichment

// Event search (aggregated from external sources with caching)
// GET /api/events/search?lat=&lng=&radiusKm=80&kinds=BJJ,Judo&from=2025-10-01&to=2026-01-31&intent=compete&q=&region=tri-state
app.get('/api/events/search', async (req,res)=>{
  try{
    const lat = req.query.lat ? Number(req.query.lat) : undefined
    const lng = req.query.lng ? Number(req.query.lng) : undefined
    const radiusKm = req.query.radiusKm ? Number(req.query.radiusKm) : 80
    const kinds = req.query.kinds ? String(req.query.kinds).split(',').map(s=>s.trim()).filter(Boolean) : undefined
    const from = req.query.from ? new Date(String(req.query.from)) : new Date()
    const to = req.query.to ? new Date(String(req.query.to)) : new Date(Date.now() + 1000*60*60*24*60) // next 60 days
    const intent = req.query.intent ? String(req.query.intent) : undefined
    const q = req.query.q ? String(req.query.q) : undefined
    const region = req.query.region ? String(req.query.region) : undefined

    const result = await searchEvents({ lat, lng, radiusKm, kinds, from, to, intent, q, region })
    res.json(result)
  }catch(err){
    console.error('events/search error', err)
    res.status(500).json({ error: 'search_failed' })
  }
})

// Manual refresh trigger for testing/admin
app.post('/api/events/refresh', async (req,res)=>{
  try{
    const result = await refreshEventCache()
    res.json({ ok: true, ...result })
  }catch(err){
    res.status(500).json({ error: err.message })
  }
})

// Get cached events stats
app.get('/api/events/cache-stats', (req,res)=>{
  const cached = getCachedEvents()
  const history = getRefreshHistory()
  res.json({
    cached: cached ? { count: cached.count, timestamp: cached.timestamp } : null,
    history: history.slice(-10) // last 10 refresh attempts
  })
})

app.listen(PORT, HOST, ()=>console.log(`DojoNet server running on http://${HOST}:${PORT}`))

app.post('/api/verify', (req,res)=>{ const db = load(); const { userId, verifiedGym, rankLevel } = req.body; const i = db.users.findIndex(u=>u.id===userId); if(i<0) return res.status(404).send('user not found'); if(typeof verifiedGym==='boolean') db.users[i].verifiedGym = verifiedGym; if(rankLevel) db.users[i].rankLevel = rankLevel; save(db); res.json({ ok:true, user: db.users[i] }) })

// Interests (static list sufficient for prototype)
const INTERESTS = [
  { key:'boxing', label:'Boxing', category:'striking' },
  { key:'muay_thai', label:'Muay Thai', category:'striking' },
  { key:'kickboxing', label:'Kickboxing', category:'striking' },
  { key:'karate', label:'Karate', category:'striking' },
  { key:'taekwondo', label:'Taekwondo', category:'striking' },
  { key:'bjj', label:'BJJ', category:'grappling' },
  { key:'wrestling', label:'Wrestling', category:'grappling' },
  { key:'judo', label:'Judo', category:'grappling' },
  { key:'sambo', label:'Sambo', category:'grappling' },
  { key:'mma', label:'MMA', category:'hybrid' },
]
app.get('/api/interests', (req,res)=>{ res.json(INTERESTS) })

// Claims + Verification requests (minimal)
app.get('/api/claims', (req,res)=>{
  const db = load(); const userId = req.query.userId; const all = db.claims || []
  res.json(userId ? all.filter(c=>c.userId===userId) : all)
})
app.post('/api/claims', (req,res)=>{
  const db = load(); const { userId, arts } = req.body; if(!userId || !Array.isArray(arts)) return res.status(400).send('invalid')
  db.claims = db.claims || []; db.verificationRequests = db.verificationRequests || []
  const created = []
  for(const a of arts){
    const claim = { id: 'pc_'+Math.random().toString(36).slice(2,9), userId, artKey: a.artKey, rank: a.rank||null, years: a.years||null, gymId: a.gymId||null, gymEmail: a.gymEmail||'', createdAt: Date.now() }
    db.claims.push(claim)
    const vr = { id:'vr_'+Math.random().toString(36).slice(2,9), userId, claimId: claim.id, artKey:a.artKey, claimRank:a.rank||null, claimYears:a.years||null, gymId:a.gymId||null, gymEmail:a.gymEmail||'', status:'PENDING', createdAt: Date.now() }
    db.verificationRequests.push(vr)
    created.push({ claim, request: vr })
  }
  save(db); res.status(201).json({ ok:true, created })
})

// List verification requests for a user
app.get('/api/verificationRequests', (req,res)=>{
  const db = load(); const userId = req.query.userId; const all = db.verificationRequests || []
  res.json(userId ? all.filter(v=>v.userId===userId) : all)
})

// Approve (or correct) a verification request
app.post('/api/verify/:reqId/approve', (req,res)=>{
  const db = load(); const { correctedRank, correctedYears } = req.body || {}
  db.verificationRequests = db.verificationRequests || []
  const i = db.verificationRequests.findIndex(v=>v.id===req.params.reqId)
  if(i<0) return res.status(404).send('not found')
  const vr = db.verificationRequests[i]
  const hasCorrection = (typeof correctedRank==='string' && correctedRank) || (typeof correctedYears==='number')
  vr.status = hasCorrection ? 'CORRECTED' : 'APPROVED'
  vr.correctedRank = correctedRank ?? null
  vr.correctedYears = correctedYears ?? null
  vr.decidedAt = Date.now()
  // reflect on claim if present
  if(vr.claimId && db.claims){
    const ci = db.claims.findIndex(c=>c.id===vr.claimId)
    if(ci>=0){
      if(typeof correctedRank==='string' && correctedRank) db.claims[ci].rank = correctedRank
      if(typeof correctedYears==='number') db.claims[ci].years = correctedYears
    }
  }
  save(db); res.json({ ok:true, request: vr })
})

// RSVP to an event
app.post('/api/events/:id/rsvp', (req,res)=>{
  const db = load(); const eventId = String(req.params.id); const { userId } = req.body || {}
  if(!userId) return res.status(400).send('userId required')
  db.rsvps = db.rsvps || []
  const exists = db.rsvps.some(r => String(r.eventId)===eventId && r.userId===userId)
  if(!exists) db.rsvps.push({ eventId, userId, ts: Date.now() })
  save(db); res.json({ ok:true })
})

// Feed (prototype)
app.get('/api/feed', (req,res)=>{
  const db = load();
  const scope = String(req.query.scope||'for_you')
  const limit = Number(req.query.limit||'20')
  const userId = String(req.query.userId||'')
  const users = db.users || []
  const me = users.find(u=>u.id===userId)
  let items = []
  users.forEach(u => (u.posts||[]).forEach(p => items.push({ author:u, post:p })))
  const myCircle = new Set(me?.following || [])
  if(scope==='circle') items = items.filter(i => myCircle.has(i.author.id))
  if(scope==='gym' && me?.gym) items = items.filter(i => i.author.gym===me.gym)
  if(scope==='tutorials') items = items.filter(i => i.post.type==='tutorial')
  if(scope==='for_you'){
    items = items.map(i => ({...i, score: (myCircle.has(i.author.id)?2:0) + (i.author.verifiedGym?1:0) + (i.author.rankLevel>=5?1:0) + Math.random()})).sort((a,b)=>b.score-a.score)
  }
  res.json(items.slice(0, limit))
})

// People suggestions (prototype)
app.get('/api/user/suggestions', (req,res)=>{
  const db = load(); const userId = String(req.query.userId||'')
  const users = db.users || []
  const list = users.filter(u=>u.id!==userId).slice(0,5)
  res.json({ suggestions: list })
})

// Progress stats (prototype)
app.get('/api/stats/progress', (req,res)=>{
  const userId = String(req.query.userId||'')
  const db = load(); db.progress = db.progress || {}
  const p = db.progress[userId] || { streak:3, xp:42, lastCheckIn: null }
  res.json({ userId, streak: p.streak, xp: p.xp, lastCheckIn: p.lastCheckIn })
})

// Progress check-in
app.post('/api/stats/progress', (req,res)=>{
  const { userId, action } = req.body || {}
  if(!userId) return res.status(400).send('userId required')
  const db = load(); db.progress = db.progress || {}
  const todayKey = new Date().toISOString().slice(0,10)
  const p = db.progress[userId] || { streak:0, xp:0, lastCheckIn: null }
  if(action==='checkin'){
    if(p.lastCheckIn === todayKey){ return res.json({ ok:true, streak:p.streak, xp:p.xp, lastCheckIn:p.lastCheckIn, already:true }) }
    // naive: increment streak if yesterday was lastCheckIn; else reset to 1
    const yesterdayKey = new Date(Date.now()-86400000).toISOString().slice(0,10)
    p.streak = (p.lastCheckIn===yesterdayKey) ? (p.streak+1) : 1
    p.xp = (p.xp||0) + 5
    p.lastCheckIn = todayKey
    db.progress[userId] = p; save(db)
    return res.json({ ok:true, streak:p.streak, xp:p.xp, lastCheckIn:p.lastCheckIn })
  }
  return res.status(400).send('invalid action')
})

// Feed and suggestions (naive)
app.get('/api/feed', (req,res)=>{
  const db = load();
  const userId = String(req.query.userId||'')
  const scope = String(req.query.scope||'for_you')
  const limit = Number(req.query.limit||20)
  const me = db.users.find(u=>u.id===userId)
  let items = []
  db.users.forEach(u => (u.posts||[]).forEach(p => items.push({ author:{ id:u.id, name:u.name, avatar:u.avatar, verifiedGym: !!u.verifiedGym, rankLevel: u.rankLevel||1, gym:u.gym||'' }, post:p })))
  const circle = new Set(me?.following||[])
  if(scope==='circle') items = items.filter(i=>circle.has(i.author.id))
  if(scope==='gym' && me?.gym) items = items.filter(i => i.author.gym===me.gym)
  if(scope==='tutorials') items = items.filter(i => i.post.type==='tutorial')
  if(scope==='for_you'){
    items = items.map(i => ({...i, score: (circle.has(i.author.id)?2:0) + (i.author.verifiedGym?1:0) + ((i.author.rankLevel||1)>=5?1:0) + Math.random() })).sort((a,b)=>b.score-a.score)
  }
  res.json(items.slice(0, limit))
})

app.get('/api/user/suggestions', (req,res)=>{
  const db = load();
  const userId = String(req.query.userId||'')
  const me = db.users.find(u=>u.id===userId)
  const list = db.users.filter(u=>u.id!==userId).slice(0,5).map(u=>({ id:u.id, name:u.name, avatar:u.avatar }))
  res.json({ me: me?{ id:me.id, name:me.name }:null, suggestions: list })
})

app.get('/api/stats/progress', (req,res)=>{
  const userId = String(req.query.userId||'')
  // Simple ephemeral stats; future: persist in db
  res.json({ userId, streak: 3, xp: 45 })
})

// -----------------------
// Forums (Reddit-style MVP)
// Storage keys: forumThreads, forumPosts, forumComments, forumVotes
// -----------------------

function ensureForum(db){
  db.forumThreads = db.forumThreads || []
  db.forumPosts = db.forumPosts || []
  db.forumComments = db.forumComments || []
  db.forumVotes = db.forumVotes || []
}

function uid(prefix){ return `${prefix}_${Math.random().toString(36).slice(2,9)}` }

function computeHot(up, down, createdAt){
  const s = (up||0) - (down||0)
  const order = Math.log10(Math.max(Math.abs(s), 1))
  const sign = s > 0 ? 1 : s < 0 ? -1 : 0
  const seconds = Math.floor((new Date(createdAt).getTime()/1000) - 1134028003)
  return sign * order + (seconds / 45000)
}

// Create a thread (root post included)
app.post('/api/threads', (req,res)=>{
  const { authorId, title, body='', tags=[], promotedFromJournalId=null, boardSlug=null, visibility='PUBLIC' } = req.body || {}
  if(!authorId || !title || !title.trim()) return res.status(400).send('invalid')
  const db = load(); ensureForum(db)
  const thread = { id: uid('thr'), boardSlug, authorId, title: title.trim(), createdAt: Date.now(), updatedAt: Date.now(), promotedFromJournalId, visibility, score:0, votesUp:0, votesDown:0, tags:Array.isArray(tags)?tags.slice(0,8):[], isLocked:false, isDeleted:false }
  const post = { id: uid('fp'), threadId: thread.id, authorId, body:String(body||''), createdAt: Date.now(), updatedAt: Date.now(), isDeleted:false }
  db.forumThreads.unshift(thread)
  db.forumPosts.push(post)
  save(db)
  res.status(201).json({ thread, post })
})

// List threads
app.get('/api/threads', (req,res)=>{
  const db = load(); ensureForum(db)
  const sort = String(req.query.sort||'hot')
  // Recompute hot score lazily
  db.forumThreads = db.forumThreads.map(t=>({
    ...t,
    score: computeHot(t.votesUp||0, t.votesDown||0, t.createdAt)
  }))
  let list = [...db.forumThreads]
  if(sort==='new') list.sort((a,b)=> b.createdAt - a.createdAt)
  else if(sort==='top') list.sort((a,b)=> (b.votesUp-b.votesDown) - (a.votesUp-a.votesDown))
  else list.sort((a,b)=> b.score - a.score)
  res.json(list)
})

// Get a thread with root post and flat comments (client can thread later)
app.get('/api/threads/:id', (req,res)=>{
  const db = load(); ensureForum(db)
  const id = String(req.params.id)
  const thread = db.forumThreads.find(t=>t.id===id)
  if(!thread) return res.status(404).send('not found')
  const post = db.forumPosts.find(p=>p.threadId===id)
  const comments = db.forumComments.filter(c=>c.threadId===id).sort((a,b)=> a.createdAt-b.createdAt)
  res.json({ thread, post, comments })
})

// Comment
app.post('/api/comments', (req,res)=>{
  const { threadId, parentId=null, authorId, body } = req.body || {}
  if(!threadId || !authorId || !body || !String(body).trim()) return res.status(400).send('invalid')
  const db = load(); ensureForum(db)
  const thread = db.forumThreads.find(t=>t.id===threadId)
  if(!thread) return res.status(404).send('thread not found')
  if(thread.isLocked) return res.status(403).send('locked')
  const post = db.forumPosts.find(p=>p.threadId===threadId)
  const c = { id: uid('fc'), threadId, postId: post?.id||'', parentId, authorId, body:String(body), createdAt: Date.now(), updatedAt: Date.now(), votesUp:0, votesDown:0, isDeleted:false }
  db.forumComments.push(c); save(db)
  res.status(201).json({ comment: c })
})

// Voting for posts or comments
app.post('/api/votes', (req,res)=>{
  const { targetType, targetId, userId, value } = req.body || {}
  if(!userId || !targetType || !targetId || !['UP','DOWN','NEUTRAL'].includes(String(value))) return res.status(400).send('invalid')
  const db = load(); ensureForum(db)
  const key = { userId:String(userId), targetType:String(targetType), targetId:String(targetId) }
  db.forumVotes = db.forumVotes || []
  const idx = db.forumVotes.findIndex(v=> v.userId===key.userId && v.targetType===key.targetType && v.targetId===key.targetId)
  if(value==='NEUTRAL'){
    if(idx>=0) db.forumVotes.splice(idx,1)
  }else{
    if(idx>=0) db.forumVotes[idx] = { ...db.forumVotes[idx], value }
    else db.forumVotes.push({ id: uid('fv'), ...key, value, createdAt: Date.now() })
  }
  // recompute aggregates
  const counts = db.forumVotes.filter(v=> v.targetType===key.targetType && v.targetId===key.targetId)
  const up = counts.filter(v=>v.value==='UP').length
  const down = counts.filter(v=>v.value==='DOWN').length
  if(targetType==='POST'){
    const post = db.forumPosts.find(p=>p.id===targetId)
    if(post){
      const thrIdx = db.forumThreads.findIndex(t=>t.id===post.threadId)
      if(thrIdx>=0){
        db.forumThreads[thrIdx].votesUp = up
        db.forumThreads[thrIdx].votesDown = down
        db.forumThreads[thrIdx].score = computeHot(up, down, db.forumThreads[thrIdx].createdAt)
      }
    }
  } else if(targetType==='COMMENT'){
    const ci = db.forumComments.findIndex(c=>c.id===targetId)
    if(ci>=0){ db.forumComments[ci].votesUp = up; db.forumComments[ci].votesDown = down }
  }
  save(db)
  res.json({ ok:true, up, down })
})
