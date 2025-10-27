# DojoNet UI/UX and Component Implementation Document

This document is a practical reference for DojoNet’s user experience, UI design, component architecture, and implementation patterns across the frontend and prototype backend. It merges design direction, UX workflows, and working React + Tailwind CSS code for major components used in the app today.


## 1. Design and development overview

DojoNet is a modern martial arts social network inspired by early MySpace customization with 2025-grade design and community features. Users journal training, connect with verified gyms, discover events, and personalize their dojo page.

Core principles:
- Modular, responsive UI components with sensible motion and loading states
- Journal-first UX, with gentle prompts and fast post actions
- Verification and gym affiliation surfaced clearly but unobtrusively
- Safe interactions: scoped privacy, friendly defaults, accessible controls
- Personalization: light theming and layout editing for each dojo page

Tech baseline:
- React + Vite + Tailwind CSS
- State: Zustand (TypeScript-ready) with localStorage persistence
- Routing: React Router (lazy routes + Suspense skeletons)
- Icons: lucide-react
- Motion: Framer Motion (reduced motion aware)
- Virtualization: react-virtuoso
- Prototype backend: Node/Express JSON service (optional)


## 2. Styling and theming

Tailwind CSS drives layout and utilities. Brand tokens are expressed as CSS variables in `src/index.css` and referenced through utility classes (e.g., `bg-[var(--accent-primary)]`). Dark mode uses Tailwind’s class strategy (`.dark`).

Brand colors:
- Dojo Red: `#B71C1C`
- Matte Black: `#1A1A1A`
- Accent: `#E53935`
- Surface: `#FFFFFF`
- Text Primary: `#121212`

Common atoms/utilities available in the codebase:
- Buttons: `btn` (primary), outline variants via border tokens
- Inputs: `input`
- Surfaces: `card`
- Feedback: `Skeleton`, `Modal`, `Toast`


## 3. Component library (samples)

These samples mirror the live components and patterns in `src/components`. They’re shown in TSX form but work the same in JSX with minimal changes.

### 3.1 Button

```tsx
import React from 'react'
import cn from 'classnames'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline'
  loading?: boolean
}

export function Button({ variant='primary', loading=false, className, children, ...rest }: ButtonProps){
  const base = 'h-10 px-4 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] disabled:opacity-50 disabled:cursor-not-allowed'
  const styles = {
    primary: 'bg-[var(--accent-primary)] text-white hover:opacity-95',
    outline: 'border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-elevated)]'
  } as const
  return (
    <button className={cn(base, styles[variant], className)} disabled={loading || rest.disabled} {...rest}>
      {loading ? 'Loading…' : children}
    </button>
  )
}
```

Notes:
- Uses CSS variables for brand colors
- Accessible focus-visible ring
- `loading` disables interaction and shows a simple label

### 3.2 Feed card

