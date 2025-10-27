export default function ProgressBar({ value = 0, max = 100, className = '' }){
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`w-full h-2 rounded-full bg-[var(--color-elevated)] ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full" style={{ width: pct+'%', background: 'var(--accent-primary)' }} />
    </div>
  )
}
