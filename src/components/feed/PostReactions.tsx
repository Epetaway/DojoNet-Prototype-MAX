import React from 'react'
import { Icon, icons } from '../../lib/icons'
import { useStore } from '../../store'

interface PostReactionsProps {
  postId: string
  onReact?: () => void
  onCommentClick?: () => void
}

export default function PostReactions({ postId, onReact, onCommentClick }: PostReactionsProps) {
  const { posts, session, toggleLike } = useStore()
  const post = posts.find(p => p.id === postId)
  
  if (!post) return null
  
  const hasLiked = post.likedBy?.includes(session.userId || '')
  const likeCount = post.likedBy?.length || 0
  const commentCount = post.comments?.length || 0
  
  const handleLike = () => {
    toggleLike(postId)
    onReact?.()
  }
  
  const handleCommentClick = () => {
    onCommentClick?.()
  }
  
  return (
    <div className="flex items-center gap-4 text-sm">
      <button
        onClick={handleLike}
        className="flex items-center gap-1.5 transition-colors hover:text-[var(--color-primary)]"
        style={{ color: hasLiked ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
      >
        <Icon 
          icon={hasLiked ? icons.heart : icons.heartOutline} 
          size={18}
        />
        <span className="font-medium">{likeCount}</span>
      </button>
      
      <button
        onClick={handleCommentClick}
        className="flex items-center gap-1.5 transition-colors hover:text-[var(--color-primary)]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <Icon icon={icons.commentOutline} size={18} />
        <span className="font-medium">{commentCount}</span>
      </button>
      
      <button
        className="flex items-center gap-1.5 transition-colors hover:text-[var(--color-primary)]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <Icon icon={icons.share} size={18} />
      </button>
    </div>
  )
}
