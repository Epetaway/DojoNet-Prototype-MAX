import { useStore } from '../../app/store';
import { Icon, icons } from '../../lib/icons';

export default function RecentJournalsWidget() {
  const session = useStore(s => s.session);
  const getJournals = useStore(s => s.getJournals);
  
  const journals = getJournals(session.userId).slice(0, 4);

  const visibilityIcon = {
  PRIVATE: <Icon icon={icons.lock} className="w-3 h-3" />,
  FRIENDS: <Icon icon={icons.userGroup} className="w-3 h-3" />,
  PUBLIC: <Icon icon={icons.globe} className="w-3 h-3" />
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (journals.length === 0) {
    return (
      <div className="card rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
            <Icon icon={icons.book} className="w-4 h-4 text-[var(--color-text-muted)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Recent journals</h3>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] mb-3">
          Start journaling your training sessions
        </p>
        <a
          href="/journal"
          className="block text-center px-3 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary-hover)] transition-colors"
        >
          Start Journaling
        </a>
      </div>
    );
  }

  return (
    <div className="card rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
            <Icon icon={icons.book} className="w-4 h-4 text-[var(--accent-primary)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Recent journals</h3>
        </div>
        <a
          href="/journal"
          className="text-xs text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] font-medium"
        >
          View all
        </a>
      </div>

      <div className="space-y-2">
        {journals.map(journal => (
          <a
            key={journal.id}
            href={`/journal/${journal.id}`}
            className="block p-3 rounded-lg hover:bg-[var(--color-surface)] transition-colors border border-[var(--color-border)]"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-medium text-[var(--color-text)] line-clamp-1">
                {journal.title || 'Training session'}
              </p>
              <span className="text-[var(--color-text-muted)]">
                {visibilityIcon[journal.visibility]}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-2">
              {journal.journalMeta?.art && (
                <span className="px-2 py-0.5 rounded bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-medium">
                  {journal.journalMeta.art}
                </span>
              )}
              {journal.journalMeta?.durationMin && (
                <span>{journal.journalMeta.durationMin}m</span>
              )}
              <span>•</span>
              <span>{formatDate(journal.createdAt)}</span>
            </div>

            {journal.journalMeta?.techniques && journal.journalMeta.techniques.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {journal.journalMeta.techniques.slice(0, 2).map((tech, i) => (
                  <span
                    key={i}
                    className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-surface)] text-[var(--color-text-muted)]"
                  >
                    #{tech}
                  </span>
                ))}
                {journal.journalMeta.techniques.length > 2 && (
                  <span className="text-xs text-[var(--color-text-muted)]">
                    +{journal.journalMeta.techniques.length - 2}
                  </span>
                )}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
