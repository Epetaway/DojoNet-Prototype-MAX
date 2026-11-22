
import React from 'react'
import { useParams } from 'react-router-dom'
import { useStore } from '../app/store'
import { Button } from '../components'
import FeedList from '../components/dashboard/FeedList.jsx'

const SKINS = [
  { key: 'tatami', name:'Tatami Dark', banner:'from-gray-900 via-neutral-800 to-black', accent:'red', fg:'text-neutral-100', bg:'bg-neutral-900' },
  { key: 'neon', name:'Neo City', banner:'from-black via-slate-900 to-indigo-950', accent:'fuchsia', fg:'text-slate-100', bg:'bg-slate-950' },
  { key: 'scroll', name:'Classic Scroll', banner:'from-stone-800 via-stone-700 to-stone-900', accent:'amber', fg:'text-stone-100', bg:'bg-stone-900' },
  { key: 'iron', name:'Iron Dojo', banner:'from-zinc-900 via-zinc-800 to-zinc-900', accent:'emerald', fg:'text-zinc-100', bg:'bg-zinc-950' },
];
const ACCENT = (a) => ({
  red: { pill:'bg-red-100 text-red-800 ring-1 ring-red-200', ring:'ring-red-200', bar:'bg-red-600' },
  fuchsia: { pill:'bg-fuchsia-100 text-fuchsia-800 ring-1 ring-fuchsia-200', ring:'ring-fuchsia-200', bar:'bg-fuchsia-500' },
  amber: { pill:'bg-amber-100 text-amber-900 ring-1 ring-amber-200', ring:'ring-amber-200', bar:'bg-amber-500' },
  emerald: { pill:'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200', ring:'ring-emerald-200', bar:'bg-emerald-500' },
})[a];

function Card({children,className=''}){ return <div className={`card ${className}`}>{children}</div> }
function SectionHeader({title,action}){ return <div className="flex items-center justify-between pb-3"><h3 className="text-sm uppercase tracking-wider text-[var(--color-text-muted)]">{title}</h3>{action}</div> }

function Bio({user, update}){
  return <Card className="p-4"><SectionHeader title="Bio" /><textarea value={user.bio} onChange={e=>update({bio:e.target.value})} className="input min-h-[90px]" placeholder="Write a short bio..." /></Card>
}
function Belt({accent}){
  return <Card className="p-4"><SectionHeader title="Belt Progress" /><div className="text-sm">White → Blue</div><div className="h-2 w-full bg-black/10 rounded-full mt-2 overflow-hidden"><div className={`${accent.bar} h-full`} style={{width:'28%'}}/></div><div className="text-xs text-[var(--color-text-muted)] mt-2">28% to next belt</div></Card>
}
function Affiliation({user, update}){
  return <Card className="p-4"><SectionHeader title="Affiliation" /><input className="input" aria-label="Affiliation" value={user.gym} onChange={e=>update({gym:e.target.value})} placeholder="Your affiliation (gym/school)" /><div className="mt-2 text-xs text-[var(--color-text-muted)]">{user.location}</div></Card>
}
function Badges(){ return <Card className="p-4"><SectionHeader title="Badges"/><div className="flex gap-2 text-xl"><span role="img" aria-label="fire">🔥</span><span role="img" aria-label="verified">✅</span><span role="img" aria-label="mind">🧠</span><span role="img" aria-label="trophy">🏆</span></div></Card> }
function Posts({user}){ return <Card className="p-4"><SectionHeader title="Recent Posts" /><ul className="space-y-2">{(user.posts||[]).slice(0,6).map(p=><li key={p.id} className="text-sm">• {p.title} <span className="text-xs text-[var(--color-text-muted)]">({p.date}{p.type==='tutorial'?' • tutorial':''})</span></li>)}</ul></Card> }
function Friends({user}){ const { users } = useStore(); const list = users.filter(u=>u.id!==user.id).slice(0,8); return <Card className="p-4"><SectionHeader title="Dojo Circle" /><div className="grid grid-cols-4 gap-3">{list.map(f=>(<div key={f.id} className="text-center"><img src={f.avatar} alt="" aria-hidden="true" className="avatar avatar-lg mx-auto"/><div className="text-[11px] text-[var(--color-text-muted)] truncate mt-1">{f.name}</div></div>))}</div></Card> }
function Stats(){ return <Card className="p-4"><SectionHeader title="Training Stats"/><div className="grid grid-cols-3 text-center gap-3"><div><div className="text-2xl font-bold">6h</div><div className="text-xs text-[var(--color-text-muted)]">This week</div></div><div><div className="text-2xl font-bold">34</div><div className="text-xs text-[var(--color-text-muted)]">Sessions</div></div><div><div className="text-2xl font-bold">3</div><div className="text-xs text-[var(--color-text-muted)]">Seminars</div></div></div></Card> }

