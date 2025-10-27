import React, { useMemo } from 'react'
import { useStore } from '../../app/store'

export default function InstructorInsights(){
  const { users } = useStore()
  const items = useMemo(()=>{
    const pros = users.filter(u => u.rankLevel>=5 || u.verifiedGym)
    const posts = []
    pros.forEach(u => u.posts?.forEach(p => { if(p.type==='tutorial') posts.push({ author:u, post:p }) }))
    return posts.slice(0,3)
  }, [users])
  return (
    <div className="card p-4">
      <div className="text-sm font-medium">Instructor Insights</div>
      {!items.length ? (
        <div className="text-sm text-[var(--color-text-muted)] mt-2">No tips yet</div>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.map((it, idx) => (
            <li key={idx} className="text-sm">
              <span className="font-medium">{it.author.name}</span>: {it.post.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
