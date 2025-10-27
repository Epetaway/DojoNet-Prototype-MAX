// DojoCircleEditor: Drag-and-drop editor for Top 8 friends
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, icons } from '../../lib/icons'

interface Friend {
  id: string
  name: string
  avatar: string
  rank?: string
  primaryArt?: string
}

interface Props {
  friends: Friend[]
  allFriends: Friend[]
  onSave: (friends: Friend[]) => void
  onCancel: () => void
}

export function DojoCircleEditor({ friends, allFriends, onSave, onCancel }: Props) {
  const [topEight, setTopEight] = useState<Friend[]>(friends.slice(0, 8))
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)

  // Fill empty slots
  const slots = [...topEight]
  while (slots.length < 8) {
    slots.push({ 
      id: `empty-${slots.length}`, 
      name: '', 
      avatar: '', 
    })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newSlots = [...slots]
    const draggedItem = newSlots[draggedIndex]
    newSlots.splice(draggedIndex, 1)
    newSlots.splice(index, 0, draggedItem)
    
    setTopEight(newSlots.filter(f => f.avatar))
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleAddFriend = (friend: Friend, slotIndex: number) => {
    const newSlots = [...slots]
    newSlots[slotIndex] = friend
    setTopEight(newSlots.filter(f => f.avatar))
    setShowPicker(false)
    setSelectedSlot(null)
  }

  const handleRemoveFriend = (index: number) => {
    const newSlots = slots.filter((_, i) => i !== index)
    setTopEight(newSlots.filter(f => f.avatar))
  }

  const handleSave = () => {
    onSave(topEight)
  }

  // Filter out friends already in top 8
  const availableFriends = allFriends.filter(
    f => !topEight.find(t => t.id === f.id)
  )

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">
          Edit Dojo Circle
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="text-xs px-3 py-1.5 rounded-lg bg-brand text-white hover:bg-rose-600 transition font-semibold"
          >
            Save
          </button>
        </div>
      </div>

      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Drag to reorder • Click + to add friends • Click × to remove
      </p>
      
      <div className="grid grid-cols-4 gap-3">
        {slots.map((friend, index) => {
          const isEmpty = !friend.avatar
          
          if (isEmpty) {
            return (
              <div
                key={`slot-${index}`}
                className="group relative"
              >
                <button
                  onClick={() => {
                    setSelectedSlot(index)
                    setShowPicker(true)
                  }}
                  className="w-full aspect-square rounded-xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--accent-primary)] hover:bg-[var(--color-surface-hover)] flex items-center justify-center transition"
                >
                  <Icon icon={icons.plus} className="h-8 w-8 text-[var(--color-text-muted)]" />
                </button>
                <div className="mt-1.5 text-center">
                  <div className="text-[10px] text-[var(--color-text-muted)]">
                    Add Friend
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div
              key={friend.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative cursor-move ${
                draggedIndex === index ? 'opacity-50' : ''
              }`}
            >
              {/* Position Badge */}
              <div className="absolute -top-1.5 -left-1.5 z-10 h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shadow-lg">
                {index + 1}
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemoveFriend(index)}
                className="absolute -top-1.5 -right-1.5 z-10 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition opacity-0 group-hover:opacity-100"
              >
                <Icon icon={icons.close} className="h-3 w-3" />
              </button>
              
              {/* Avatar */}
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-full aspect-square object-cover rounded-xl shadow-sm ring-2 ring-[var(--color-border)] group-hover:ring-[var(--accent-primary)] transition"
              />
              
              {/* Info */}
              <div className="mt-1.5">
                <div className="text-xs font-medium truncate text-[var(--color-text)]">
                  {friend.name}
                </div>
                <div className="text-[10px] text-[var(--color-text-muted)] truncate">
                  {friend.rank && friend.primaryArt 
                    ? `${friend.rank} • ${friend.primaryArt}`
                    : friend.rank || friend.primaryArt || '\u00A0'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Friend Picker Modal */}
      {showPicker && selectedSlot !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-text)]">
                Add Friend to Dojo Circle
              </h3>
              <button
                onClick={() => {
                  setShowPicker(false)
                  setSelectedSlot(null)
                }}
                className="p-2 rounded-lg hover:bg-[var(--color-surface)] transition"
              >
                <Icon icon={icons.close} className="h-5 w-5 text-[var(--color-text-muted)]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {availableFriends.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-text-muted)]">
                  <Icon icon={icons.users} className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No more friends to add</p>
                  <p className="text-xs mt-1">All your friends are in your Dojo Circle!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableFriends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => handleAddFriend(friend, selectedSlot)}
                      className="group p-3 rounded-xl bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border)] hover:border-[var(--accent-primary)] transition text-left"
                    >
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-full aspect-square object-cover rounded-lg mb-2 ring-2 ring-[var(--color-border)] group-hover:ring-[var(--accent-primary)] transition"
                      />
                      <div className="text-sm font-medium truncate text-[var(--color-text)]">
                        {friend.name}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)] truncate">
                        {friend.rank || friend.primaryArt || 'Martial Artist'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
