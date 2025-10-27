import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '../../lib/icons'

export function NavItem({ to, icon, label, badge }) {
  const location = useLocation()
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`)
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition group relative ${
        isActive 
          ? 'bg-brand/10 text-brand ring-1 ring-brand/20' 
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
      }`}
    >
      <Icon icon={icon} className={`h-5 w-5 ${isActive ? 'text-brand' : 'group-hover:scale-110 transition'}`} />
      <span className="font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-brand text-white font-semibold">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}

export default NavItem
