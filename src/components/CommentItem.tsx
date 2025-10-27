// CommentItem: inline comment with vote buttons and actions
import React from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface Comment {
  id: string
  author: { username: string }
  body: string
  votesUp: number
  votesDown: number
  createdAt: string
}

interface Props {
  comment: Comment
  onVote?: (commentId: string, value: 'UP' | 'DOWN' | 'NEUTRAL') => void
  onReply?: (commentId: string) => void
}

export function CommentItem({ comment, onVote, onReply }: Props) {
  const score = comment.votesUp - comment.votesDown
  const age = formatAge(new Date(comment.createdAt))

  function handleVote(value: 'UP' | 'DOWN') {
    onVote?.(comment.id, value)
  }

  return (
    <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 p-3">
      <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          <span className="font-medium text-zinc-700 dark:text-zinc-300">@{comment.author.username}</span> • {age}
        </span>
        <div className="flex items-center gap-2">
          <button
            aria-label="Upvote"
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            onClick={() => handleVote('UP')}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <span className="text-zinc-700 dark:text-zinc-300 font-medium min-w-[1.5rem] text-center">
            {score}
          </span>
          <button
            aria-label="Downvote"
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            onClick={() => handleVote('DOWN')}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{comment.body}</p>
      <div className="mt-2 flex gap-4 text-xs text-zinc-600 dark:text-zinc-400">
        <button
          className="hover:text-zinc-900 dark:hover:text-zinc-200 transition"
          onClick={() => onReply?.(comment.id)}
        >
          Reply
        </button>
        <button className="hover:text-zinc-900 dark:hover:text-zinc-200 transition">
          Share
        </button>
        <button className="hover:text-rose-600 dark:hover:text-rose-500 transition">
          Report
        </button>
      </div>
    </div>
  )
}

function formatAge(date: Date): string {
  const seconds = Math.floor((Date.now() - +date) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
