import React, { useEffect, useState } from 'react'
import { useStore } from '../../app/store'
import { Button } from '../index'

export default function JournalComposer(){
  const { session, users, addPost } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const [text, setText] = useState('')
  const [tags, setTags] = useState([])
  const [mood, setMood] = useState('🙂')
  const [privacy, setPrivacy] = useState('private')
  const draftKey = me ? `draft_journal_${me.id}` : null

  useEffect(()=>{ if(draftKey){ try{ const d = JSON.parse(localStorage.getItem(draftKey)||'""'); setText(d||'') }catch{} } }, [draftKey])
  useEffect(()=>{ if(draftKey){ localStorage.setItem(draftKey, JSON.stringify(text)) } }, [text, draftKey])

  function onKeyDown(e){
    if(e.key==='Enter' && (e.metaKey || e.ctrlKey)) submit()
  }
  function submit(){
    if(!me) return
    const title = text.trim() ? text.trim().slice(0, 120) : `Training journal ${new Date().toLocaleDateString()}`
    addPost(me.id, title, 'note')
    setText(''); if(draftKey) localStorage.removeItem(draftKey)
    alert('Journal posted (demo).')
  }
  function addTag(t){ if(!t) return; setTags(prev => prev.includes(t)?prev:[...prev, t]) }

  return (
    <form className="card p-4 space-y-3" onSubmit={e=>{e.preventDefault(); submit()}} aria-label="Journal Composer">
      <textarea className="input min-h-28" aria-label="Training reflection" placeholder="How was your training today?" value={text} onChange={e=>setText(e.target.value)} onKeyDown={onKeyDown} />
      <div className="flex flex-wrap items-center gap-2">
        <input className="input w-40" aria-label="Technique tag" placeholder="#tag" onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); addTag(e.currentTarget.value.trim()); e.currentTarget.value='' } }} />
        <div className="flex gap-1">
          {tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
        <select className="input" aria-label="Mood" value={mood} onChange={e=>setMood(e.target.value)}>
          <option>🙂</option>
          <option>😐</option>
          <option>😓</option>
        </select>
        <select className="input" aria-label="Privacy" value={privacy} onChange={e=>setPrivacy(e.target.value)}>
          <option value="private">Private</option>
          <option value="friends">Friends</option>
          <option value="public">Public</option>
        </select>
        <Button type="submit" className="ml-auto h-10">Post</Button>
      </div>
    </form>
  )
}
