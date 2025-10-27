import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useStore } from '../app/store'
import { ThumbsUp, ThumbsDown, MessageSquare, Share2 } from 'lucide-react'
import { Button } from '../components'

export default function Forums(){
  const [threads, setThreads] = useState([])
  const [sort, setSort] = useState('hot')
  const { session, users } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const [composeOpen, setComposeOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  useEffect(()=>{ api('GET', `/threads?sort=${sort}`).then(setThreads).catch(()=>setThreads([])) }, [sort])
  async function createThread(){
    if(!me){ alert('Login to start a thread'); return }
    if(!title.trim()) return
    try{
      const res = await api('POST','/threads',{ authorId: me.id, title: title.trim(), body })
      setThreads([res.thread, ...threads])
      setTitle(''); setBody(''); setComposeOpen(false)
    }catch(e){ console.warn(e) }
  }
  return (
    <div className="max-w-5xl mx-auto px-6">
      <h1 className="section-header">Community Discussions</h1>
      <div className="flex gap-2 text-sm mb-3">
        {['hot','top','new'].map(s => (
          <Button key={s} variant={sort===s?'primary':'outline'} className="h-8 px-3" onClick={()=>setSort(s)}>{s.toUpperCase()}</Button>
        ))}
        <Button className="h-8 px-3 ml-auto" onClick={()=>setComposeOpen(v=>!v)}>{composeOpen? 'Cancel' : 'Start a thread'}</Button>
      </div>
      {composeOpen && (
        <div className="card p-4 mb-4">
          <div className="grid gap-2">
            <input className="input" aria-label="Thread title" placeholder="Thread title" value={title} onChange={e=>setTitle(e.target.value)} />
            <textarea className="input min-h-[120px]" aria-label="Thread body" placeholder="What do you want to discuss?" value={body} onChange={e=>setBody(e.target.value)} />
            <div className="flex justify-end">
              <Button onClick={createThread} disabled={!title.trim()}>Post thread</Button>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {threads.map(t => (
          <ThreadCard key={t.id} t={t} />
        ))}
        {!threads.length && (
          <div className="card p-6 text-sm text-[var(--color-text-muted)]">No threads yet.</div>
        )}
      </div>
    </div>
  )
}

function ThreadCard({ t }){
  const { users } = useStore()
  const author = users.find(u=>u.id===t.authorId)
  const score = (t.votesUp||0) - (t.votesDown||0)
  return (
    <article className="card p-4 card-hover">
      <div className="flex gap-3">
        <VoteColumn thread={t} />
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-medium"><Link to={`/thread/${t.id}`} className="link">{t.title}</Link></h2>
          <div className="text-xs text-[var(--color-text-muted)] mb-2">by {author?author.name:'Unknown'} • {new Date(t.createdAt).toLocaleString()}</div>
          <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
            <Link to={`/thread/${t.id}`} className="hover:underline flex items-center gap-1"><MessageSquare size={16}/> View</Link>
            <button className="link flex items-center gap-1" onClick={()=>{ navigator.clipboard.writeText(window.location.origin+`/thread/${t.id}`) }}><Share2 size={16}/> Share</button>
            <span className="ml-auto text-[11px] inline-flex items-center gap-3">
              <span className="inline-flex items-center gap-1"><ThumbsUp size={14}/> {t.votesUp||0}</span>
              <span className="inline-flex items-center gap-1"><ThumbsDown size={14}/> {t.votesDown||0}</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

function VoteColumn({ thread }){
  const { session, users } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const [local, setLocal] = useState({ up:thread.votesUp||0, down:thread.votesDown||0, mine:null })
  const score = local.up - local.down
  useEffect(()=>{ setLocal({ up:thread.votesUp||0, down:thread.votesDown||0, mine:null }) }, [thread.id, thread.votesUp, thread.votesDown])
  async function vote(val){
    if(!me){ alert('Login to vote'); return }
    try{
      const rootPostId = `fp_for_${thread.id}` // resolved on server via post lookup; we'll fetch thread when voting
      const thr = await api('GET', `/threads/${thread.id}`)
      const postId = thr?.post?.id
      if(!postId) return
      const next = (local.mine===val) ? 'NEUTRAL' : val
      const res = await api('POST','/votes',{ targetType:'POST', targetId: postId, userId: me.id, value: next })
      setLocal({ up: res.up, down: res.down, mine: next==='NEUTRAL'?null:val })
    }catch{}
  }
  return (
    <div className="flex flex-col items-center w-12 shrink-0 select-none">
      <button
        className={`p-1.5 rounded hover:bg-[var(--color-elevated)] ${local.mine==='UP'?'text-[var(--accent-primary)]':''}`}
        aria-label="Upvote"
        aria-pressed={local.mine==='UP'}
        onClick={()=>vote('UP')}
      >
        <ThumbsUp size={18} />
      </button>
      <div className="text-[11px] mt-0.5">{local.up}</div>
      <button
        className={`p-1.5 rounded hover:bg-[var(--color-elevated)] ${local.mine==='DOWN'?'text-[var(--accent-primary)]':''}`}
        aria-label="Downvote"
        aria-pressed={local.mine==='DOWN'}
        onClick={()=>vote('DOWN')}
      >
        <ThumbsDown size={18} />
      </button>
      <div className="text-[11px] mt-0.5">{local.down}</div>
    </div>
  )
}
