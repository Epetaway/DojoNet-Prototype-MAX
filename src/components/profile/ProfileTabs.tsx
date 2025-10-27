// ProfileTabs: Toggle views for Posts, Journals, Media, Friends
import React from 'react'

type Tab = 'Posts' | 'Journals' | 'Media' | 'Friends'

interface Props {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const tabs: Tab[] = ['Posts', 'Journals', 'Media', 'Friends']

export function ProfileTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex justify-around border-b border-zinc-800 text-zinc-400 text-sm">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`
            py-3 px-4 border-b-2 transition font-medium
            ${
              activeTab === tab
                ? 'border-brand text-zinc-100'
                : 'border-transparent hover:text-zinc-100 hover:border-zinc-700'
            }
          `}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
