export default function Notifications(){
  // Placeholder notifications list per guidelines
  const demo = [
    { id:'n1', text:'Your request has been sent to your professor.', type:'info', ts: new Date().toLocaleString() },
    { id:'n2', text:'Jason liked your post.', type:'like', ts: new Date().toLocaleString() },
  ]
  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="card p-4 mb-4">
        <h1 className="text-xl font-heading uppercase">Notifications</h1>
      </div>
      <ul className="space-y-3">
        {demo.map(n => (
          <li key={n.id} className="card p-4 flex items-center justify-between">
            <div className="text-sm">{n.text}</div>
            <div className="text-xs text-[var(--color-text-muted)]">{n.ts}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
