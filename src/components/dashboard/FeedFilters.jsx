import React from 'react'
import { Button } from '../index'

const tabs = [
  { key:'for_you', label:'For You' },
  { key:'circle', label:'My Circle' },
  { key:'tutorials', label:'Tutorials' },
]

export default function FeedFilters({ value, onChange }){
  return (
    <div className="card p-2">
      <div className="flex gap-2">
        {tabs.map(t => (
          <Button
            key={t.key}
            variant={value===t.key ? 'primary' : 'ghost'}
            className={`h-9 px-3 rounded ${value===t.key ? '' : 'text-[var(--color-text-muted)] bg-[var(--color-elevated)] hover:bg-[var(--color-elevated)]'}`}
            onClick={()=>onChange?.(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
