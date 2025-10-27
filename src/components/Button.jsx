import React from 'react'
import classNames from 'classnames'

export default function Button({ variant='primary', loading=false, className='', children, ...props }){
  const base = 'inline-flex items-center justify-center h-10 px-4 rounded-md text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-transform duration-150 active:scale-[0.98]'
  const variants = {
    primary: 'bg-[var(--accent-primary)] text-white hover:opacity-95',
    outline: 'border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-elevated)]',
    ghost: 'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-elevated)]',
    'accent-outline': 'border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[rgba(183,28,28,0.10)]'
  }
  return (
    <button className={classNames(base, variants[variant]||variants.primary, className)} disabled={loading || props.disabled} {...props}>
      {loading ? 'Loading…' : children}
    </button>
  )
}
