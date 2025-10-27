import React from 'react'
import { Icon, icons } from '../../lib/icons'

interface WidgetTabBarProps {
  activeWidget: string | null
  onSelectWidget: (widget: string | null) => void
}

const widgets = [
  { id: 'milestones', icon: icons.fire, label: 'Progress', color: 'text-orange-500' },
  { id: 'events', icon: icons.calendar, label: 'Events', color: 'text-blue-500' },
  { id: 'connections', icon: icons.users, label: 'Connections', color: 'text-purple-500' },
  { id: 'partners', icon: icons.sparkles, label: 'Partners', color: 'text-pink-500' },
  { id: 'drafts', icon: icons.file, label: 'Drafts', color: 'text-yellow-500' },
  { id: 'journals', icon: icons.book, label: 'Journals', color: 'text-green-500' },
  { id: 'actions', icon: icons.bolt, label: 'Quick', color: 'text-red-500' },
]

export default function WidgetTabBar({ activeWidget, onSelectWidget }: WidgetTabBarProps) {
  return (
    <div className="hidden lg:block sticky top-20 z-10 bg-[var(--color-bg)] border-b border-[var(--color-border)] -mx-6 px-6 py-3 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {widgets.map((widget) => (
          <button
            key={widget.id}
            onClick={() => onSelectWidget(activeWidget === widget.id ? null : widget.id)}
            className={`
              flex flex-col items-center gap-1 min-w-[60px] px-3 py-2 rounded-lg transition-all
              ${
                activeWidget === widget.id
                  ? 'bg-[var(--color-primary)] text-white scale-105'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]'
              }
            `}
          >
            <Icon
              icon={widget.icon}
              size={20}
              className={activeWidget === widget.id ? '' : widget.color}
            />
            <span className="text-[10px] font-medium whitespace-nowrap">
              {widget.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
