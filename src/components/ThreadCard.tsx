// ThreadCard: Reddit-style card with vote column and actions
import React from 'react'
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Thread {
  id: string
  title: string
  author: { username: string }
  tags: string[]
  score: number
  votesUp: number
  votesDown: number
  createdAt: string
  excerpt?: string
  commentCount?: number
}

interface Props {
  thread: Thread
  onVote?: (threadId: string, value: 'UP' | 'DOWN' | 'NEUTRAL') => void
}

export function ThreadCard({ thread, onVote }: Props) {
  const age = formatAge(new Date(thread.createdAt))

  function handleVote(value: 'UP' | 'DOWN') {
    onVote?.(thread.id, value)
  }

  return (
    <article className="rounded-2xl bg-white dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 p-4 shadow-soft hover:shadow-soft-lg transition">
      <div className="flex gap-4">
        {/* Vote column */}
        <div className="flex flex-col items-center">
          <button
            aria-label="Upvote"
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            onClick={() => handleVote('UP')}
          >
            <ThumbsUp className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </button>
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 my-1">
            {thread.score}
          </span>
          <button
            aria-label="Downvote"
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            onClick={() => handleVote('DOWN')}
          >
            <ThumbsDown className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Link to={`/thread/${thread.id}`}>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 hover:text-brand transition">
              {thread.title}
            </h2>
          </Link>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            by <span className="font-medium">@{thread.author.username}</span> • {age}
            {thread.tags.length > 0 && <> • {thread.tags.join(', ')}</>}
          </div>
          {thread.excerpt && (
            <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 line-clamp-3">
              {thread.excerpt}
            </p>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-5 text-sm text-zinc-600 dark:text-zinc-400">
            <Link
              to={`/thread/${thread.id}#comments`}
              className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-200 transition"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{thread.commentCount ?? 0}</span>
            </Link>
            <button className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-200 transition">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-zinc-200 transition">
              <Bookmark className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </article>
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
