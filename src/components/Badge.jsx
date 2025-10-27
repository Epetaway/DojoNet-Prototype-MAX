export default function Badge({ children, color = 'var(--accent-primary)', className = '', variant }){
  // Back-compat: if variant not provided, use color prop styling.
  if(!variant){
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] ${className}`} style={{ backgroundColor: color+'1a', color }}>
        {children}
      </span>
    )
  }
  const styles = {
    pending: 'bg-gray-100 text-gray-700',
    verified: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }
  const cls = styles[variant] || styles.pending
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls} ${className}`}>
      {children}
    </span>
  )
}
