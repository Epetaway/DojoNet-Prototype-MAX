// FriendPickerModal: Select friends for post visibility
import React, { useState } from 'react'
import { Icon, icons } from '../../lib/icons'

interface Friend {
  id: string
  name: string
  avatar: string
  rank?: string
  gym?: string
}

interface Props {
  friends: Friend[]
  selectedFriends: string[]
  onSelect: (friendIds: string[]) => void
  onClose: () => void
}

export function FriendPickerModal({ friends, selectedFriends, onSelect, onClose }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedFriends))
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.gym?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleFriend = (friendId: string) => {
    const newSelected = new Set(selected)
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId)
    } else {
      newSelected.add(friendId)
    }
    setSelected(newSelected)
  }

  const toggleAll = () => {
    if (selected.size === filteredFriends.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredFriends.map(f => f.id)))
    }
  }

  const handleConfirm = () => {
    onSelect(Array.from(selected))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="card max-w-2xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)]">
              Select Friends
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              {selected.size} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition"
          >
            <Icon icon={icons.close} className="h-5 w-5 text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Search & Select All */}
        <div className="p-4 border-b border-[var(--color-border)] space-y-3">
          <div className="relative">
            <Icon 
              icon={icons.search} 
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" 
            />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition"
            />
          </div>

          <button
            onClick={toggleAll}
            className="text-sm text-[var(--accent-primary)] hover:underline"
          >
            {selected.size === filteredFriends.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-muted)]">
              <Icon icon={icons.users} className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{searchQuery ? 'No friends found' : 'No friends yet'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredFriends.map((friend) => {
                const isSelected = selected.has(friend.id)
                
                return (
                  <button
                    key={friend.id}
                    onClick={() => toggleFriend(friend.id)}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
                      ${
                        isSelected
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                          : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)] bg-[var(--color-surface)]'
                      }
                    `}
                  >
                    {/* Checkbox */}
                    <div className={`
                      h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition
                      ${
                        isSelected
                          ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]'
                          : 'border-[var(--color-border)]'
                      }
                    `}>
                      {isSelected && (
                        <Icon icon={icons.check} className="h-3 w-3 text-white" />
                      )}
                    </div>

                    {/* Avatar */}
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-[var(--color-border)]"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate text-[var(--color-text)]">
                        {friend.name}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)] truncate">
                        {friend.rank && friend.gym
                          ? `${friend.rank} • ${friend.gym}`
                          : friend.rank || friend.gym || 'Martial Artist'}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface)] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-brand text-white hover:bg-rose-600 font-semibold transition"
          >
            Confirm ({selected.size})
          </button>
        </div>
      </div>
    </div>
  )
}
