import React, { useState } from 'react'
import { Button } from '../components'

export default function Settings(){
  const [email, setEmail] = useState('')
  const [notify, setNotify] = useState(true)
  const [accent, setAccent] = useState('red')
  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="card p-4 mb-4">
        <h1 className="text-xl font-heading uppercase">Settings</h1>
      </div>
      <div className="card p-4 space-y-4">
        <div>
          <label className="block text-sm text-[var(--color-text-muted)] mb-1" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div className="flex items-center gap-2">
          <input id="notify" type="checkbox" checked={notify} onChange={()=>setNotify(v=>!v)} />
          <label htmlFor="notify" className="text-sm">Enable notifications</label>
        </div>
        <div>
          <label className="block text-sm text-[var(--color-text-muted)] mb-1" htmlFor="accent">Accent Color</label>
          <select id="accent" className="input" value={accent} onChange={e=>setAccent(e.target.value)}>
            <option value="red">Dojo Red</option>
            <option value="teal">Forest Teal</option>
            <option value="amber">Amber Gold</option>
          </select>
        </div>
        <div>
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
