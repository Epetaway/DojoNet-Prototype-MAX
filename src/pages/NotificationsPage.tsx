// NotificationsPage - Full notification center with filtering and preferences
import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Icon, icons } from '../lib/icons'
import { useStore } from '../store'

type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'reply' | 'tag'
type FilterTab = 'all' | 'unread' | NotificationType

interface Notification {
  id: string
  type: NotificationType
  userId: string
  postId?: string
  commentId?: string
  message: string
  createdAt: string
  read: boolean
}

interface NotificationPreferences {
  likes: boolean
  comments: boolean
  follows: boolean
  mentions: boolean
  replies: boolean
  tags: boolean
  sound: boolean
}

export default function NotificationsPage() {
  const { session, users, posts } = useStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<FilterTab>('all')
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    replies: true,
    tags: true,
    sound: false,
  })

  useEffect(() => {
    if (!session.userId) return

    // Load notifications
    const stored = localStorage.getItem(`notifications_${session.userId}`)
    if (stored) {
      try {
        setNotifications(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to load notifications:', e)
      }
    }

    // Load preferences
    const prefs = localStorage.getItem(`notification_prefs_${session.userId}`)
    if (prefs) {
      try {
        setPreferences(JSON.parse(prefs))
      } catch (e) {
        console.error('Failed to load preferences:', e)
      }
    }

    // Generate notifications
    generateNotifications()
  }, [session.userId])

  const generateNotifications = () => {
    if (!session.userId) return

    const myPosts = posts.filter(p => p.authorId === session.userId && p.visibility !== 'PRIVATE')
    const newNotifications: Notification[] = []

    myPosts.forEach(post => {
      // Likes
      if (preferences.likes) {
        post.likedBy?.forEach(likerId => {
          if (likerId === session.userId) return

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
                read: false,
              })
            }
          }
        })
      }

      // Comments
      if (preferences.comments) {
        post.comments?.forEach(comment => {
          if (comment.userId === session.userId) return

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
                message: `${commenter.name} commented: "${comment.text.substring(0, 30)}${
                  comment.text.length > 30 ? '...' : ''
                }"`,
                createdAt: comment.createdAt,
                read: false,
              })
            }
          }

          // Replies
          if (preferences.replies) {
            comment.replies?.forEach(reply => {
              if (reply.userId === session.userId) return

              const existingReplyNotif = notifications.find(
                n => n.type === 'reply' && n.commentId === reply.id
              )

              if (!existingReplyNotif) {
                const replier = users.find(u => u.id === reply.userId)
                if (replier) {
                  newNotifications.push({
                    id: `reply_${reply.id}`,
                    type: 'reply',
                    userId: reply.userId,
                    postId: post.id,
                    commentId: reply.id,
                    message: `${replier.name} replied to your comment: "${reply.text.substring(0, 30)}${
                      reply.text.length > 30 ? '...' : ''
                    }"`,
                    createdAt: reply.createdAt,
                    read: false,
                  })
                }
              }
            })
          }
        })
      }
    })

    if (newNotifications.length > 0) {
      const updated = [...newNotifications, ...notifications].slice(0, 100)
      setNotifications(updated)
      localStorage.setItem(`notifications_${session.userId}`, JSON.stringify(updated))
    }
  }

  const filteredNotifications = useMemo(() => {
    let filtered = notifications

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read)
    } else if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter)
    }

    return filtered
  }, [notifications, filter])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    setNotifications(updated)
    localStorage.setItem(`notifications_${session.userId}`, JSON.stringify(updated))
  }

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    setNotifications(updated)
    localStorage.setItem(`notifications_${session.userId}`, JSON.stringify(updated))
  }

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id)
    setNotifications(updated)
    localStorage.setItem(`notifications_${session.userId}`, JSON.stringify(updated))
  }

  const clearAll = () => {
    if (confirm('Clear all notifications? This cannot be undone.')) {
      setNotifications([])
      localStorage.removeItem(`notifications_${session.userId}`)
    }
  }

  const savePreferences = () => {
    localStorage.setItem(`notification_prefs_${session.userId}`, JSON.stringify(preferences))
    setShowPreferences(false)
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'like':
        return { icon: icons.heart, color: 'text-red-500', bg: 'bg-red-500/10' }
      case 'comment':
        return { icon: icons.comment, color: '[color:var(--accent-teal)]', bg: 'bg-[var(--accent-teal)]/10' }
      case 'reply':
        return { icon: icons.comment, color: 'text-green-500', bg: 'bg-green-500/10' }
      case 'follow':
        return { icon: icons.users, color: 'text-purple-500', bg: 'bg-purple-500/10' }
      case 'mention':
        return { icon: icons.bell, color: '[color:var(--accent-amber)]', bg: 'bg-[var(--accent-amber)]/10' }
      case 'tag':
        return { icon: icons.bookmark, color: 'text-pink-500', bg: 'bg-pink-500/10' }
      default:
        return { icon: icons.bell, color: 'text-[var(--color-text-muted)]', bg: 'bg-[var(--color-surface)]' }
    }
  }

  const tabs: { id: FilterTab; label: string; icon?: any }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'like', label: 'Likes', icon: icons.heart },
    { id: 'comment', label: 'Comments', icon: icons.comment },
    { id: 'reply', label: 'Replies', icon: icons.comment },
    { id: 'follow', label: 'Follows', icon: icons.users },
  ]

  const getTabCount = (tab: FilterTab) => {
    if (tab === 'all') return notifications.length
    if (tab === 'unread') return unreadCount
    return notifications.filter(n => n.type === tab).length
  }

  if (!session.userId) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-[var(--color-text-muted)]">Please log in to view notifications</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text)] flex items-center gap-3">
              <Icon icon={icons.bell} size={32} />
              Notifications
              {unreadCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-red-500 text-white text-sm font-medium">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-[var(--color-text-muted)] mt-1">
              Stay updated on your activity
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="px-4 py-2 rounded-xl bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-border)] transition-all font-medium flex items-center gap-2"
            >
              <Icon icon={icons.settings} size={18} />
              <span className="hidden md:inline">Settings</span>
            </button>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="px-4 py-2 rounded-xl bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-all font-medium flex items-center gap-2"
              >
                <Icon icon={icons.trash} size={18} />
                <span className="hidden md:inline">Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* Preferences Panel */}
        {showPreferences && (
          <div className="mb-6 p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <Icon icon={icons.settings} size={20} />
              Notification Preferences
            </h3>

            <div className="space-y-3 mb-4">
              {Object.entries(preferences).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg)] hover:bg-[var(--color-border)] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      icon={
                        key === 'likes'
                          ? icons.heart
                          : key === 'comments'
                          ? icons.comment
                          : key === 'follows'
                          ? icons.users
                          : key === 'sound'
                          ? icons.volumeHigh
                          : icons.bell
                      }
                      size={18}
                      className="text-[var(--color-text-muted)]"
                    />
                    <div>
                      <div className="font-medium text-[var(--color-text)] capitalize">
                        {key === 'sound' ? 'Sound Alerts' : key}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {key === 'sound'
                          ? 'Play sound for new notifications'
                          : `Get notified when someone ${key} your content`}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) =>
                        setPreferences(prev => ({ ...prev, [key]: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[var(--color-border)] rounded-full peer peer-checked:bg-[var(--color-primary)] transition-colors relative">
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 bg-[var(--color-surface)] rounded-full transition-transform ${
                          value ? 'translate-x-5' : ''
                        }`}
                      />
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 rounded-xl bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={savePreferences}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:opacity-90 transition-all font-medium"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const count = getTabCount(tab.id)
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  filter === tab.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
                }`}
              >
                {tab.icon && <Icon icon={tab.icon} size={16} />}
                {tab.label}
                {count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      filter === tab.id
                        ? 'bg-[var(--color-surface)]/20 text-[var(--color-surface)]'
                        : 'bg-[var(--color-bg)] text-[var(--color-text-muted)]'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Actions Bar */}
        {filteredNotifications.length > 0 && (
          <div className="mb-4 flex items-center justify-between px-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              {filteredNotifications.length} {filteredNotifications.length === 1 ? 'notification' : 'notifications'}
            </p>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-sm text-[var(--color-primary)] hover:underline font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
        )}

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <Icon
              icon={icons.bell}
              size={64}
              className="mx-auto text-[var(--color-text-muted)] opacity-20 mb-4"
            />
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
              No notifications
            </h3>
            <p className="text-[var(--color-text-muted)]">
              {filter === 'all'
                ? "When you get notifications, they'll show up here"
                : `No ${filter} notifications to show`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map(notif => {
              const user = users.find(u => u.id === notif.userId)
              if (!user) return null

              const { icon, color, bg } = getNotificationIcon(notif.type)

              return (
                <div
                  key={notif.id}
                  className={`group flex gap-4 p-4 rounded-2xl border transition-all ${
                    notif.read
                      ? 'bg-[var(--color-surface)] border-[var(--color-border)]'
                      : 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]/20'
                  } hover:border-[var(--color-primary)] hover:shadow-lg`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full ${bg} flex items-center justify-center`}>
                    <Icon icon={icon} size={20} className={color} />
                  </div>

                  {/* Avatar */}
                  <Link to={`/u/${user.id}`} className="flex-shrink-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-[var(--color-border)] hover:ring-[var(--color-primary)] transition-all"
                    />
                  </Link>

                  {/* Content */}
                  <Link
                    to={notif.postId ? `/dashboard` : `/u/${user.id}`}
                    className="flex-1 min-w-0"
                    onClick={() => markAsRead(notif.id)}
                  >
                    <p className="text-[var(--color-text)] mb-1">{notif.message}</p>
                    <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                      <span>{formatTime(notif.createdAt)}</span>
                      <span>•</span>
                      <span className="capitalize">{notif.type}</span>
                    </div>
                  </Link>

                  {/* Actions */}
                  <div className="flex items-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notif.read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
                        title="Mark as read"
                      >
                        <Icon icon={icons.check} size={16} className="text-[var(--color-text-muted)]" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <Icon icon={icons.trash} size={16} className="text-[var(--color-text-muted)] hover:text-red-500" />
                    </button>
                  </div>

                  {/* Unread Indicator */}
                  {!notif.read && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--color-primary)] mt-2" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