```tsx
import React, { useState, useEffect } from 'react'
import { Heart, MessageSquare, Bookmark } from 'lucide-react'

export type FeedCardProps = {
  avatarUrl: string
  userName: string
  userRank?: string
  timestamp: string
  body: string
  onRespect?: () => void
  postId: string
}

export function FeedCard({ avatarUrl, userName, userRank, timestamp, body, onRespect, postId }: FeedCardProps){
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [comments, setComments] = useState<Array<{ id:string; name:string; avatar?:string; text:string; ts:number }>>([])
  const storageKey = `post_comments_${postId}`

  useEffect(()=>{ try{ const s = JSON.parse(localStorage.getItem(storageKey) || '[]'); if(Array.isArray(s)) setComments(s) }catch{} }, [storageKey])
  function add(){ const t=text.trim(); if(!t) return; const entry={ id:`${postId}_${Date.now()}`, name:'You', text:t, ts:Date.now() }; const next=[...comments, entry]; setComments(next); setText(''); try{ localStorage.setItem(storageKey, JSON.stringify(next)) }catch{} }

  return (
    <article className="card p-4 space-y-3">
      <header className="flex items-center gap-2">
        <img src={avatarUrl} alt="" className="h-8 w-8 rounded-lg"/>
        <div className="text-sm font-medium">{userName}</div>
        {userRank && <div className="text-xs text-[var(--color-text-muted)]">· {userRank}</div>}
        <div className="ml-auto text-xs text-[var(--color-text-muted)]">{timestamp}</div>
      </header>
      <p className="text-sm">{body}</p>
      <footer className="flex gap-3">
        <button className="px-3 h-9 rounded border" style={{borderColor:'var(--color-border)'}} onClick={onRespect}><Heart size={16}/> Respect</button>
        <button className="px-3 h-9 rounded border" style={{borderColor:'var(--color-border)'}} aria-expanded={open} onClick={()=>setOpen(v=>!v)}><MessageSquare size={16}/> Discuss</button>
        <button className="px-3 h-9 rounded border" style={{borderColor:'var(--color-border)'}}><Bookmark size={16}/> Save</button>
      </footer>
      {open && (
        <div className="border-t pt-3" style={{borderColor:'var(--color-border)'}}>
          <div className="max-h-48 overflow-auto space-y-2">
            {comments.length===0 ? <div className="text-xs text-[var(--color-text-muted)]">Be the first to start a discussion.</div> : comments.map(c=> (
              <div key={c.id} className="text-xs"><span className="font-medium">{c.name}</span> {c.text}</div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input className="input flex-1" placeholder="Write a comment…" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); add() } }} />
            <button className="px-3 h-9 rounded border" style={{borderColor:'var(--color-border)'}} onClick={add} disabled={!text.trim()}>Post</button>
          </div>
        </div>
      )}
    </article>
  )
}
```

Notes:
- Mirrors the inline comment drawer pattern used in the app
- Uses localStorage for prototype persistence

### 3.3 Journal composer

```tsx
import React from 'react'

type FormData = { body: string; tags: string[]; mood: string; privacy: 'PUBLIC'|'FRIENDS'|'PRIVATE' }

export function JournalComposer({ onSubmit }:{ onSubmit: (data:FormData) => void }){
  const [body, setBody] = React.useState('')
  const [privacy, setPrivacy] = React.useState<FormData['privacy']>('PRIVATE')

  return (
    <form className="card p-4 space-y-3" onSubmit={e=>{ e.preventDefault(); onSubmit({ body, tags:[], mood:'Neutral', privacy }); setBody('') }}>
      <textarea className="input min-h-[112px] resize-y" placeholder="How was your training today?" value={body} onChange={e=>setBody(e.target.value)} required />
      <div className="flex flex-wrap gap-2 items-center">
        <select value={privacy} onChange={e=>setPrivacy(e.target.value as FormData['privacy'])} className="px-3 py-1 border rounded">
          <option value="PUBLIC">Public</option>
          <option value="FRIENDS">Friends</option>
          <option value="PRIVATE">Private</option>
        </select>
        <button type="submit" className="ml-auto btn">Post</button>
      </div>
    </form>
  )
}
```

Notes:
- Aligns with privacy model in the spec
- Keep the UI responsive and simple; attach media in future iterations

### 3.4 Profile banner

