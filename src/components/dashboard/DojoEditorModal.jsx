import React, { useEffect, useState } from 'react'
import Modal from '../../components/Modal.jsx'
import { useStore } from '../../app/store'
import { Button } from '../index'
import { ChevronUp, ChevronDown, Plus } from 'lucide-react'

const THEMES = ['tatami','iron','neon','sunset']
const LEFT_TILES = ['bio','belt','gym','badges']
const RIGHT_TILES = ['posts','friends','stats','wall','playlist']

export default function DojoEditorModal({ open, onClose }){
  const { session, users, updateUser } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const [theme, setTheme] = useState(me?.theme||'tatami')
  const [left, setLeft] = useState(me?.layout?.left || LEFT_TILES)
  const [right, setRight] = useState(me?.layout?.right || RIGHT_TILES)

  useEffect(()=>{ if(open && me){ setTheme(me.theme||'tatami'); setLeft(me.layout?.left||LEFT_TILES); setRight(me.layout?.right||RIGHT_TILES) } }, [open, me?.id])

  function move(list, setList, idx, dir){
    const j = idx + dir; if(j<0 || j>=list.length) return
    const next = list.slice(); const t = next[idx]; next[idx] = next[j]; next[j] = t; setList(next)
  }
  function toggle(list, setList, key){ setList(list.includes(key) ? list.filter(x=>x!==key) : [...list, key]) }

  function save(){ if(me){ updateUser(me.id, { theme, layout:{ left, right } }); onClose?.(true) } else { onClose?.(false) } }

  return (
    <Modal open={open} onClose={()=>onClose?.(false)} title="Edit Dojo Page">
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-1">Theme</div>
          <div className="flex gap-2 flex-wrap">
            {THEMES.map(t => (
              <Button key={t} variant={theme===t ? 'primary' : 'outline'} className={`h-9 px-3 ${theme===t?'':'text-[var(--color-text)]'}`} onClick={()=>setTheme(t)}>{t}</Button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium mb-1">Left column tiles</div>
            <ul className="space-y-1">
              {left.map((k,i)=>(
                <li key={k} className="flex items-center gap-2">
                  <span className="text-sm flex-1 capitalize">{k}</span>
                  <Button variant="outline" className="px-2 h-8" aria-label={`Move ${k} up`} onClick={()=>move(left,setLeft,i,-1)}>
                    <ChevronUp size={14} />
                  </Button>
                  <Button variant="outline" className="px-2 h-8" aria-label={`Move ${k} down`} onClick={()=>move(left,setLeft,i,1)}>
                    <ChevronDown size={14} />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2 flex-wrap">
              {LEFT_TILES.filter(k=>!left.includes(k)).map(k => (
                <Button key={k} variant="outline" className="px-2 h-8 flex items-center gap-1" onClick={()=>toggle(left,setLeft,k)}>
                  <Plus size={14}/> Add {k}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Right column tiles</div>
            <ul className="space-y-1">
              {right.map((k,i)=>(
                <li key={k} className="flex items-center gap-2">
                  <span className="text-sm flex-1 capitalize">{k}</span>
                  <Button variant="outline" className="px-2 h-8" aria-label={`Move ${k} up`} onClick={()=>move(right,setRight,i,-1)}>
                    <ChevronUp size={14} />
                  </Button>
                  <Button variant="outline" className="px-2 h-8" aria-label={`Move ${k} down`} onClick={()=>move(right,setRight,i,1)}>
                    <ChevronDown size={14} />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2 flex-wrap">
              {RIGHT_TILES.filter(k=>!right.includes(k)).map(k => (
                <Button key={k} variant="outline" className="px-2 h-8 flex items-center gap-1" onClick={()=>toggle(right,setRight,k)}>
                  <Plus size={14}/> Add {k}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" className="h-10" onClick={()=>onClose?.(false)}>Cancel</Button>
          <Button className="h-10" onClick={save}>Save</Button>
        </div>
      </div>
    </Modal>
  )
}
