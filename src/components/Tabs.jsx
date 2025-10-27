import { useState } from 'react'
import { Button } from './index'

export function Tabs({ tabs = [], initial = 0, onChange }){
  const [active, setActive] = useState(initial)
  return (
    <div className="flex gap-2">
      {tabs.map((t, i) => (
        <Button
          key={i}
          variant={i===active ? 'primary' : 'ghost'}
          className={`px-3 h-8 rounded-lg text-sm ${i===active ? '' : 'text-[var(--color-text-muted)] bg-[var(--color-elevated)] hover:bg-[var(--color-elevated)]'}`}
          onClick={() => { setActive(i); onChange && onChange(i) }}
        >
          {t}
        </Button>
      ))}
    </div>
  )
}
