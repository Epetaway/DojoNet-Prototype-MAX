#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const dataPath = path.join(root, 'server', 'data.json')

function loadJSON(p){ try{ return JSON.parse(fs.readFileSync(p,'utf8')) }catch{ return {} } }
function saveJSON(p, obj){ fs.writeFileSync(p, JSON.stringify(obj, null, 2)) }
function backup(p){ const dir=path.dirname(p); const base=path.basename(p, path.extname(p)); const ts=new Date().toISOString().replace(/[:.]/g,'-'); const out=path.join(dir, `${base}.backup.${ts}.json`); fs.copyFileSync(p, out); return out }

const demoUsers = [
  {
    id:'u_demo', name:'Demo User', role:'instructor', rank:'Black Belt', gym:'Bay City BJJ', location:'San Francisco, CA',
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
    friends:[], following:['u_ava','u_ben','u_carlos','u_diana'], followers:['u_ava','u_ben','u_carlos','u_diana','u_elliot','u_fiona','u_greg'], dojoCircle:[], verifiedGym:true, rankLevel:6
  },
  { id:'u_ava', name:'Ava Kim', role:'student', rank:'Blue Belt', gym:'Northside BJJ', location:'Seattle, WA', bio:'Grip and go.', status:'Drills & skills', avatar:'https://i.pravatar.cc/200?img=12', banner:'', theme:'iron', layout:{ left:['bio','belt','gym'], right:['posts','friends','stats'] }, playlist:'', posts:[{id:'p_ava_1', title:'First comp notes', date:'Sep 18', type:'note'}], friends:[], following:['u_demo'], followers:['u_demo'], dojoCircle:[], comments:[], verifiedGym:false, rankLevel:2 },
  { id:'u_ben', name:'Ben Ortiz', role:'student', rank:'Purple Belt', gym:'Eastside BJJ', location:'Portland, OR', bio:'Pass. Smash. Submit.', status:'Leglock study', avatar:'https://i.pravatar.cc/200?img=33', banner:'', theme:'neon', layout:{ left:['bio','belt','gym'], right:['posts','friends','stats'] }, playlist:'', posts:[{id:'p_ben_1', title:'Smash pass pathway', date:'Aug 30', type:'note'}], friends:[], following:['u_demo'], followers:['u_demo'], dojoCircle:[], comments:[], verifiedGym:false, rankLevel:3 },
  { id:'u_carlos', name:'Carlos Mendez', role:'instructor', rank:'Brown Belt', gym:'Tiger Muay Thai', location:'Austin, TX', bio:'Details win.', status:'Teaching takedowns', avatar:'https://i.pravatar.cc/200?img=15', banner:'', theme:'tatami', layout:{ left:['bio','belt','gym'], right:['posts','friends','stats'] }, playlist:'', posts:[{id:'p_car_1', title:'Arm drag entries', date:'Sep 02', type:'note'}], friends:[], following:['u_demo'], followers:['u_demo'], dojoCircle:[], comments:[], verifiedGym:true, rankLevel:5 },
  { id:'u_diana', name:'Diana Lee', role:'student', rank:'Blue Belt', gym:'Westside MMA', location:'Los Angeles, CA', bio:'Keep it playful.', status:'Flow rolls', avatar:'https://i.pravatar.cc/200?img=45', banner:'', theme:'tatami', layout:{ left:['bio','belt','gym'], right:['posts','friends','stats'] }, playlist:'', posts:[{id:'p_dia_1', title:'Butterfly sweep drills', date:'Sep 10', type:'note'}], friends:[], following:['u_demo'], followers:['u_demo'], dojoCircle:[], comments:[], verifiedGym:false, rankLevel:2 },
  { id:'u_elliot', name:'Elliot Shaw', role:'student', rank:'White Belt', gym:'Open Mat Club', location:'Denver, CO', bio:'Day 30.', status:'Sore but happy', avatar:'https://i.pravatar.cc/200?img=23', banner:'', theme:'iron', layout:{ left:['bio','belt','gym'], right:['posts','friends','stats'] }, playlist:'', posts:[{id:'p_ell_1', title:'Surviving side control', date:'Sep 05', type:'note'}], friends:[], following:['u_demo'], followers:[], dojoCircle:[], comments:[], verifiedGym:false, rankLevel:1 },
  { id:'u_fiona', name:'Fiona Zhang', role:'student', rank:'Brown Belt', gym:'Cobra MMA', location:'San Jose, CA', bio:'Edge to edge.', status:'Sparring night', avatar:'https://i.pravatar.cc/200?img=18', banner:'', theme:'neon', layout:{ left:['bio','belt','gym'], right:['posts','friends','stats'] }, playlist:'', posts:[{id:'p_fio_1', title:'Mount escapes', date:'Aug 12', type:'note'}], friends:[], following:['u_demo'], followers:['u_demo'], dojoCircle:[], comments:[], verifiedGym:false, rankLevel:4 },
  { id:'u_greg', name:'Greg Hall', role:'student', rank:'Purple Belt', gym:'Downtown Grappling', location:'Chicago, IL', bio:'Frames + timing.', status:'Studying entries', avatar:'https://i.pravatar.cc/200?img=52', banner:'', theme:'tatami', layout:{ left:['bio','belt','gym'], right:['posts','friends','stats'] }, playlist:'', posts:[{id:'p_greg_1', title:'Closed guard gameplan', date:'Jul 22', type:'note'}], friends:[], following:['u_demo'], followers:['u_demo'], dojoCircle:[], comments:[], verifiedGym:false, rankLevel:3 }
]

const db = loadJSON(dataPath)
if(!Array.isArray(db.users)) db.users = []
// Merge users by id; add if not present
const byId = new Map(db.users.map(u=>[u.id,u]))
demoUsers.forEach(u => { if(!byId.has(u.id)) db.users.push(u) })

if(fs.existsSync(dataPath)){
  const b = backup(dataPath)
  console.log('Backed up existing data.json to', b)
}
saveJSON(dataPath, db)
console.log('Seeded users. Total users:', db.users.length)
