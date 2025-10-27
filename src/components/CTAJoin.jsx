import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '.'

export default function CTAJoin(){
  return (
    <section className="mt-12 card p-5 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1">
        <div className="font-medium">Join the conversation</div>
        <div className="text-sm text-[var(--color-text-muted)]">Create a free account and start sharing with your community.</div>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/signup"><Button className="h-11 px-6">Join Free</Button></Link>
        <Link to="/login"><Button variant="outline" className="h-11 px-6">Login</Button></Link>
      </div>
    </section>
  )
}
