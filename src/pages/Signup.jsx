
import React, { useState } from 'react'
import { useStore } from '../app/store'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createAccount, accountForEmail } from '../lib/auth'
import { Button } from '../components'

export default function Signup(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signUp } = useStore()
  const nav = useNavigate()
  const [qp] = useSearchParams()
  const intent = qp.get('intent')
  const onSubmit = (e)=>{
    e.preventDefault()
    if(accountForEmail(email)) return alert('Email already in use.')
    const user = signUp({ name, location: '' })
    const res = createAccount({ name, email, password, userId: user.id })
    if(!res.ok) return alert(res.message)
    // create session
    // eslint-disable-next-line no-undef
    useStore.setState({ session: { userId: user.id } })
    nav(intent || '/onboarding')
  }
  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="card p-6 space-y-4">
        <h1 className="text-xl font-heading uppercase">Create Account</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="input" aria-label="Name" value={name} onChange={e=>setName(e.target.value)} placeholder="Name" required />
          <input className="input" type="email" aria-label="Email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
          <input className="input" type="password" aria-label="Password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" required />
          <Button className="w-full" type="submit">Create account</Button>
        </form>
      </div>
    </div>
  )
}
