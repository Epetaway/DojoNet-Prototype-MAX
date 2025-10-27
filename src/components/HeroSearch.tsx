// HeroSearch: jumbotron-like hero with integrated search bar
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function HeroSearch() {
  const navigate = useNavigate()
  const [term, setTerm] = useState('')

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = term.trim()
    if (q) {
      navigate(`/explore?q=${encodeURIComponent(q)}`)
    } else {
      navigate('/explore')
    }
  }

  return (
    <section className="bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          Discover your martial arts journey
        </h1>
        <p className="mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">
          Follow instructors, track your progress, and find events near you.
        </p>

        <form
          onSubmit={onSearch}
          className="mt-8 flex w-full max-w-2xl rounded-xl bg-white/80 dark:bg-zinc-800/80 shadow-soft ring-1 ring-zinc-200 dark:ring-zinc-700 backdrop-blur"
        >
          <input
            className="flex-1 bg-transparent px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
            placeholder="Search techniques, events, or people"
            aria-label="Search"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          <button
            type="submit"
            className="m-1 rounded-lg bg-brand px-4 py-2.5 text-white font-semibold hover:bg-rose-600 transition"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  )
}
