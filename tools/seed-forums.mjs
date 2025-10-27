#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const workspaceRoot = path.resolve(__dirname, '..')
const dataPath = path.join(workspaceRoot, 'server', 'data.json')

function loadJSON(p){
  try{ return JSON.parse(fs.readFileSync(p, 'utf8')) }catch(e){ return null }
}
function saveJSON(p, obj){ fs.writeFileSync(p, JSON.stringify(obj, null, 2)) }

function backup(p){
  const dir = path.dirname(p)
  const base = path.basename(p, path.extname(p))
  const ts = new Date().toISOString().replace(/[:.]/g,'-')
  const out = path.join(dir, `${base}.backup.${ts}.json`)
  fs.copyFileSync(p, out)
  return out
}

const inputArg = process.argv[2] || path.join(workspaceRoot, 'server', 'seed', 'forums.json')
if(!fs.existsSync(inputArg)){
  console.error(`Seed file not found: ${inputArg}`)
  process.exit(1)
}

const seed = loadJSON(inputArg)
if(!seed){
  console.error('Failed to parse seed JSON')
  process.exit(1)
}

const db = loadJSON(dataPath) || {}
// Ensure arrays exist
const keys = ['forumThreads','forumPosts','forumComments','forumVotes']
for(const k of keys){ if(!Array.isArray(db[k])) db[k] = [] }

// Back up existing db
if(fs.existsSync(dataPath)){
  const b = backup(dataPath)
  console.log('Backed up existing data.json to', b)
}

// If seed contains our internal shape, use it; otherwise, transform from generic { threads: [...] }
if(Array.isArray(seed.forumThreads) || Array.isArray(seed.forumPosts) || Array.isArray(seed.forumComments) || Array.isArray(seed.forumVotes)){
  for(const k of keys){ if(Array.isArray(seed[k])) db[k] = seed[k] }
} else if(Array.isArray(seed.threads)){
  const forumThreads = []
  const forumPosts = []
  const forumComments = []
  const forumVotes = [] // not used yet; counts stored on objects

  const makeId = (prefix)=> `${prefix}_${Math.random().toString(36).slice(2,9)}`
  const authorToId = (a)=> a ? `seed_${String(a).replace(/[^a-z0-9_]+/gi,'_').toLowerCase()}` : 'seed_anon'

  for(const t of seed.threads){
    const threadId = t.id && String(t.id).startsWith('thr_') ? String(t.id) : makeId('thr')
    const authorId = authorToId(t.author)
    const createdAt = t.createdAt ? Date.parse(t.createdAt) || Date.now() : Date.now()
    const tags = Array.isArray(t.tags) ? t.tags.slice(0,8).map(x=>String(x)) : []
    const thr = {
      id: threadId,
      boardSlug: null,
      authorId,
      title: String(t.title||'Untitled'),
      createdAt,
      updatedAt: createdAt,
      promotedFromJournalId: null,
      visibility: 'PUBLIC',
      score: 0,
      votesUp: Number(t.votesUp||0),
      votesDown: Number(t.votesDown||0),
      tags,
      isLocked: false,
      isDeleted: false,
    }
    forumThreads.push(thr)

    const postId = makeId('fp')
    forumPosts.push({
      id: postId,
      threadId: threadId,
      authorId,
      body: String(t.body||''),
      createdAt,
      updatedAt: createdAt,
      isDeleted: false,
    })

    const addComment = (c, parentId=null)=>{
      const cid = c.id && String(c.id).startsWith('cmt_') ? String(c.id).replace(/^cmt_/,'fc_') : makeId('fc')
      const cauthor = authorToId(c.author)
      const ccreated = c.createdAt ? Date.parse(c.createdAt) || Date.now() : Date.now()
      forumComments.push({
        id: cid,
        threadId: threadId,
        postId: postId,
        parentId: parentId,
        authorId: cauthor,
        body: String(c.body||''),
        createdAt: ccreated,
        updatedAt: ccreated,
        votesUp: Number(c.votesUp||0),
        votesDown: Number(c.votesDown||0),
        isDeleted: false,
      })
      if(Array.isArray(c.replies)){
        for(const r of c.replies){ addComment(r, cid) }
      }
    }
    if(Array.isArray(t.comments)){
      for(const c of t.comments){ addComment(c, null) }
    }
  }

  db.forumThreads = forumThreads
  db.forumPosts = forumPosts
  db.forumComments = forumComments
  db.forumVotes = forumVotes
} else {
  console.warn('Unrecognized seed shape. Expecting keys forumThreads/forumPosts/forumComments or threads[].')
}

saveJSON(dataPath, db)
console.log('Seeded forum content: ', keys.map(k=>`${k}:${Array.isArray(db[k])?db[k].length:0}`).join(' '))
