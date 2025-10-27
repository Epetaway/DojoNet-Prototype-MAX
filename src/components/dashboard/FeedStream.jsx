import { useEffect, useState, useRef } from 'react';
import { useStore } from '../../store';
import FeedItem from './FeedItem';
import { Icon, icons } from '../../lib/icons';

export default function FeedStream() {
  const session = useStore(s => s.session);
  const getFeed = useStore(s => s.getFeed);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (!session.userId) return;
    loadFeed();
  }, [session.userId, page]);

  const loadFeed = () => {
    if (!session.userId) return;
    
    setLoading(true);
    setTimeout(() => {
      const allPosts = getFeed(session.userId);
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      const newPosts = allPosts.slice(start, end);
      
      if (page === 1) {
        setFeed(newPosts);
      } else {
        setFeed(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(end < allPosts.length);
      setLoading(false);
    }, 300); // Simulate network delay
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(p => p + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading]);

  if (!session.userId) {
    return (
      <div className="card rounded-2xl p-8 text-center">
        <p className="text-[var(--color-text-muted)]">Please log in to see your feed</p>
      </div>
    );
  }

  if (feed.length === 0 && !loading) {
    return (
      <div className="card rounded-2xl p-8 text-center space-y-3">
        <p className="text-lg font-medium text-[var(--color-text)]">Your feed is empty</p>
        <p className="text-[var(--color-text-muted)]">
          Start following people or create your first post to see updates here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feed.map(post => (
        <FeedItem key={post.id} post={post} />
      ))}
      
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Icon icon={icons.spinner} className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
        </div>
      )}
      
      {!loading && hasMore && (
        <div ref={observerRef} className="h-10" />
      )}
      
      {!hasMore && feed.length > 0 && (
        <div className="text-center py-8 text-sm text-[var(--color-text-muted)]">
          You've reached the end of your feed
        </div>
      )}
    </div>
  );
}
