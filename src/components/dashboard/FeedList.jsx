import { pickPlaceholder, FALLBACK_SRC } from '../../lib/placeholders'
import React, { useEffect, useMemo, useState } from 'react'
import { useStore } from '../../app/store'
import { USE_BACKEND, api } from '../../lib/api'
import { Virtuoso } from 'react-virtuoso'
import { Skeleton, Button } from '../index'
import { Heart, MessageSquare, Bookmark } from 'lucide-react'

function Card({ author, post }){
  const { users, session } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const [open, setOpen] = useState(false)
  const storageKey = `post_comments_${post.id}`
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [avatarSrc, setAvatarSrc] = useState(author.avatar || '')
  const [avatarErr, setAvatarErr] = useState(false)
  const [phAvatar, setPhAvatar] = useState('')
  React.useEffect(()=>{ let mounted=true; (async()=>{ const pick = await pickPlaceholder('avatars', author.id || author.name); if(mounted){ setPhAvatar(pick?.src || '') } })(); return ()=>{ mounted=false } }, [author.id, author.name])
  React.useEffect(()=>{ setAvatarErr(false); setAvatarSrc(author.avatar || '') }, [author.avatar])
  React.useEffect(()=>{ if(avatarErr){ if(phAvatar && avatarSrc!==phAvatar){ setAvatarSrc(phAvatar) } else if(avatarSrc!==FALLBACK_SRC){ setAvatarSrc(FALLBACK_SRC) } } }, [avatarErr, phAvatar, avatarSrc])
  useEffect(()=>{
    try{ const saved = JSON.parse(localStorage.getItem(storageKey)||'[]'); if(Array.isArray(saved)) setComments(saved) }catch{}
  }, [storageKey])
  function addComment(){
    const t = text.trim(); if(!t) return
    const entry = { id: `${post.id}_c_${Date.now()}` , userId: me?.id||'anon', name: me?.name||'Anonymous', avatar: me?.avatar||'', text: t, ts: Date.now() }
    const next = [...comments, entry]
    setComments(next); setText('')
    try{ localStorage.setItem(storageKey, JSON.stringify(next)) }catch{}
  }
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
  <img src={avatarSrc || phAvatar || FALLBACK_SRC} alt="" aria-hidden="true" className="avatar avatar-md" onError={()=>setAvatarErr(true)} />
        <div className="text-sm font-medium">{author.name}</div>
        <div className="text-xs text-[var(--color-text-muted)] ml-auto">{post.date}</div>
      </div>
      <div className="mt-2 text-sm">{post.title}</div>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" className="h-9 flex items-center gap-1" onClick={()=>alert('Respect (demo)')}><Heart size={16}/> Respect</Button>
        <Button variant="outline" className="h-9 flex items-center gap-1" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-controls={`comments_${post.id}`}><MessageSquare size={16}/> Discuss</Button>
        <Button variant="outline" className="h-9 flex items-center gap-1" onClick={()=>alert('Saved (demo)')}><Bookmark size={16}/> Save</Button>
      </div>
      {open && (
        <div id={`comments_${post.id}`} className="mt-4 border-t pt-3" style={{borderColor:'var(--color-border)'}}>
          <div className="space-y-2 max-h-48 overflow-auto pr-1">
            {comments.length===0 ? (
              <div className="text-xs text-[var(--color-text-muted)]">Be the first to start a discussion.</div>
            ) : comments.map(c => (
              <div key={c.id} className="flex items-start gap-2">
                {c.avatar ? <img src={c.avatar} alt="" aria-hidden="true" className="avatar avatar-sm"/> : <div className="avatar-skeleton avatar-sm"/>}
                <div>
                  <div className="text-xs"><span className="font-medium">{c.name}</span> {c.text}</div>
                  <div className="text-[10px] text-[var(--color-text-muted)]">{new Date(c.ts).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input className="input flex-1" placeholder="Write a comment…" aria-label="Comment" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addComment() } }} />
            <Button variant="outline" className="h-9" onClick={addComment} disabled={!text.trim()}>Post</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function FeedList({ scope='for_you', filterByUserId, emptyMessage }){
  const { users, session } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const [remote, setRemote] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    let mounted=true
    async function load(){
      if(!USE_BACKEND || !me) { setRemote(null); return }
      setLoading(true)
      try{ const data = await api('GET', `/feed?scope=${scope}&limit=50&userId=${me.id}`); if(mounted) setRemote(data) }catch{ if(mounted) setRemote(null) } finally { if(mounted) setLoading(false) }
    }
    load(); return ()=>{ mounted=false }
  }, [scope, me?.id])

  const items = useMemo(()=>{
    // Backend path
    // Note: using sync path for simplicity; caller can pass scope prop only.
    // We still compute locally when backend is off.
    if(USE_BACKEND){
      // We won't fetch here to keep the component pure; caller (Dashboard) can keep scope static for now.
      // For prototype, fall back to local scoring; later swap to a useEffect + state.
    }
    let posts = []
    users.forEach(u => u.posts?.forEach(p => posts.push({ author: u, post: p })))
    // Optional filter by a specific author/user
    if (filterByUserId) {
      posts = posts.filter(i => i.author.id === filterByUserId)
    }
    let top3 = []
    try{ top3 = JSON.parse(localStorage.getItem('ob_top3')||'[]') }catch{}
    const myCircle = new Set(me?.following || [])
    if(scope==='circle') posts = posts.filter(i => myCircle.has(i.author.id))
    if(scope==='gym' && me?.gym) posts = posts.filter(i => i.author.gym===me.gym)
    if(scope==='tutorials') posts = posts.filter(i => i.post.type==='tutorial')
    if(scope==='for_you'){
      posts = posts.map(i => ({...i, score: (myCircle.has(i.author.id)?2:0) + (i.author.verifiedGym?1:0) + (i.author.rankLevel>=5?1:0) + (top3.length?Math.random()*1.5:Math.random())})).sort((a,b)=>b.score-a.score)
    }
    return posts.slice(0, 50)
  }, [users, session.userId, scope])

  const renderItems = remote ?? items
  if(loading && USE_BACKEND && me){
    return (
      <div className="space-y-3">
        <div className="card p-4"><Skeleton className="h-4 w-40" /><Skeleton className="mt-2 h-4 w-3/4" /></div>
        <div className="card p-4"><Skeleton className="h-4 w-48" /><Skeleton className="mt-2 h-4 w-2/3" /></div>
        <div className="card p-4"><Skeleton className="h-4 w-36" /><Skeleton className="mt-2 h-4 w-1/2" /></div>
      </div>
    )
  }
  if(!renderItems.length){
    return (
      <div className="card p-6 text-sm text-[var(--color-text-muted)]">
        {emptyMessage || 'Welcome to your dojo. Start by sharing how training went today, or explore your interests.'}
      </div>
    )
  }

  return (
    <div style={{height: 800}} aria-label="Feed List">
      <Virtuoso
        totalCount={renderItems.length}
        itemContent={(index) => (
          <div className="mb-3">
            <Card author={renderItems[index].author} post={renderItems[index].post} />
          </div>
        )}
        increaseViewportBy={400}
      />
    </div>
  )
}
