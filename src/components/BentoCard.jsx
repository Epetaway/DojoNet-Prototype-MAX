// BentoCard: Base card component with uniform height and no internal scroll
import React from 'react'

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function BentoCard({ 
  title, 
  Icon, 
  children, 
  flexibleHeight = false,
  className = ''
}) {
  return (
    <article className={cn(
      "card",
      "rounded-xl",
      "overflow-hidden",
      "hover-elevate",
      "transition-shadow duration-200",
      "max-w-md mx-auto w-full",
      flexibleHeight ? 'h-auto min-h-[18rem]' : 'h-full max-h-[22rem] min-h-[18rem]',
      className
    )}>
      <div className="p-4 md:p-5 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          {Icon && <Icon className="w-4 h-4 text-[var(--color-text-muted)]" />}
          <h2 className="text-sm font-medium text-[var(--color-text)]">{title}</h2>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </article>
  )
}
