// PostCard: User-generated journals, forum posts, or training notes
import React from 'react'
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Post {
  id: string
  author: {
    id: string
    name: string
    username: string
    avatar: string
  }
  body: string
  timeAgo: string
  likes: number
  comments: number
  type?: 'post' | 'journal' | 'event'
}

interface Props {
  post: Post
  onLike?: (postId: string) => void
  onComment?: (postId: string) => void
  onShare?: (postId: string) => void
}

export function PostCard({ post, onLike, onComment, onShare }: Props) {
  return (
    <div className="rounded-2xl bg-zinc-900 p-5 shadow-soft hover:shadow-soft-lg transition duration-300 ease-out hover:translate-y-[-2px] ring-1 ring-zinc-800 hover:ring-brand/40">
      <header className="flex items-center gap-3">
        <Link to={`/profile/${post.author.id}`}>
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full ring-2 ring-zinc-800 hover:ring-brand transition"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${post.author.id}`}>
            <h3 className="text-zinc-100 font-semibold hover:text-brand transition truncate">
              {post.author.name}
            </h3>
          </Link>
          <p className="text-xs text-zinc-500">
            @{post.author.username} • {post.timeAgo}
          </p>
        </div>
      </header>

      <p className="mt-3 text-zinc-300 leading-relaxed">{post.body}</p>

      <footer className="mt-4 flex gap-6 text-zinc-400 text-sm">
        <button
          onClick={() => onLike?.(post.id)}
          className="hover:text-white flex items-center gap-1.5 transition group"
        >
          <ThumbsUp className="h-4 w-4 group-hover:scale-110 transition" />
          <span>{post.likes}</span>
        </button>
        <button
          onClick={() => onComment?.(post.id)}
          className="hover:text-white flex items-center gap-1.5 transition group"
        >
          <MessageCircle className="h-4 w-4 group-hover:scale-110 transition" />
          <span>{post.comments}</span>
        </button>
        <button
          onClick={() => onShare?.(post.id)}
          className="hover:text-white flex items-center gap-1.5 transition group"
        >
          <Share2 className="h-4 w-4 group-hover:scale-110 transition" />
          <span>Share</span>
        </button>
      </footer>
    </div>
  )
}
