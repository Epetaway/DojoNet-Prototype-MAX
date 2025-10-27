export default function Stepper({ step = 1, total = 4 }){
  return (
    <div className="flex items-center gap-2 mb-6" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`flex-1 h-1 rounded ${i < step ? 'bg-[var(--accent-primary)]' : 'bg-[var(--color-elevated)]'}`} />
      ))}
    </div>
  )
}
