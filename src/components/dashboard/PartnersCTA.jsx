import React from 'react'
import { Link } from 'react-router-dom'

export default function PartnersCTA(){
  return (
    <div className="card rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[var(--color-text)] font-semibold">Find Training Partners</h4>
          <p className="text-[var(--color-text-muted)] text-sm">Match by style, rank, and proximity.</p>
        </div>
        <Link to="/partners" className="px-3 py-2 text-xs rounded-md bg-[var(--accent-primary)] hover:opacity-95 text-white">Open</Link>
      </div>
    </div>
  )
}