function Wall({user, isMe}){
  const { users, comment, session } = useStore()
  const [text,setText] = React.useState('Great work!')
  const author = users.find(u=>u.id===session.userId)
  return <Card className="p-4">
    <SectionHeader title="Wall Comments" />
    <div className="space-y-3">
  {author && <div className="flex gap-2"><input className="input" aria-label="Comment" value={text} onChange={e=>setText(e.target.value)} placeholder="Write a comment..."/><Button onClick={()=>{ if(text.trim()){ comment(user.id, text.trim()); setText(''); } }}>Post</Button></div>}
  <ul className="space-y-2">{user.comments.map(c=>{ const u = users.find(x=>x.id===c.userId) || {name:'Anon', avatar:''}; return (<li key={c.id} className="flex gap-2 items-start"><img src={u.avatar} alt="" aria-hidden="true" className="avatar avatar-md"/><div><div className="text-sm"><span className="font-medium">{u.name}</span>: {c.text}</div><div className="text-xs text-[var(--color-text-muted)]">{new Date(c.ts).toLocaleString()}</div></div></li>)})}</ul>
    </div>
  </Card>
}
function Top8Editor({user}){
  const { users, setTop8 } = useStore()
  const [sel,setSel] = React.useState(user.dojoCircle || [])
  const options = users.filter(u=>u.id!==user.id)
  return <Card className="p-4">
  <SectionHeader title="Dojo Circle (Top 8)" action={<Button onClick={()=>setTop8(user.id, sel)}>Save</Button>} />
    <div className="grid md:grid-cols-4 gap-3">
      <select multiple value={sel} onChange={(e)=>{ setSel(Array.from(e.target.selectedOptions).map(o=>o.value).slice(0,8)); }} className="input min-h-[180px] col-span-2">
        {options.map(o=>(<option key={o.id} value={o.id}>{o.name}</option>))}
      </select>
  <div className="col-span-2"><div className="text-xs text-white/60 mb-1">Selected</div><div className="grid grid-cols-4 gap-3">{sel.map(id=>{ const u = users.find(x=>x.id===id); return (<div key={id} className="text-center"><img src={u?.avatar} alt="" aria-hidden="true" className="avatar avatar-lg mx-auto"/><div className="text-[11px] text-white/70 truncate">{u?.name}</div></div>)})}</div></div>
    </div>
  </Card>
}

const WIDGETS = { bio:Bio, belt:Belt, gym:Affiliation, badges:Badges, posts:Posts, friends:Friends, stats:Stats }
// Profiles saved without a layout (the demo data has none) get the default one.
const DEFAULT_LAYOUT = { left: ['bio','belt','gym','badges'], right: ['posts','friends','stats'] }

