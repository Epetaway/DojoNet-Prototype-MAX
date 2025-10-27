import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { Button } from './index'

const ToastCtx = createContext({ show: (_msg, _type) => {} })

export function useToast(){ return useContext(ToastCtx) }

export default function ToastProvider({ children }){
  const [toasts, setToasts] = useState([])
  const show = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, message, type }])
    return id
  }, [])
  const remove = id => setToasts(t => t.filter(x => x.id !== id))

  useEffect(() => {
    if(!toasts.length) return
    const timers = toasts.map(t => setTimeout(() => remove(t.id), 3000))
    return () => timers.forEach(clearTimeout)
  }, [toasts])

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="fixed left-1/2 -translate-x-1/2 bottom-20 z-50 space-y-2 w-[min(92vw,480px)]">
        {toasts.map(t => (
          <div key={t.id} role="status" className="card p-3 flex items-center justify-between" style={{borderColor:'var(--color-border)'}}>
            <div className="text-sm">{t.message}</div>
            <Button variant="ghost" className="text-xs h-7 px-2 text-[var(--color-text-muted)]" onClick={() => remove(t.id)} aria-label="Dismiss">Dismiss</Button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
