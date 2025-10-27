// Minimal auth helper for dev: stores accounts in localStorage
// Shape: { email, name, password, userId, emailVerified: true }

const KEY = 'auth_accounts_v1'

function load(){
  try{ return JSON.parse(localStorage.getItem(KEY)) || [] }catch{ return [] }
}
function save(list){ localStorage.setItem(KEY, JSON.stringify(list)) }

export function createAccount({ name, email, password, userId }){
  const accounts = load()
  const exists = accounts.some(a => a.email.toLowerCase()===String(email).toLowerCase())
  if(exists) return { ok:false, message:'An account with this email already exists.' }
  accounts.push({ name, email, password, userId, emailVerified:true })
  save(accounts)
  return { ok:true }
}

export function loginWithEmail({ email, password }){
  const accounts = load()
  const acct = accounts.find(a => a.email.toLowerCase()===String(email).toLowerCase() && a.password===password)
  if(!acct) return { ok:false, message:'Invalid email or password.' }
  return { ok:true, userId: acct.userId, name: acct.name }
}

export function accountForEmail(email){
  const accounts = load()
  return accounts.find(a => a.email.toLowerCase()===String(email).toLowerCase()) || null
}
