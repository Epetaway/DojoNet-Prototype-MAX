// Messages: DM system with thread list and chat panel
import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '../store'
import { Icon, icons } from '../lib/icons'
import { Link } from 'react-router-dom'

export default function Messages() {
  const { 
    session, 
    users, 
    getUserConversations, 
    getConversationMessages, 
    sendMessage, 
    markMessagesAsRead,
    getUnreadCount,
    getOrCreateConversation,
    deleteConversation
  } = useStore()
  const me = users.find((u) => u.id === session.userId)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedConversationId, getConversationMessages(selectedConversationId || '')])

  // Mark messages as read when opening conversation
  useEffect(() => {
    if (selectedConversationId && me) {
      markMessagesAsRead(selectedConversationId, me.id)
    }
  }, [selectedConversationId, me])

  if (!me) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-[var(--color-text-muted)]">
          <Link to="/login" className="text-[var(--accent-primary)] hover:underline">
            Login
          </Link>{' '}
          to view messages
        </div>
      </div>
    )
  }

  // Get conversations from store
  const conversations = getUserConversations(me.id)
  
  // Filter conversations by search
  const filteredConversations = conversations.filter(conv => {
    const otherUserId = conv.participants.find(id => id !== me.id)
    const otherUser = users.find(u => u.id === otherUserId)
    return otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)
  const messages = selectedConversationId ? getConversationMessages(selectedConversationId) : []
  
  const recipientId = selectedConversation?.participants.find(id => id !== me.id)
  const recipient = recipientId ? users.find(u => u.id === recipientId) : null

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversationId) return
    sendMessage(selectedConversationId, messageText)
    setMessageText('')
  }

  const handleStartNewChat = (userId: string) => {
    const conversationId = getOrCreateConversation(me.id, userId)
    setSelectedConversationId(conversationId)
    setShowNewChat(false)
    setSearchQuery('')
  }

  const handleDeleteConversation = (conversationId: string) => {
    if (confirm('Delete this conversation? This cannot be undone.')) {
      deleteConversation(conversationId)
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null)
      }
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-20">
      <div className="max-w-7xl mx-auto h-[calc(100vh-5rem)] flex flex-col md:flex-row">
        {/* Thread List (Left) */}
        <aside className={`w-full md:w-80 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col ${
          selectedConversationId ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-4 border-b border-[var(--color-border)] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                <Icon icon={icons.message} className="h-5 w-5" />
                Messages
              </h2>
              <button
                onClick={() => setShowNewChat(!showNewChat)}
                className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
                title="New conversation"
              >
                <Icon icon={icons.plus} size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Icon
                icon={icons.search}
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* New Chat Panel */}
          {showNewChat && (
            <div className="border-b border-[var(--color-border)] bg-[var(--color-bg)] p-4">
              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Start a new conversation</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {users
                  .filter(u => u.id !== me.id)
                  .map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleStartNewChat(user.id)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-[var(--color-text)] text-sm">{user.name}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{user.rank}</p>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-[var(--color-text-muted)]">
                <Icon icon={icons.message} size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchQuery ? 'No conversations found' : 'No messages yet'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="mt-3 text-sm text-[var(--color-primary)] hover:underline"
                  >
                    Start a conversation
                  </button>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherUserId = conv.participants.find(id => id !== me.id)
                const otherUser = users.find(u => u.id === otherUserId)
                if (!otherUser) return null

                const unreadCount = getUnreadCount(conv.id, me.id)

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-[var(--color-bg)] transition ${
                      selectedConversationId === conv.id ? 'bg-[var(--color-bg)]' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={otherUser.avatar}
                        alt={otherUser.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-[var(--color-text)] truncate">
                          {otherUser.name}
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {formatTime(conv.updatedAt)}
                        </p>
                      </div>
                      <p className={`text-sm truncate ${
                        unreadCount > 0 
                          ? 'text-[var(--color-text)] font-medium' 
                          : 'text-[var(--color-text-muted)]'
                      }`}>
                        {conv.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </aside>

        {/* Chat Panel (Right) */}
        <main className={`flex-1 flex flex-col bg-[var(--color-bg)] ${
          !selectedConversationId ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedConversation && recipient ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center gap-3">
                {/* Back button for mobile */}
                <button
                  onClick={() => setSelectedConversationId(null)}
                  className="md:hidden p-2 -ml-2 hover:bg-[var(--color-bg)] rounded-lg transition-colors"
                >
                  <Icon icon={icons.arrowRight} size={20} className="rotate-180" />
                </button>

                <Link to={`/u/${recipient.id}`} className="flex items-center gap-3 flex-1">
                  <img
                    src={recipient.avatar}
                    alt={recipient.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-[var(--color-text)] hover:text-[var(--accent-primary)]">
                      {recipient.name}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {recipient.rank} • {recipient.primaryArt}
                    </p>
                  </div>
                </Link>

                {/* Delete conversation */}
                <button
                  onClick={() => handleDeleteConversation(selectedConversation.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete conversation"
                >
                  <Icon icon={icons.trash} size={18} className="text-[var(--color-text-muted)] hover:text-red-500" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-[var(--color-text-muted)]">
                      <Icon icon={icons.message} size={48} className="mx-auto mb-2 opacity-20" />
                      <p>No messages yet</p>
                      <p className="text-sm mt-1">Send a message to start the conversation</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => {
                      const isMe = msg.senderId === me.id
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isMe
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                            <p className={`text-xs mt-1 ${
                              isMe ? 'text-white/70' : 'text-[var(--color-text-muted)]'
                            }`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-full bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="h-10 w-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <Icon icon={icons.send} className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Icon icon={icons.message} className="h-16 w-16 text-[var(--color-text-muted)] mx-auto mb-4 opacity-20" />
                <p className="text-[var(--color-text-muted)] mb-4">
                  Select a conversation to start messaging
                </p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="px-6 py-2 rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 transition-opacity"
                >
                  New Conversation
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
