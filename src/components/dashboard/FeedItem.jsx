import { useState } from 'react';
import { useStore } from '../../store';
import { Icon, icons } from '../../lib/icons';
import PostReactions from '../feed/PostReactions';
import CommentThread from '../feed/CommentThread';

export default function FeedItem({ post }) {
  const users = useStore(s => s.users);
  const [showComments, setShowComments] = useState(false);
  
  const author = users.find(u => u.id === post.authorId);
  if (!author) return null;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const visibilityBadge = {
    PRIVATE: { icon: <Icon icon={icons.lock} className="w-3 h-3" />, label: 'Private', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
    FRIENDS: { icon: <Icon icon={icons.userGroup} className="w-3 h-3" />, label: 'Friends', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  };

  return (
    <article className="card rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <header className="flex items-start gap-3 mb-4">
        <img
          src={author.avatar}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-[var(--color-border)]"
          alt={author.name}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-[var(--color-text)]">{author.name}</h3>
            {author.rank && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                {author.rank}
              </span>
            )}
            {post.kind === 'JOURNAL' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-medium">
                📔 Journal
              </span>
            )}
            {post.visibility !== 'PUBLIC' && visibilityBadge[post.visibility] && (
              <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${visibilityBadge[post.visibility].color}`}>
                {visibilityBadge[post.visibility].icon}
                {visibilityBadge[post.visibility].label}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-muted)]">
            <span>{formatDate(post.createdAt)}</span>
            {author.gym && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Icon icon={icons.mapPin} className="w-3 h-3" />
                  {author.gym}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Title (for journals) */}
      {post.title && (
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-2">{post.title}</h2>
      )}

      {/* Body */}
      {post.body && (
        <p className="text-[var(--color-text)] whitespace-pre-wrap mb-3 leading-relaxed">
          {post.body}
        </p>
      )}

      {/* Journal Meta */}
      {post.kind === 'JOURNAL' && post.journalMeta && (
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          {post.journalMeta.art && (
            <span className="px-2 py-1 rounded-md bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-medium">
              {post.journalMeta.art}
            </span>
          )}
          {post.journalMeta.sessionType && (
            <span className="px-2 py-1 rounded-md bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
              {post.journalMeta.sessionType}
            </span>
          )}
          {post.journalMeta.durationMin && (
            <span className="px-2 py-1 rounded-md bg-[var(--color-surface)] text-[var(--color-text-muted)] flex items-center gap-1 border border-[var(--color-border)]">
              <Icon icon={icons.clock} className="w-3 h-3" />
              {post.journalMeta.durationMin}m
            </span>
          )}
          {post.journalMeta.mood && (
            <span className="px-2 py-1 rounded-md bg-[var(--color-surface)] text-[var(--color-text-muted)] flex items-center gap-1 border border-[var(--color-border)]">
              <Icon icon={icons.bolt} className="w-3 h-3" />
              {post.journalMeta.mood}
            </span>
          )}
        </div>
      )}

      {/* Techniques Tags */}
      {post.kind === 'JOURNAL' && post.journalMeta?.techniques && post.journalMeta.techniques.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.journalMeta.techniques.map((tech, i) => (
            <span
              key={i}
              className="text-xs px-2 py-1 rounded-md bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
            >
              #{tech}
            </span>
          ))}
        </div>
      )}

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div className={`mb-3 grid gap-2 ${post.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.media.slice(0, 4).map((m, i) => (
            <div key={i} className="relative overflow-hidden rounded-xl">
              {m.type === 'image' ? (
                <img
                  src={m.url}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                  alt=""
                />
              ) : (
                <video
                  src={m.url}
                  controls
                  className="w-full h-64 object-cover rounded-xl"
                />
              )}
              {i === 3 && post.media.length > 4 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-bold">
                  +{post.media.length - 4} more
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <footer className="pt-3 border-t border-[var(--color-border)]">
        <PostReactions 
          postId={post.id} 
          onReact={() => setShowComments(true)}
          onCommentClick={() => setShowComments(!showComments)}
        />
        
        {/* Comment Thread */}
        {(showComments || (post.comments && post.comments.length > 0)) && (
          <div className="mt-4">
            <CommentThread postId={post.id} />
          </div>
        )}
      </footer>
    </article>
  );
}
