import { create } from 'zustand'
import { LS, uid } from '../lib/storage'
import { USE_BACKEND, api } from '../lib/api'
import type { User } from '../types'

export type Session = { userId: string | null }

type AuthSlice = {
  session: Session
  login: (nameLike: string) => { ok: boolean; user?: User; message?: string }
  logout: () => void
  signUp: (input: { name: string; location: string }) => User
  loginAsDemo?: () => { ok: boolean; user?: User }
}

type UsersSlice = {
  users: User[]
  canTeach: (rankLevel: number, verifiedGym: boolean) => boolean
  updateUser: (id: string, patch: Partial<User>) => void
  addPost: (id: string, title: string, type?: 'note' | 'tutorial') => void
  follow: (meId: string, targetId: string) => void
  comment: (targetUserId: string, text: string) => void
  setTop8: (userId: string, list: string[]) => void
  toggleVerified: (userId: string) => void
  setRankLevel: (userId: string, lvl: number) => void
  reorderLayout: (id: string, layout: { left: string[]; right: string[] }) => void
}

export type StoreState = AuthSlice & UsersSlice

const seedUsers = (): User[] => ([
  { id:'u_jason', name:'Jason Doe', role:'student', rank:'Blue Belt', gym:'Cobra MMA', location:'Los Angeles, CA',
    bio:'Flow like water. Student first.', status:'Training Muay Thai tonight',
    avatar:'https://i.pravatar.cc/200?img=12', banner:'', theme:'tatami',
    layout:{ left:['bio','belt','gym','badges'], right:['playlist','posts','friends','stats'] },
    playlist:'https://open.spotify.com/embed/playlist/37i9dQZF1DX76Wlfdnj7AP?utm_source=generator',
    posts:[ {id:uid('p'), title:'Road to the next level', date:'2 days ago', type:'note'} ],
    friends:[], following:[], followers:[], dojoCircle:[], comments:[], verifiedGym:false, rankLevel:2
  },
  { id:'u_maria', name:'Maria Tan', role:'instructor', rank:'Purple Belt', gym:'Eastside BJJ', location:'Seattle, WA',
    bio:'Grip fight, breathe, flow.', status:'No-gi tonight', avatar:'https://i.pravatar.cc/200?img=45', banner:'', theme:'iron',
    layout:{ left:['bio','belt','gym','badges'], right:['posts','friends','stats'] },
    playlist:'',
    posts:[{id:uid('p'), title:'Passing notes', date:'Mar 28', type:'note'}],
    friends:[], following:[], followers:[], dojoCircle:[], comments:[], verifiedGym:true, rankLevel:3
  },
  { id:'u_lee', name:'Lee Park', role:'student', rank:'Brown Belt', gym:'Tiger Muay Thai', location:'NYC, NY',
    bio:'Kick low. Check high.', status:'Padwork 6am', avatar:'https://i.pravatar.cc/200?img=33', banner:'', theme:'neon',
    layout:{ left:['bio','belt','gym'], right:['posts','friends','stats'] },
    playlist:'',
    posts:[{id:uid('p'), title:'Southpaw angles', date:'1 week ago', type:'note'}],
    friends:[], following:[], followers:[], dojoCircle:[], comments:[], verifiedGym:false, rankLevel:4
  }
])

const initialUsers: User[] = LS.get('users', seedUsers())
const initialSession: Session = LS.get('session', { userId: null })

