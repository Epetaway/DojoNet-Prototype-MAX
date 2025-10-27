import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { useStore } from '../app/store'
import { ThumbsUp, ThumbsDown, MessageSquare, Share2 } from 'lucide-react'
import { Button } from '../components'

export default function Thread(){
  const { id } = useParams()
  const { users, session } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const [data, setData] = useState(null)
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(()=>{ api('GET', `/threads/${id}`).then(setData).catch(()=>setData(null)) }, [id])

  async function addComment(){
    if(!me){ alert('Login to comment'); return }
    if(!body.trim()) return
    setPosting(true)
    try{
      const res = await api('POST','/comments',{ threadId:id, authorId:me.id, body: body.trim() })
      setData(d => d ? { ...d, comments:[...(d.comments||[]), res.comment] } : d)
      setBody('')
    }catch(e){ console.warn(e) }
    finally{ setPosting(false) }
  }

  if(!data) return <div className="max-w-5xl mx-auto px-6"><div className="card p-6">Loading…</div></div>
  const author = users.find(u=>u.id===data.thread.authorId)

  return (
    <div className="max-w-5xl mx-auto px-6">
      <div className="card p-4 mb-4">
        <div className="flex gap-3">
          <VoteThread postId={data.post?.id} thread={data.thread} />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold">{data.thread.title}</h1>
            <div className="text-xs text-[var(--color-text-muted)] mb-3">by {author?author.name:'Unknown'} • {new Date(data.thread.createdAt).toLocaleString()}</div>
            {data.post?.body && (
              <div className="prose text-sm whitespace-pre-wrap">{data.post.body}</div>
            )}
            <div className="mt-3 flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
              <a className="link flex items-center gap-1" onClick={()=>{ navigator.clipboard.writeText(window.location.href) }}><Share2 size={16}/> Share</a>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <h2 className="section-header">Add a comment</h2>
        <textarea className="input min-h-[100px]" aria-label="Comment" placeholder="Write your comment" value={body} onChange={e=>setBody(e.target.value)} />
        <div className="mt-2 flex justify-end">
          <Button onClick={addComment} disabled={!body.trim()||posting} loading={posting}>Post comment</Button>
        </div>
      </div>

      <div className="space-y-3">
        {(data.comments||[]).map(c => (
          <CommentItem key={c.id} c={c} users={users} />
        ))}
        {!data.comments?.length && (
          <div className="card p-4 text-sm text-[var(--color-text-muted)]">No comments yet.</div>
        )}
      </div>
    </div>
  )
}

function VoteThread({ thread, postId }){
  const { session, users } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const [local, setLocal] = useState({ up:thread.votesUp||0, down:thread.votesDown||0, mine:null })
  useEffect(()=>{ setLocal({ up:thread.votesUp||0, down:thread.votesDown||0, mine:null }) }, [thread.id, thread.votesUp, thread.votesDown])
  const score = local.up - local.down
  async function vote(val){
    if(!me || !postId) return
    try{
      const next = (local.mine===val) ? 'NEUTRAL' : val
      const res = await api('POST','/votes',{ targetType:'POST', targetId: postId, userId: me.id, value: next })
      setLocal({ up: res.up, down: res.down, mine: next==='NEUTRAL'?null:val })
    }catch{}
  }
  return (
    <div className="flex flex-col items-center w-12 shrink-0 select-none">
      <button className={`p-1.5 rounded hover:bg-[var(--color-elevated)] ${local.mine==='UP'?'text-[var(--accent-primary)]':''}`} aria-label="Upvote" aria-pressed={local.mine==='UP'} onClick={()=>vote('UP')}><ThumbsUp size={18} /></button>
      <div className="text-[11px] mt-0.5">{local.up}</div>
      <button className={`p-1.5 rounded hover:bg-[var(--color-elevated)] mt-1 ${local.mine==='DOWN'?'text-[var(--accent-primary)]':''}`} aria-label="Downvote" aria-pressed={local.mine==='DOWN'} onClick={()=>vote('DOWN')}><ThumbsDown size={18} /></button>
      <div className="text-[11px] mt-0.5">{local.down}</div>
    </div>
  )
}

function CommentItem({ c, users }){
  const author = users.find(u=>u.id===c.authorId)
  return (
    <div className="card p-3">
      <div className="flex gap-3">
        <VoteComment comment={c} />
        <div className="min-w-0 flex-1">
          <div className="text-xs text-[var(--color-text-muted)] mb-1">{author?author.name:'Unknown'} • {new Date(c.createdAt).toLocaleString()}</div>
          <div className="whitespace-pre-wrap text-sm">{c.body}</div>
        </div>
      </div>
    </div>
  )
}

function VoteComment({ comment }){
  const { session, users } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const [local, setLocal] = useState({ up:comment.votesUp||0, down:comment.votesDown||0, mine:null })
  useEffect(()=>{ setLocal({ up:comment.votesUp||0, down:comment.votesDown||0, mine:null }) }, [comment.id, comment.votesUp, comment.votesDown])
  const score = local.up - local.down
  async function vote(val){
    if(!me) return
    try{
      const next = (local.mine===val) ? 'NEUTRAL' : val
      const res = await api('POST','/votes',{ targetType:'COMMENT', targetId: comment.id, userId: me.id, value: next })
      setLocal({ up: res.up, down: res.down, mine: next==='NEUTRAL'?null:val })
    }catch{}
  }
  return (
    <div className="flex flex-col items-center w-12 shrink-0 select-none">
      <button className={`p-1.5 rounded hover:bg-[var(--color-elevated)] ${local.mine==='UP'?'text-[var(--accent-primary)]':''}`} aria-label="Upvote" aria-pressed={local.mine==='UP'} onClick={()=>vote('UP')}><ThumbsUp size={18} /></button>
      <div className="text-[11px] mt-0.5">{local.up}</div>
      <button className={`p-1.5 rounded hover:bg-[var(--color-elevated)] mt-1 ${local.mine==='DOWN'?'text-[var(--accent-primary)]':''}`} aria-label="Downvote" aria-pressed={local.mine==='DOWN'} onClick={()=>vote('DOWN')}><ThumbsDown size={18} /></button>
      <div className="text-[11px] mt-0.5">{local.down}</div>
    </div>
  )
}
