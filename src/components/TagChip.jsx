import React from 'react'

export default function TagChip({ label, selected=false, onClick }){
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${selected ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--color-bg-elevated)] text-[var(--color-text)] hover:opacity-90'}`}
    >
      {label}
    </button>
  )
}
