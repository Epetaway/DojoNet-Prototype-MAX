export default function InterestChip({ icon, label, active, onClick }){
  return (
    <button type="button" onClick={onClick} className={`chip ${active ? 'chip--active' : ''} inline-flex items-center rounded-full px-3 py-1 text-sm bg-[var(--color-elevated)] hover:opacity-90 ${active ? 'bg-[var(--accent-primary)] text-white' : ''}`}>
      <span className="mr-1" aria-hidden>{icon}</span>
      {label}
    </button>
  )
}