```tsx
import React, { useMemo, useState } from 'react'

export function ProfileBanner({
  avatarUrl, displayName, usernameRaw, rankOrYears, gymName, gymVerified, tagline,
  onTaglineUpdate, onEditLayout
}:{
  avatarUrl:string; displayName:string; usernameRaw:string; rankOrYears:string; gymName:string; gymVerified:boolean; tagline:string;
  onTaglineUpdate:(t:string)=>void; onEditLayout:()=>void
}){
  const [edit, setEdit] = useState(false)
  const [local, setLocal] = useState(tagline)
  const username = useMemo(()=> usernameRaw.toLowerCase().replace(/[^a-z0-9_-]/g,'') , [usernameRaw])
  return (
    <section className="card p-4">
      <div className="flex items-start gap-4">
        <img src={avatarUrl} alt="" className="h-16 w-16 rounded-2xl object-cover"/>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-lg font-medium truncate">{displayName}</div>
            <div className="text-xs text-[var(--color-text-muted)] truncate">@{username}</div>
            {gymVerified ? (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Verified {gymName}</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Pending {gymName}</span>
            )}
          </div>
          <div className="text-sm text-[var(--color-text-muted)] mt-1 truncate">{rankOrYears}</div>
          <div className="mt-3 flex items-center gap-3">
            {edit ? (
              <input className="input flex-1" value={local} onChange={e=>setLocal(e.target.value)} onBlur={()=>{ if(local!==tagline) onTaglineUpdate(local); setEdit(false) }} />
            ) : (
              <input className="input flex-1" readOnly value={local} onFocus={()=>setEdit(true)} />
            )}
            <button className="px-3 h-10 rounded border" style={{borderColor:'var(--color-border)'}} onClick={onEditLayout}>Edit Dojo Page</button>
          </div>
        </div>
      </div>
    </section>
  )
}
```

### 3.5 Sidebar navigation

```tsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Users, MessageSquare, Video, Settings } from 'lucide-react'

const items = [
  { to:'/dashboard', label:'Dashboard', icon: Home },
  { to:'/journal', label:'My Journal', icon: BookOpen },
  { to:'/circle', label:'My Circle', icon: Users },
  { to:'/messages', label:'Messages', icon: MessageSquare },
  { to:'/tutorials', label:'Tutorials', icon: Video },
  { to:'/settings', label:'Settings', icon: Settings },
]

export function SidebarNav(){
  const { pathname } = useLocation()
  return (
    <nav className="space-y-2">
      {items.map(({to,label,icon:Icon})=>{
        const active = pathname.startsWith(to)
        return (
          <Link key={to} to={to} className={`flex items-center gap-2 px-2 py-1 rounded ${active? 'text-[var(--accent-primary)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>
            <Icon size={18}/> {label}
          </Link>
        )
      })}
    </nav>
  )
}
```

### 3.6 Tag chip

```tsx
import React from 'react'

export function TagChip({ label, selected=false, onClick }:{ label:string; selected?:boolean; onClick:()=>void }){
  return (
    <button onClick={onClick} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${selected? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text)] hover:opacity-90'}`}>{label}</button>
  )
}
```

### 3.7 Badge

```tsx
import React from 'react'

export function Badge({ label, variant='pending' }:{ label:string; variant?:'pending'|'verified'|'rejected' }){
  const map = { pending:'bg-gray-100 text-gray-700', verified:'bg-green-100 text-green-800', rejected:'bg-red-100 text-red-800' }
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[variant]}`}>{label}</span>
}
```

### 3.8 Feed filters

```tsx
import React from 'react'

type Opt = 'for_you'|'circle'|'gym'|'tutorials'
export function FeedFilters({ value, onChange }:{ value:Opt; onChange:(o:Opt)=>void }){
  const opts: Array<{key:Opt; label:string}> = [
    { key:'for_you', label:'For You' },
    { key:'circle', label:'My Circle' },
    { key:'gym', label:'My Gym' },
    { key:'tutorials', label:'Tutorials' },
  ]
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {opts.map(o => (
        <button key={o.key} onClick={()=>onChange(o.key)} className={`px-4 py-1 rounded-full text-sm font-medium ${value===o.key? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text)]'}`}>{o.label}</button>
      ))}
    </div>
  )
}
```

### 3.9 Progress mini

```tsx
import React from 'react'

