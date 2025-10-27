import React from 'react'
import Modal from './Modal.jsx'
import { Link } from 'react-router-dom'
import { Button } from '.'

export default function AuthGateModal({ open, onClose, intent }){
  return (
    <Modal open={open} onClose={onClose} title="Create a free account to reserve your spot">
      <div className="space-y-4">
        {intent?.copy && <p className="text-sm text-[var(--color-text-muted)]">{intent.copy}</p>}
        <div className="space-y-3">
          <Link to={`/signup${intent?.to ? `?intent=${encodeURIComponent(intent.to)}`:''}`}><Button className="w-full h-11">Join Free</Button></Link>
          <div className="text-center text-sm text-[var(--color-text-muted)]">Already have an account?</div>
          <Link to={`/login${intent?.to ? `?intent=${encodeURIComponent(intent.to)}`:''}`}><Button variant="outline" className="w-full h-11">Login</Button></Link>
        </div>
      </div>
    </Modal>
  )
}
