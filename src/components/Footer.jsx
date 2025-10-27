import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer(){
  return (
    <footer className="mt-12 py-8 text-sm text-[var(--color-text-muted)]">
      <div className="mx-auto max-w-[1440px] px-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
        <nav className="flex items-center gap-4">
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/community" className="hover:underline">Community</Link>
          <Link to="/blog" className="hover:underline">Blog</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
          <Link to="/privacy" className="hover:underline">Privacy</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span aria-hidden>•</span>
          <a href="#" aria-label="Twitter" className="hover:underline">Twitter</a>
          <a href="#" aria-label="Instagram" className="hover:underline">Instagram</a>
        </div>
      </div>
    </footer>
  )
}