export function ProgressMini({ streakDays, currentRank, nextRankXp, currentXp }:{ streakDays:number; currentRank:string; nextRankXp:number; currentXp:number }){
  const pct = Math.min(100, (currentXp/Math.max(1,nextRankXp))*100)
  return (
    <div className="card p-4 space-y-2">
      <div className="text-sm font-medium">Training Streak</div>
      <div className="text-lg font-bold text-[var(--accent-primary)]">{streakDays} days</div>
      <div className="w-full h-2 rounded-full bg-[var(--color-bg-elevated)]">
        <div className="h-2 rounded-full bg-[var(--accent-primary)]" style={{width:`${pct}%`}}/>
      </div>
      <div className="text-xs text-[var(--color-text-muted)]">Rank: {currentRank} · XP {currentXp}/{nextRankXp}</div>
    </div>
  )
}
```


## 4. Page structure and UX flow

High-level routes (React Router):
- `/` Home: landing + highlights, CTA for sign-up
- `/login`, `/signup` and `/onboarding`: auth and guided setup (interests, claims, verification intent)
- `/dashboard`: journal-first main page, feed filters, right-rail widgets
- `/profile/:id`: customizable dojo page
- `/events` and `/events/:id`: discovery and RSVP
- `/settings`: account, privacy, appearance

UX flows:
1) User signs up, selects top-3 interests, claims practice (rank or years), and sets gym affiliation intent
2) System tracks verification requests and surfaces them on Dashboard (banner + Manage)
3) Feed personalizes by scope (for_you, circle, gym, tutorials), virtualized for performance
4) Check-ins update progress widget; journal composer captures reflections quickly
5) Events leverage geo (lat/lon or ZIP) to prioritize nearby options


## 5. Backend architecture and logic (prototype)

Prototype server: `server/index.js` (Express + JSON file persistence). Toggle with `USE_BACKEND` in `src/lib/api.js`.

Implemented endpoints:
- Users: `GET /api/users`, `POST /api/users`, `PATCH /api/users/:id`
- Posts: `POST /api/posts`
- Follow: `POST /api/follow`
- Comments (profile wall): `POST /api/comment`
- Interests: `GET /api/interests`
- Claims: `POST /api/claims`, `GET /api/claims?userId`
- Verification: `GET /api/verificationRequests?userId`, `POST /api/verify/:reqId/approve`
- Events: `GET/POST /api/events`, `POST /api/events/:id/rsvp`
- Feed: `GET /api/feed?scope&limit&userId`
- Suggestions: `GET /api/user/suggestions?userId`
- Progress: `GET /api/stats/progress?userId`, `POST /api/stats/progress`

Notes:
- Frontend keeps graceful local fallbacks when the backend is off
- Event ranking uses Haversine distance when coords available, otherwise ZIP/date


## 6. Patterns and conventions

- State: colocate actions in the store slice; persist to localStorage; mirror to backend when enabled
- Loading states: `Skeleton` components for feed, events, suggestions, and profile banner
- Accessibility: focus-visible outlines, labeled inputs, target size, reduced motion
- Performance: virtualized feed (react-virtuoso); lazy-loaded routes with Suspense fallbacks
- Theming: `.dark` class on `<html>` with persisted preference


## 7. Testing

- Framework: Vitest + Testing Library; `happy-dom`
- Coverage: gating logic (e.g., tutorials restricted), core interactions where practical


## 8. How to run

Frontend only:
```bash
npm install
npm run dev
```

With backend:
```bash
npm run server   # backend at http://localhost:8787
npm run dev      # frontend
```
Set `USE_BACKEND = true` in `src/lib/api.js`.


## 9. Data shapes (excerpt)

Types live in `src/types` (when present). Common shapes:

```ts
export type Post = { id:string; title:string; date:string; type?: 'note'|'tutorial' }
export type User = {
  id:string; name:string; rank:string; gym:string; location:string;
  avatar:string; banner:string; theme:string; layout:{ left:string[]; right:string[] }
  posts: Post[]; friends:string[]; following:string[]; followers:string[]; dojoCircle:string[]
  comments: Array<{ id:string; userId:string; text:string; ts:number }>
  verifiedGym:boolean; rankLevel:number
}
```

---

This guide documents the default patterns used across DojoNet and can evolve with the product. For concrete implementations, see the corresponding files under `src/components`, `src/pages`, and the store in `src/app/store.ts`.
