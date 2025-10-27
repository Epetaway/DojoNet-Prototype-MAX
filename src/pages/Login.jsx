
import React, { useEffect, useState } from 'react'
import { useStore } from '../store'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { loginWithEmail } from '../lib/auth'
import { Button } from '../components'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../lib/demo'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const nav = useNavigate()
  const [qp] = useSearchParams()
  const intent = qp.get('intent')
  const isDev = import.meta.env.DEV
  const { login, loginAsDemo } = useStore()
  
  useEffect(()=>{
    if(isDev){
      // Auto-fill demo credentials in dev only
      setEmail(DEMO_EMAIL)
      setPassword(DEMO_PASSWORD)
    }
  }, [])
  
  const onSubmit = (e)=>{
    e.preventDefault()
    const authRes = loginWithEmail({ email, password })
    if(authRes.ok){
      // Use store login which persists session
      const storeRes = login(authRes.name)
      if(storeRes.ok){
        nav(intent || '/dashboard')
      } else {
        alert('User not found in store')
      }
    }else{
      alert(authRes.message)
    }
  }
  
  const onDemo = (e)=>{
    e.preventDefault()
    const authRes = loginWithEmail({ email: DEMO_EMAIL, password: DEMO_PASSWORD })
    if(authRes.ok){
      // Use store login which persists session
      const storeRes = login('Demo User')
      if(storeRes.ok){
        nav('/dashboard')
      } else {
        alert('Demo user not found in store')
      }
    }else{
      alert('Demo account is unavailable. Try again or sign up.')
    }
  }

  const onQuickDemo = (e) => {
    e.preventDefault()
    loginAsDemo()
    nav(intent || '/dashboard')
  }
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="card p-6 space-y-4">
        <h1 className="text-xl font-heading uppercase">Login</h1>
        <p className="text-sm text-[var(--color-text-muted)]">Use the email and password you signed up with.</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="input" type="email" aria-label="Email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
          <input className="input" type="password" aria-label="Password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />
          <Button className="w-full" type="submit">Login</Button>
        </form>
        {isDev && (
          <div className="pt-2 border-t border-[var(--color-border)]">
            <Button variant="outline" className="w-full h-11" onClick={onDemo}>Login as Demo</Button>
            <div className="mt-2 text-xs text-[var(--color-text-muted)]" aria-live="polite">
              Prefilled with demo credentials: {DEMO_EMAIL} / {DEMO_PASSWORD}
            </div>
          </div>
        )}
        <div className="pt-2 border-t border-[var(--color-border)]">
          <button
            onClick={onQuickDemo}
            className="w-full px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
          >
            Continue as Demo
          </button>
          <div className="mt-2 text-xs text-center text-[var(--color-text-muted)]">
            Quick access with sample journal data
          </div>
        </div>
      </div>
    </div>
  )
}
