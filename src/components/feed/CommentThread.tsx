import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, icons } from '../../lib/icons'
import { useStore } from '../../store'

interface CommentThreadProps {
  postId: string
  maxVisible?: number
}

export default function CommentThread({ postId, maxVisible = 3 }: CommentThreadProps) {
  const { posts, users, session, addComment, toggleCommentLike, addReply } = useStore()
  const [showAll, setShowAll] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  
  const post = posts.find(p => p.id === postId)
  if (!post) return null
  
  const comments = post.comments || []
  const visibleComments = showAll ? comments : comments.slice(-maxVisible)
  const hasMore = comments.length > maxVisible
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !session.userId) return
    
    setIsSubmitting(true)
    
    // Add comment
    addComment(postId, commentText.trim())
    
    // Clear input
    setCommentText('')
    setIsSubmitting(false)
  }
  
  const handleReplySubmit = async (commentId: string) => {
    if (!replyText.trim() || !session.userId) return
    
    setIsSubmitting(true)
    
    // Add reply
    addReply(postId, commentId, replyText.trim())
    
    // Clear and close reply input
    setReplyText('')
    setReplyingTo(null)
    setIsSubmitting(false)
  }
  
  const handleLikeComment = (commentId: string) => {
    if (!session.userId) return
    toggleCommentLike(postId, commentId)
  }
  
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  return (
    <div className="space-y-3">
      {/* Show More Button */}
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
        >
          View all {comments.length} comments
        </button>
      )}
      
      {/* Comment List */}
      <div className="space-y-3">
        {visibleComments.map(comment => {
          const author = users.find(u => u.id === comment.userId)
          if (!author) return null
          
          const isLiked = comment.likedBy?.includes(session.userId || '') || false
          const likeCount = comment.likedBy?.length || 0
          const replyCount = comment.replies?.length || 0
          
          return (
            <div key={comment.id} className="space-y-2">
              <div className="flex gap-3">
                <Link to={`/u/${author.id}`}>
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-[var(--color-border)] hover:ring-2 hover:ring-[var(--color-primary)] transition-all"
                  />
                </Link>
                
                <div className="flex-1 min-w-0">
                  <div className="bg-[var(--color-surface)] rounded-2xl px-3 py-2 border border-[var(--color-border)]">
                    <Link
                      to={`/u/${author.id}`}
                      className="font-semibold text-sm text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
                    >
                      {author.name}
                    </Link>
                    <p className="text-sm text-[var(--color-text)] mt-0.5 break-words">
                      {comment.text}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1 px-3 text-xs text-[var(--color-text-muted)]">
                    <span>{formatTime(comment.createdAt)}</span>
                    <button 
                      onClick={() => handleLikeComment(comment.id)}
                      className={`hover:text-[var(--color-primary)] transition-colors font-medium ${isLiked ? 'text-[var(--color-primary)]' : ''}`}
                    >
                      {isLiked ? 'Liked' : 'Like'} {likeCount > 0 && `(${likeCount})`}
                    </button>
                    <button 
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="hover:text-[var(--color-primary)] transition-colors"
                    >
                      Reply {replyCount > 0 && `(${replyCount})`}
                    </button>
                  </div>
                  
                  {/* Reply Input */}
                  {replyingTo === comment.id && session.userId && (
                    <div className="flex gap-2 mt-2 pl-3">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Reply to ${author.name}...`}
                        className="flex-1 px-3 py-1.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                        autoFocus
                      />
                      <button
                        onClick={() => handleReplySubmit(comment.id)}
                        disabled={!replyText.trim() || isSubmitting}
                        className="px-3 py-1.5 rounded-full bg-[var(--color-primary)] text-white font-medium text-xs hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Send
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyText('')
                        }}
                        className="px-3 py-1.5 rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] font-medium text-xs hover:bg-[var(--color-border)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  
                  {/* Nested Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 pl-3 space-y-2 border-l-2 border-[var(--color-border)]">
                      {comment.replies.map(reply => {
                        const replyAuthor = users.find(u => u.id === reply.userId)
                        if (!replyAuthor) return null
                        
                        return (
                          <div key={reply.id} className="flex gap-2">
                            <Link to={`/u/${replyAuthor.id}`}>
                              <img
                                src={replyAuthor.avatar}
                                alt={replyAuthor.name}
                                className="w-6 h-6 rounded-full object-cover ring-1 ring-[var(--color-border)] hover:ring-2 hover:ring-[var(--color-primary)] transition-all"
                              />
                            </Link>
                            
                            <div className="flex-1 min-w-0">
                              <div className="bg-[var(--color-bg)] rounded-xl px-2.5 py-1.5 border border-[var(--color-border)]">
                                <Link
                                  to={`/u/${replyAuthor.id}`}
                                  className="font-semibold text-xs text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
                                >
                                  {replyAuthor.name}
                                </Link>
                                <p className="text-xs text-[var(--color-text)] mt-0.5 break-words">
                                  {reply.text}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-0.5 px-2.5 text-xs text-[var(--color-text-muted)]">
                                <span>{formatTime(reply.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Comment Input */}
      {session.userId && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <img
            src={users.find(u => u.id === session.userId)?.avatar || 'https://i.pravatar.cc/200?img=68'}
            alt="Your avatar"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-[var(--color-border)]"
          />
          
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
              disabled={isSubmitting}
            />
            
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className="px-4 py-2 rounded-full bg-[var(--color-primary)] text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon icon={icons.send} size={14} />
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
