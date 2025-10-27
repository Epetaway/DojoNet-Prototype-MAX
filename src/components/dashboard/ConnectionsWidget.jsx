import { useStore } from '../../store';
import { Icon, icons } from '../../lib/icons';

export default function ConnectionsWidget() {
  const session = useStore(s => s.session);
  const users = useStore(s => s.users);
  
  const currentUser = users.find(u => u.id === session.userId);
  if (!currentUser) return null;

  // Get connections (people user follows)
  const connections = users.filter(u => currentUser.following?.includes(u.id));
  const mutualFriends = connections.filter(u => u.following?.includes(currentUser.id));

  return (
    <div className="card rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">Your connections</h3>
        <Icon icon={icons.users} className="w-4 h-4 text-[var(--color-text-muted)]" />
      </div>

      {/* Avatar Stack */}
      {connections.length > 0 ? (
        <>
          <div className="flex -space-x-3 mb-4">
            {connections.slice(0, 8).map((user, i) => (
              <img
                key={user.id}
                src={user.avatar}
                alt={user.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-[var(--color-bg)] hover:scale-110 transition-transform cursor-pointer"
                title={user.name}
                style={{ zIndex: 8 - i }}
              />
            ))}
            {connections.length > 8 && (
              <div
                className="h-10 w-10 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-bg)] flex items-center justify-center text-xs font-semibold text-[var(--color-text-muted)]"
                style={{ zIndex: 0 }}
              >
                +{connections.length - 8}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-4 pb-4 border-b border-[var(--color-border)]">
            <div>
              <span className="font-semibold text-[var(--color-text)]">{currentUser.following?.length || 0}</span>
              <span className="ml-1">Following</span>
            </div>
            <div>
              <span className="font-semibold text-[var(--color-text)]">{currentUser.followers?.length || 0}</span>
              <span className="ml-1">Followers</span>
            </div>
            <div>
              <span className="font-semibold text-[var(--color-text)]">{mutualFriends.length}</span>
              <span className="ml-1">Friends</span>
            </div>
          </div>

          {/* Recent Connections */}
          <div className="space-y-2">
            {connections.slice(0, 3).map(user => (
              <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors cursor-pointer">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] truncate">{user.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{user.rank}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-[var(--color-text-muted)] mb-3">No connections yet</p>
        </div>
      )}

      {/* CTA */}
      <a
        href="/partners"
        className="mt-4 block text-center text-sm text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] font-medium transition-colors"
      >
        Find training partners →
      </a>
    </div>
  );
}