export default function Profile(){
  const { id } = useParams()
  const { users, session, updateUser, reorderLayout, toggleVerified, setRankLevel } = useStore()
  const user = users.find(u=>u.id===id)
  const me = users.find(u=>u.id===session.userId)
  const isMe = me && me.id===user?.id
  const [section, setSection] = React.useState('About')
  if(!user) return <div className="max-w-6xl mx-auto px-4 py-10">User not found.</div>
  const skin = SKINS.find(s=>s.key===user.theme) || SKINS[0]
  const accent = ACCENT(skin.accent)

  const layout = user.layout?.left && user.layout?.right ? user.layout : DEFAULT_LAYOUT

  const onDragStart = (wid)=>(e)=>{ if(!isMe) return; e.dataTransfer.setData('text/plain', wid) }
  const allowDrop = e=> isMe && e.preventDefault()
  const onDropTo = (side)=>(e)=>{
    if(!isMe) return;
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    const left = layout.left.filter(w=>w!==id)
    const right = layout.right.filter(w=>w!==id)
    const next = { left, right }
    next[side] = [...next[side], id]
    reorderLayout(user.id, next)
  }

  const update = (patch)=>updateUser(user.id, patch)

  return (
    <div>
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4">
        <div className={`rounded-3xl overflow-hidden border shadow-sm ${accent.ring}`} style={{borderColor:'var(--color-border)'}}>
          <div className={`relative h-44 md:h-56 bg-gradient-to-r ${skin.banner}`}>
            <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 20% 30%, rgba(255,255,255,.4), transparent 40%)'}}/>
          </div>
          <div className="p-4 md:p-6 -mt-12 md:-mt-14 relative">
            <div className="flex items-end gap-4">
              <img src={user.avatar} alt="" aria-hidden="true" className="avatar avatar-2xl md:h-28 md:w-28 ring-4 ring-white" />
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-display uppercase">{user.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                  <span className={`px-2.5 py-1 rounded-full ${accent.pill}`}>{user.rank}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--color-elevated)] text-[11px] uppercase tracking-wide">{(user.role||'student').replace('_',' ')}</span>
                  <span className="text-[var(--color-text-muted)]">• {user.gym || 'No affiliation yet'}</span>
                  <span className="text-[var(--color-text-muted)]">• {user.location}</span>
                </div>
                {/* Top 8 strip */}
                <div className="mt-3 flex -space-x-3">
                  {(user.dojoCircle||[]).slice(0,8).map(id=>{
                    const u = users.find(x=>x.id===id); 
                    return u ? <img key={id} src={u.avatar} title={u.name} alt="" aria-hidden="true" className="avatar avatar-md ring-2 ring-white"/> : null
                  })}
                </div>
              </div>
              {isMe && <div className="hidden md:block"><Button variant="outline" className="px-4 py-2 rounded-xl text-sm" onClick={()=>update({theme: skin.key==='tatami'?'neon':'tatami'})}>Toggle Skin</Button></div>}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
              {isMe && <label className="flex items-center gap-2 text-[var(--color-text-muted)]"><input type="checkbox" aria-label="Verified affiliation" checked={!!user.verifiedGym} onChange={()=>toggleVerified(user.id)} /> Verified Affiliation</label>}
              {isMe && <select className="input max-w-[160px]" value={user.rankLevel} onChange={e=>setRankLevel(user.id, Number(e.target.value))}>
                <option value={1}>White</option><option value={2}>Blue</option><option value={3}>Purple</option><option value={4}>Brown</option><option value={5}>Black</option><option value={6}>Coach</option>
              </select>}
              {isMe && <select className="input max-w-[160px]" value={user.role||'student'} onChange={e=>update({ role: e.target.value })}>
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="professor">Professor</option>
                <option value="owner">Owner</option>
              </select>}
            </div>
            <div className="mt-4"><input className="input w-full md:w-[420px]" aria-label="Status" value={user.status} onChange={e=>isMe && update({status:e.target.value})} placeholder="Update your status..." /></div>
            <div className="mt-6 border-t pt-3 text-[var(--color-text-muted)] flex gap-2 text-sm" style={{borderColor:'var(--color-border)'}}>
              <Button variant={section==='About' ? 'primary' : 'ghost'} className="h-8 px-3" aria-current={section==='About'} onClick={()=>setSection('About')}>About</Button>
              <Button variant={section==='Feed' ? 'primary' : 'ghost'} className="h-8 px-3" aria-current={section==='Feed'} onClick={()=>setSection('Feed')}>Feed</Button>
              <Button variant={section==='Training' ? 'primary' : 'ghost'} className="h-8 px-3" aria-current={section==='Training'} onClick={()=>setSection('Training')}>Training</Button>
              <Button variant={section==='Videos' ? 'primary' : 'ghost'} className="h-8 px-3" aria-current={section==='Videos'} onClick={()=>setSection('Videos')}>Videos</Button>
              <Button variant={section==='Friends' ? 'primary' : 'ghost'} className="h-8 px-3" aria-current={section==='Friends'} onClick={()=>setSection('Friends')}>Friends</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Section content */}
      {section==='About' && (
        <>
          {/* Layout */}
          <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 space-y-6" onDragOver={allowDrop} onDrop={onDropTo('left')}>
              {layout.left.map(id=>{ const W=WIDGETS[id]; return <div key={id} draggable={isMe} onDragStart={onDragStart(id)} className={isMe?'cursor-move':''}><W user={user} update={isMe?update:()=>{}} accent={accent} /></div> })}
            </div>
            <div className="md:col-span-5 space-y-6" onDragOver={allowDrop} onDrop={onDropTo('right')}>
              {layout.right.map(id=>{ const W=WIDGETS[id]; return <div key={id} draggable={isMe} onDragStart={onDragStart(id)} className={isMe?'cursor-move':''}><W user={user} update={isMe?update:()=>{}} accent={accent} /></div> })}
            </div>
          </div>
          {/* Extended sections */}
          <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 space-y-6"><Wall user={user} isMe={!!me} /></div>
            <div className="md:col-span-5 space-y-6">{isMe && <Top8Editor user={user} />}</div>
          </div>
        </>
      )}

      {section==='Feed' && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <FeedList scope="for_you" filterByUserId={user.id} emptyMessage="No posts from this user yet." />
        </div>
      )}

      {section==='Training' && (
        <div className="max-w-6xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-6"><Belt accent={accent} /><Stats /></div>
          <div className="md:col-span-5 space-y-6"><Affiliation user={user} update={isMe?update:()=>{}} /></div>
        </div>
      )}

      {section==='Videos' && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <Card className="p-4">
            <SectionHeader title="Videos" />
            <ul className="space-y-2">
              {(user.posts||[]).filter(p=>p.type==='video').length ? (
                (user.posts||[]).filter(p=>p.type==='video').map(p => (
                  <li key={p.id} className="text-sm">• {p.title} <span className="text-xs text-[var(--color-text-muted)]">({p.date})</span></li>
                ))
              ) : (
                <li className="text-sm text-[var(--color-text-muted)]">No videos yet.</li>
              )}
            </ul>
          </Card>
        </div>
      )}

      {section==='Friends' && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <Friends user={user} />
        </div>
      )}
    </div>
  )
}
