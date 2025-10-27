import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, icons } from '../../lib/icons'
import { useStore } from '../../store'

interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'mention'
  userId: string // who triggered it
  postId?: string
  commentId?: string
  message: string
  createdAt: string
  read: boolean
}

export default function NotificationDropdown() {
  const { session, users, posts } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  useEffect(() => {
    if (!session.userId) return
    
    // Load notifications from localStorage
    const stored = localStorage.getItem(`notifications_${session.userId}`)
    if (stored) {
      try {
        setNotifications(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to load notifications:', e)
      }
    }
    
    // Listen for new notifications from bot activity
    const checkForNewNotifications = setInterval(() => {
      generateNotifications()
    }, 5000) // Check every 5 seconds
    
    return () => clearInterval(checkForNewNotifications)
  }, [session.userId])
  
  const generateNotifications = () => {
    if (!session.userId) return
    
    const myPosts = posts.filter(p => p.authorId === session.userId && p.visibility !== 'PRIVATE')
    const newNotifications: Notification[] = []
    
    myPosts.forEach(post => {
      // Check for new likes
      post.likedBy?.forEach(likerId => {
        if (likerId === session.userId) return // Don't notify about own likes
        
        const existingNotif = notifications.find(
          n => n.type === 'like' && n.userId === likerId && n.postId === post.id
        )
        
        if (!existingNotif) {
          const liker = users.find(u => u.id === likerId)
          if (liker) {
            newNotifications.push({
              id: `like_${likerId}_${post.id}_${Date.now()}`,
              type: 'like',
              userId: likerId,
              postId: post.id,
              message: `${liker.name} liked your post`,
              createdAt: new Date().toISOString(),
              read: false
            })
          }
        }
      })
      
      // Check for new comments
      post.comments?.forEach(comment => {
        if (comment.userId === session.userId) return // Don't notify about own comments
        
        const existingNotif = notifications.find(
          n => n.type === 'comment' && n.commentId === comment.id
        )
        
        if (!existingNotif) {
          const commenter = users.find(u => u.id === comment.userId)
          if (commenter) {
            newNotifications.push({
              id: `comment_${comment.id}`,
              type: 'comment',
              userId: comment.userId,
              postId: post.id,
              commentId: comment.id,
              message: `${commenter.name} commented: "${comment.text.substring(0, 30)}${comment.text.length > 30 ? '...' : ''}"`,
              createdAt: comment.createdAt,
              read: false
            })
          }
        }
      })
    })
    
    if (newNotifications.length > 0) {
      const updated = [...newNotifications, ...notifications].slice(0, 50) // Keep last 50
      setNotifications(updated)
      localStorage.setItem(`notifications_${session.userId}`, JSON.stringify(updated))
    }
  }
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    localStorage.setItem(`notifications_${session.userId}`, JSON.stringify(updated))
  }
  
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return icons.heart
      case 'comment':
        return icons.commentOutline
      case 'follow':
        return icons.users
      case 'mention':
        return icons.bell
      default:
        return icons.bell
    }
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
      >
        <Icon icon={icons.bell} size={20} className="text-[var(--color-text)]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-96 max-h-[500px] overflow-y-auto bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl shadow-lg z-20">
            {/* Header */}
            <div className="sticky top-0 bg-[var(--color-bg)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-[var(--color-text)]">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-[var(--color-primary)] hover:opacity-80 transition-opacity"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>
            
            {/* Notification List */}
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-text-muted)]">
                <Icon icon={icons.bell} size={32} className="mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <>
                <div>
                  {notifications.slice(0, 5).map(notif => {
                    const user = users.find(u => u.id === notif.userId)
                    if (!user) return null
                    
                    return (
                      <Link
                        key={notif.id}
                        to={notif.postId ? `/dashboard` : `/u/${user.id}`}
                        onClick={() => setIsOpen(false)}
                        className={`flex gap-3 p-4 hover:bg-[var(--color-surface)] transition-colors border-b border-[var(--color-border)] ${
                          !notif.read ? 'bg-[var(--color-primary)]/5' : ''
                        }`}
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--color-border)]"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[var(--color-text)]">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Icon
                              icon={getNotificationIcon(notif.type)}
                              size={12}
                              className="text-[var(--color-text-muted)]"
                            />
                            <span className="text-xs text-[var(--color-text-muted)]">
                              {formatTime(notif.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        {!notif.read && (
                          <div className="w-2 h-2 rounded-full bg-[var(--color-primary)] mt-2" />
                        )}
                      </Link>
                    )
                  })}
                </div>

                {/* View All Button */}
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="block p-3 text-center text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors border-t border-[var(--color-border)]"
                >
                  View all notifications
                </Link>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
