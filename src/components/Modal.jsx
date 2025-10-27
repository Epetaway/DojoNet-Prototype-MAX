import React, { useEffect, useRef } from 'react'
import { Button } from './index'

export default function Modal({ open, title, children, onClose }){
  const ref = useRef(null)
  useEffect(() => {
    if(open) ref.current?.focus()
  }, [open])
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="card p-4 w-[min(92vw,560px)]" tabIndex={-1} ref={ref}>
          <div className="flex items-center justify-between mb-3">
            <h2 id="modal-title" className="text-lg font-heading uppercase">{title}</h2>
            <Button variant="ghost" onClick={onClose} aria-label="Close" className="px-2 h-8">✕</Button>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </div>
  )
}
