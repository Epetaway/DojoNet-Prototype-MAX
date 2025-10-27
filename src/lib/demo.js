// Demo helpers: ensure a demo auth account exists for quick login
import { accountForEmail, createAccount } from './auth'
import { LS } from './storage'

export const DEMO_EMAIL = 'demo@dojonet.local'
export const DEMO_PASSWORD = 'DojoNetDemo2024!'
export const DEMO_USER_ID = 'u_demo'

export function ensureDemoAccount(){
  try{
    // Enable in both dev AND production for GitHub Pages demo
    const exists = accountForEmail(DEMO_EMAIL)
    if(!exists){
      createAccount({ name:'Demo User', email: DEMO_EMAIL, password: DEMO_PASSWORD, userId: DEMO_USER_ID })
    } else {
      // Update password if account exists (in case password changed)
      const KEY = 'auth_accounts_v1'
      try {
        const accounts = JSON.parse(localStorage.getItem(KEY)) || []
        const index = accounts.findIndex(a => a.email.toLowerCase() === DEMO_EMAIL.toLowerCase())
        if (index !== -1) {
          accounts[index].password = DEMO_PASSWORD
          localStorage.setItem(KEY, JSON.stringify(accounts))
        }
      } catch {}
    }
    
    // Ensure a demo user exists in local users list for offline/local mode
    const users = LS.get('users', [])
    if(!Array.isArray(users)) return
    if(!users.find(u => u.id === DEMO_USER_ID)){
      const demoUser = {
        id: DEMO_USER_ID, name:'Demo User', role:'instructor', rank:'Black Belt', gym:'Bay City BJJ', location:'San Francisco, CA',
        bio:'This is a rich demo profile packed with activity.', status:'Rolling tonight!',
        avatar:'https://i.pravatar.cc/200?img=5', banner:'', theme:'tatami',
        layout:{ left:['bio','belt','gym','badges'], right:['playlist','posts','friends','stats'] },
        playlist:'https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP',
        posts:[
          {id:'p_dem_1', title:'Fundamentals: Armbar mechanics', date:'1d ago', type:'tutorial'},
          {id:'p_dem_2', title:'No-gi passing chains', date:'2d ago', type:'tutorial'},
          {id:'p_dem_3', title:'Reflections from last open mat', date:'3d ago', type:'note'},
          {id:'p_dem_4', title:'Half guard top pressure', date:'Sep 15', type:'note'},
          {id:'p_dem_5', title:'My top 3 takedowns', date:'Sep 01', type:'note'}
        ],
        comments:[
          { id:'c_dem_1', userId:'u_ava', text:'Love the armbar cues!', ts: Date.now()-86400000*2 },
          { id:'c_dem_2', userId:'u_ben', text:'Passing chain looks solid.', ts: Date.now()-86400000*3 }
        ],
        friends:[], following:['u_ava','u_ben','u_carlos','u_diana'], followers:['u_ava','u_ben','u_carlos','u_diana'], dojoCircle:[], verifiedGym:true, rankLevel:6
      }
      LS.set('users', [demoUser, ...users])
    }
  }catch{}
}
