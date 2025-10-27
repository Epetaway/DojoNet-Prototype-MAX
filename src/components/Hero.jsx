import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../app/store'
import { Button } from '.'
import { getPlaceholders } from '../lib/placeholders'
import AttributionBadge from './AttributionBadge.jsx'

export default function Hero(){
  const navigate = useNavigate()
  const { session, loginAsDemo } = useStore()
  const [bg, setBg] = React.useState(null)
  const [bgItem, setBgItem] = React.useState(null)
  const [term, setTerm] = React.useState('')
  React.useEffect(()=>{ (async()=>{
    const hero = await getPlaceholders('hero');
    if(hero && hero[0]){ setBg(`/placeholders/${hero[0].filename}`); setBgItem(hero[0]) }
  })() },[])
  function onSearch(e){
    e.preventDefault()
    const q = term.trim()
    if(q){ navigate(`/explore?q=${encodeURIComponent(q)}`) }
    else { navigate('/explore') }
  }
  return (
    <section className="relative text-center py-12 overflow-hidden rounded-3xl bg-[var(--color-surface)] shadow-sm">
      <div className="absolute inset-0 bg-fallback-dark" aria-hidden />
      {bg && (
        <>
          <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
          <AttributionBadge item={bgItem} />
        </>
      )}
      <div className="relative z-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-wide text-brand dark:text-white">Discover Your Martial Arts Journey</h1>
        <p className="mt-3 text-lg md:text-xl text-white/90 dark:text-[var(--color-text-muted)] max-w-3xl mx-auto">Join a community of practitioners, follow your interests, track your progress and connect with others.</p>

        {/* Search Bar */}
        <form onSubmit={onSearch} className="mt-6 flex justify-center gap-2 md:gap-3 max-w-3xl mx-auto px-2">
          <input
            type="search"
            className="input flex-1 h-12 md:h-14 text-base md:text-lg"
            placeholder="Search techniques, events or users…"
            aria-label="Search"
            value={term}
            onChange={e=>setTerm(e.target.value)}
          />
          <Button type="submit" className="h-12 md:h-14 px-5 md:px-6">Search</Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
          {!session.userId && (
            <button
              onClick={() => { loginAsDemo?.(); navigate('/dashboard') }}
              className="h-11 px-6 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition"
            >
              Continue as Demo
            </button>
          )}
          <Link to="/signup"><Button className="h-11 px-6">Join Free</Button></Link>
          <Link to="/login"><Button variant="outline" className="h-11 px-6">Login</Button></Link>
        </div>
        <div className="mt-4 text-xs text-[var(--color-text-muted)]" aria-live="polite">4.7k online now</div>
      </div>
    </section>
  )
}
