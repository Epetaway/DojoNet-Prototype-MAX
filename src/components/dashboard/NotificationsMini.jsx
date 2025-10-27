import React from 'react'

export default function NotificationsMini(){
  const items = [
    { id:'n1', text:'Your request has been sent to your professor.', ts: '2m' },
    { id:'n2', text:'Jason liked your post.', ts: '10m' },
    { id:'n3', text:'It\'s a match! You and Chris can train together.', ts: '1h' },
  ]
  return (
    <div className="card rounded-xl overflow-hidden">
      {items.map(n => (
        <div key={n.id} className="px-4 py-3 text-sm text-[var(--color-text)]/90 flex items-center">
          <span className="flex-1 pr-3">{n.text}</span>
          <span className="text-xs text-[var(--color-text-muted)]">{n.ts}</span>
        </div>
      ))}
      {items.length===0 && (
        <div className="px-4 py-6 text-sm text-[var(--color-text-muted)] text-center">No notifications</div>
      )}
    </div>
  )
}
