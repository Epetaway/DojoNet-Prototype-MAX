import React from 'react'
import { useToast } from './ToastProvider'
import { Icon, icons } from '../lib/icons'

export default function FAB(){
  const { show } = useToast()
  return (
    <button
      className="fixed bottom-24 right-5 md:right-8 rounded-full shadow-lg text-white inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
      style={{ background:'var(--accent-primary)', width:56, height:56 }}
      aria-label="Create"
      onClick={() => show('Quick action menu coming soon')}
    >
      <Icon icon={icons.plus} className="h-6 w-6" aria-hidden />
    </button>
  )
}
