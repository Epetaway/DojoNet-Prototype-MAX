import { useState } from 'react';
import { useStore } from '../store';
import { BookOpen, Filter, Calendar, Lock, Users, Globe, Plus, Clock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Journal() {
  const session = useStore(s => s.session);
  const users = useStore(s => s.users);
  const chapters = useStore(s => s.chapters);
  const getJournals = useStore(s => s.getJournals);
  
  const user = users.find(u => u.id === session.userId);
  const userChapters = chapters
    .filter(ch => ch.userId === session.userId)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [filters, setFilters] = useState({
    art: '',
    sessionType: '',
    search: ''
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-[var(--color-text-muted)]">
          <Link to="/login" className="text-[var(--accent-primary)] hover:underline">
            Login
          </Link>{' '}
          to access your journal
        </div>
      </div>
    );
  }

  // Get journals with filters
  let journals = getJournals(session.userId, {
    chapterId: selectedChapterId,
    art: filters.art,
    sessionType: filters.sessionType
  });

  // Search filter
  if (filters.search) {
    journals = journals.filter(j =>
      (j.title?.toLowerCase().includes(filters.search.toLowerCase())) ||
      (j.body?.toLowerCase().includes(filters.search.toLowerCase())) ||
      j.journalMeta?.techniques?.some(t => t.toLowerCase().includes(filters.search.toLowerCase()))
    );
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const visibilityConfig = {
    PRIVATE: { icon: <Lock className="w-4 h-4" />, label: 'Private', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
    FRIENDS: { icon: <Users className="w-4 h-4" />, label: 'Friends', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
    PUBLIC: { icon: <Globe className="w-4 h-4" />, label: 'Public', color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-24 pb-16 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[var(--accent-primary)]/10">
                <BookOpen className="w-6 h-6 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--color-text)]">My Journal</h1>
                <p className="text-[var(--color-text-muted)] mt-1">
                  Track your martial arts journey • {journals.length} {journals.length === 1 ? 'entry' : 'entries'}
                </p>
              </div>
            </div>
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-primary-hover)] transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              New Entry
            </Link>
          </div>
        </header>

        {/* Chapter Navigation */}
        {userChapters.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex items-center gap-2 pb-2">
              <button
                onClick={() => setSelectedChapterId(null)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                  !selectedChapterId
                    ? 'bg-[var(--accent-primary)] text-white shadow-md'
                    : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
                }`}
              >
                All Chapters
              </button>
              {userChapters.map(chapter => {
                const entryCount = getJournals(session.userId, { chapterId: chapter.id }).length;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => setSelectedChapterId(chapter.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
                      selectedChapterId === chapter.id
                        ? 'bg-[var(--accent-primary)] text-white shadow-md'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]'
                    }`}
                  >
                    {chapter.title}
                    {!chapter.endedAt && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
                        Current
                      </span>
                    )}
                    <span className="ml-2 text-xs opacity-70">({entryCount})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-[var(--accent-primary)]" />
                <h3 className="font-semibold text-[var(--color-text)]">Filters</h3>
              </div>

              <div className="space-y-3">
                {/* Search */}
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                />

                {/* Discipline */}
                <select
                  value={filters.art}
                  onChange={(e) => setFilters({ ...filters, art: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                >
                  <option value="">All Disciplines</option>
                  <option value="BJJ">BJJ</option>
                  <option value="Muay Thai">Muay Thai</option>
                  <option value="Judo">Judo</option>
                  <option value="Wrestling">Wrestling</option>
                  <option value="Boxing">Boxing</option>
                  <option value="MMA">MMA</option>
                </select>

                {/* Session Type */}
                <select
                  value={filters.sessionType}
                  onChange={(e) => setFilters({ ...filters, sessionType: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                >
                  <option value="">All Session Types</option>
                  <option value="Class">Class</option>
                  <option value="Open Mat">Open Mat</option>
                  <option value="Sparring">Sparring</option>
                  <option value="Drilling">Drilling</option>
                  <option value="Private">Private Lesson</option>
                  <option value="Competition">Competition</option>
                </select>

                {/* Clear Filters */}
                {(filters.search || filters.art || filters.sessionType) && (
                  <button
                    onClick={() => setFilters({ art: '', sessionType: '', search: '' })}
                    className="w-full text-sm text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="card rounded-xl p-4">
              <h3 className="font-semibold text-[var(--color-text)] mb-3">Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Total entries</span>
                  <span className="font-semibold text-[var(--color-text)]">{journals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Chapters</span>
                  <span className="font-semibold text-[var(--color-text)]">{userChapters.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">This month</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {journals.filter(j => {
                      const date = new Date(j.createdAt);
                      const now = new Date();
                      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    }).length}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Journal Entries */}
          <main className="lg:col-span-3">
            {journals.length === 0 ? (
              <div className="card rounded-xl p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-[var(--accent-primary)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">No journal entries yet</h3>
                  <p className="text-[var(--color-text-muted)] mb-6">
                    Start documenting your training journey! Create your first entry from the dashboard.
                  </p>
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-primary-hover)] transition-all shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Entry
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {journals.map(journal => (
                  <article key={journal.id} className="card rounded-xl p-6 hover:shadow-lg transition-shadow">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {journal.title && (
                            <h2 className="text-xl font-bold text-[var(--color-text)]">{journal.title}</h2>
                          )}
                          {!journal.title && (
                            <h2 className="text-xl font-bold text-[var(--color-text)]">Training Session</h2>
                          )}
                          {visibilityConfig[journal.visibility] && (
                            <span className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${visibilityConfig[journal.visibility].color}`}>
                              {visibilityConfig[journal.visibility].icon}
                              {visibilityConfig[journal.visibility].label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(journal.createdAt)}
                          </span>
                          {journal.journalMeta?.durationMin && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {journal.journalMeta.durationMin}m
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Meta Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {journal.journalMeta?.art && (
                        <span className="px-3 py-1 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-sm font-medium">
                          {journal.journalMeta.art}
                        </span>
                      )}
                      {journal.journalMeta?.sessionType && (
                        <span className="px-3 py-1 rounded-lg bg-[var(--color-surface)] text-[var(--color-text-muted)] text-sm border border-[var(--color-border)]">
                          {journal.journalMeta.sessionType}
                        </span>
                      )}
                      {journal.journalMeta?.mood && (
                        <span className="px-3 py-1 rounded-lg bg-[var(--color-surface)] text-[var(--color-text-muted)] text-sm flex items-center gap-1 border border-[var(--color-border)]">
                          <Zap className="w-3 h-3" />
                          {journal.journalMeta.mood}
                        </span>
                      )}
                    </div>

                    {/* Body */}
                    {journal.body && (
                      <p className="text-[var(--color-text)] leading-relaxed mb-4 whitespace-pre-wrap">
                        {journal.body}
                      </p>
                    )}

                    {/* Techniques */}
                    {journal.journalMeta?.techniques && journal.journalMeta.techniques.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {journal.journalMeta.techniques.map((tech, i) => (
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
                    {journal.media && journal.media.length > 0 && (
                      <div className={`grid gap-2 ${journal.media.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} mb-4`}>
                        {journal.media.map((m, i) => (
                          <div key={i} className="relative overflow-hidden rounded-lg">
                            {m.type === 'image' ? (
                              <img
                                src={m.url}
                                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                alt=""
                              />
                            ) : (
                              <video
                                src={m.url}
                                controls
                                className="w-full h-48 object-cover rounded-lg"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
