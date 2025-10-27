import { useStore } from '../../store';
import { Icon, icons } from '../../lib/icons';

export default function DraftsWidget() {
  const session = useStore(s => s.session);
  const drafts = useStore(s => s.drafts);
  const deleteDraft = useStore(s => s.deleteDraft);
  
  const userDrafts = drafts.filter(d => d.authorId === session.userId);

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const loadDraft = (draft) => {
    // TODO: Load draft into composer
    console.log('Loading draft:', draft);
  };

  if (userDrafts.length === 0) {
    return (
      <div className="card rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Icon icon={icons.file} className="w-4 h-4 text-[var(--color-text-muted)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Drafts</h3>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          Your drafts will appear here. They're auto-saved as you type.
        </p>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Icon icon={icons.file} className="w-4 h-4 text-[var(--accent-primary)]" />
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Drafts</h3>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-[var(--color-surface)] text-[var(--color-text-muted)]">
          {userDrafts.length}
        </span>
      </div>

      <div className="space-y-2">
        {userDrafts.slice(0, 3).map(draft => (
          <div
            key={draft.id}
            className="group p-3 rounded-lg hover:bg-[var(--color-surface)] transition-colors cursor-pointer border border-[var(--color-border)]"
            onClick={() => loadDraft(draft)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text)] line-clamp-2 mb-1">
                  {draft.payload.body?.substring(0, 60) || 'Untitled draft'}
                  {draft.payload.body && draft.payload.body.length > 60 && '...'}
                </p>
                <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <Icon icon={icons.clock} className="w-3 h-3" />
                  <span>{formatTimeAgo(draft.updatedAt)}</span>
                  <span>•</span>
                  <span className="px-1.5 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-text-muted)]">
                    {draft.kind === 'JOURNAL' ? '📔 Journal' : '✍️ Post'}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteDraft(draft.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-all"
              >
                <Icon icon={icons.trash} className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {userDrafts.length > 3 && (
        <button className="mt-3 w-full text-center text-xs text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] font-medium">
          View all drafts ({userDrafts.length})
        </button>
      )}
    </div>
  );
}
