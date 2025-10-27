// MilestonesWidget: Show training streaks, hours, and achievements
import React from 'react'
import { Icon, icons } from '../../lib/icons'
import { useStore } from '../../store'

export default function MilestonesWidget() {
  const { session, users } = useStore()
  const me = users.find((u) => u.id === session.userId)
  
  if (!me) return null

  // Mock data - TODO: calculate from real journal entries
  const milestones = [
    {
      icon: icons.fire,
      label: 'Training Streak',
      value: '7 days',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-500'
    },
    {
      icon: icons.clock,
      label: 'Hours This Month',
      value: '24 hrs',
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-500'
    },
    {
      icon: icons.chart,
      label: 'Sessions',
      value: '18 total',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-500'
    },
    {
      icon: icons.medal,
      label: 'Last Belt Change',
      value: me.rank || 'White Belt',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-500'
    }
  ]

  return (
    <div className="card rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[var(--color-text)]">Your Progress</h3>
        <Icon icon={icons.trophy} className="h-4 w-4 text-[var(--color-text-muted)]" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {milestones.map((milestone, idx) => (
          <div 
            key={idx}
            className={`p-3 rounded-xl ${milestone.bgColor} border border-[var(--color-border)]`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${milestone.color} flex items-center justify-center`}>
                <Icon icon={milestone.icon} className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className={`text-lg font-bold ${milestone.textColor}`}>
              {milestone.value}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {milestone.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20">
        <div className="flex items-center gap-2 mb-1">
          <Icon icon={icons.target} className="h-4 w-4 text-blue-500" />
          <p className="text-xs font-semibold text-[var(--color-text)]">Next Goal</p>
        </div>
        <p className="text-sm text-[var(--color-text-muted)]">
          Train 3 more days this week to maintain your streak
        </p>
      </div>
    </div>
  )
}