export const useStore = create<StoreState>((set, get) => ({
  // Auth slice
  session: initialSession,
  login(nameLike) {
    const user = get().users.find(u => u.name.toLowerCase().includes(String(nameLike).toLowerCase()))
    if (user) {
      const session = { userId: user.id }
      set({ session }); LS.set('session', session)
      return { ok: true, user }
    }
    return { ok: false, message: 'User not found. Try Sign Up.' }
  },
  logout() {
    const session = { userId: null }
    set({ session }); LS.set('session', session)
  },
  signUp({ name, location }) {
    const id = uid('u')
  const user: User = { id, name, role:'student', rank: 'White Belt', gym: '', location, bio: '', status: '',
      avatar: `https://i.pravatar.cc/200?u=${id}`, banner: '', theme: 'tatami',
      layout: { left: ['bio','belt','gym','badges'], right: ['posts','friends','stats','wall'] },
      playlist: '', posts: [], friends: [], following: [], followers: [], dojoCircle: [], comments: [], verifiedGym: false, rankLevel: 1
    }
    const users = [...get().users, user]
    set({ users }); LS.set('users', users)
    const session = { userId: id }; set({ session }); LS.set('session', session)
    if (USE_BACKEND) { api('POST', '/users', user).catch(()=>{}) }
    return user
  },
  loginAsDemo() {
    // Ensure a demo user exists in users list and seed demo data
    const DEMO_ID = 'u_demo'
    const seedDemo = async () => {
      try {
        const res = await fetch('/DojoNet-Prototype-MAX/demo-data.json');
        const demoData = await res.json();
        // Seed users
        LS.set('users', demoData.users);
        // Seed journals
        LS.set('journals_u_demo', demoData.journals);
        // Seed techniques
        LS.set('techniques_u_demo', demoData.techniques);
        // Seed goals
        LS.set('goals_u_demo', demoData.goals);
        // Seed sparring
        LS.set('sparring_u_demo', demoData.sparring);
        // Seed partners
        LS.set('partners_u_demo', demoData.partners);
        set({ users: demoData.users });
      } catch (e) {
        // fallback: just add demo user
        const existing = get().users
        let users = existing
        if (!existing.find(u => u.id === DEMO_ID)) {
          const demo: User = {
            id: DEMO_ID,
            name: 'Demo User',
            role: 'instructor',
            rank: 'Black Belt',
            gym: 'Bay City BJJ',
            location: 'San Francisco, CA',
            bio: 'This is a rich demo profile packed with activity.',
            status: 'Rolling tonight!',
            avatar: 'https://i.pravatar.cc/200?img=5',
            banner: '',
            theme: 'tatami',
            layout: { left: ['bio','belt','gym','badges'], right: ['posts','friends','stats'] },
            playlist: '',
            posts: [],
            friends: [], following: [], followers: [], dojoCircle: [], comments: [],
            verifiedGym: false,
            rankLevel: 5,
          }
          users = [...existing, demo]
          set({ users }); LS.set('users', users)
        }
      }
    }
    seedDemo();
    const session = { userId: DEMO_ID }
    set({ session }); LS.set('session', session)
    return { ok: true, user: get().users.find(u => u.id === DEMO_ID) }
  },

  // Users slice
  users: initialUsers,
  canTeach(rankLevel, verifiedGym){ return (rankLevel>=5) || !!verifiedGym },

  updateUser(id, patch){
    const users = get().users.map(u => u.id===id ? { ...u, ...patch } as User : u)
    set({ users }); LS.set('users', users)
    if (USE_BACKEND) { api('PATCH', `/users/${id}`, patch).catch(()=>{}) }
  },

  addPost(id, title, type='note'){
    const me = get().users.find(u=>u.id===id)
    if (!me) return
    if(type==='tutorial' && !(get().canTeach(me.rankLevel, me.verifiedGym))){
      alert('Tutorials are gated. You must be Black Belt or have a verified affiliation.')
      return
    }
    const post = { id: uid('p'), title, date:'just now', type }
    const users = get().users.map(u => u.id===id ? { ...u, posts:[post, ...u.posts] } as User : u)
    set({ users }); LS.set('users', users)
    if (USE_BACKEND) { api('POST','/posts',{ userId:id, post }).catch(()=>{}) }
  },

  follow(meId, targetId){
    if(meId===targetId) return
    const users = get().users.map(u => {
      if(u.id===meId && !u.following.includes(targetId)) return { ...u, following:[...u.following, targetId] } as User
      if(u.id===targetId && !u.followers.includes(meId)) return { ...u, followers:[...u.followers, meId] } as User
      return u
    })
    set({ users }); LS.set('users', users)
    if (USE_BACKEND) { api('POST','/follow',{ meId, targetId }).catch(()=>{}) }
  },

  comment(targetUserId, text){
    const entry = { id: uid('c'), userId: get().session.userId ?? '', text, ts: Date.now() }
    const users = get().users.map(u => u.id===targetUserId ? { ...u, comments:[entry, ...u.comments] } as User : u)
    set({ users }); LS.set('users', users)
    if (USE_BACKEND) { api('POST','/comment',{ targetUserId, authorId: entry.userId, text, ts: entry.ts }).catch(()=>{}) }
  },

  setTop8(userId, list){
    const users = get().users.map(u => u.id===userId ? { ...u, dojoCircle: list.slice(0,8) } as User : u)
    set({ users }); LS.set('users', users)
    if (USE_BACKEND) { api('PATCH', `/users/${userId}`, { dojoCircle: list.slice(0,8) }).catch(()=>{}) }
  },

  toggleVerified(userId){
    const users = get().users.map(u => u.id===userId ? { ...u, verifiedGym: !u.verifiedGym } as User : u)
    set({ users }); LS.set('users', users)
    if (USE_BACKEND) { const user = users.find(u=>u.id===userId); if (user) api('POST','/verify',{ userId, verifiedGym: user.verifiedGym }).catch(()=>{}) }
  },

  setRankLevel(userId, lvl){
    const users = get().users.map(u => u.id===userId ? { ...u, rankLevel: lvl } as User : u)
    set({ users }); LS.set('users', users)
    if (USE_BACKEND) { api('POST','/verify',{ userId, rankLevel: lvl }).catch(()=>{}) }
  },

  reorderLayout(id, layout){
    const users = get().users.map(u => u.id===id ? { ...u, layout } as User : u)
    set({ users }); LS.set('users', users)
    if (USE_BACKEND) { api('PATCH', `/users/${id}`, { layout }).catch(()=>{}) }
  },
}))

// On module load, try pulling from backend to replace local seed
;(async () => {
  try{
    if(USE_BACKEND){
      const users = await api('GET','/users')
      if(Array.isArray(users) && users.length){
        useStore.setState({ users })
        LS.set('users', users)
      }
    }
  }catch(e){ console.warn('Backend not reachable:', (e as Error)?.message) }
})()
