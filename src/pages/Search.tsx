// Search.tsx - Enhanced search and discovery with filters
import React, { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store'
import { Icon, icons } from '../lib/icons'

type SearchTab = 'all' | 'users' | 'posts' | 'tags'
type SortBy = 'relevant' | 'recent' | 'popular'

export default function Search() {
  const { users, posts, session } = useStore()
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState<SearchTab>('all')
  const [sortBy, setSortBy] = useState<SortBy>('relevant')
  const [filters, setFilters] = useState({
    martialArt: '',
    rank: '',
    location: '',
  })
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Save search to recent searches
  const saveSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 10)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  // Search users
  const searchUsers = useMemo(() => {
    if (!query.trim() && !filters.martialArt && !filters.rank && !filters.location) return []

    let filtered = users.filter(u => u.id !== session.userId)

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase()
      filtered = filtered.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.bio?.toLowerCase().includes(q) ||
        u.location?.toLowerCase().includes(q) ||
        u.gym?.toLowerCase().includes(q) ||
        u.rank?.toLowerCase().includes(q)
      )
    }

    // Martial art filter
    if (filters.martialArt) {
      filtered = filtered.filter(u => u.primaryArt === filters.martialArt)
    }

    // Rank filter
    if (filters.rank) {
      filtered = filtered.filter(u => u.rank?.toLowerCase().includes(filters.rank.toLowerCase()))
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(u => u.location?.toLowerCase().includes(filters.location.toLowerCase()))
    }

    // Sort users
    if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0))
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    }

    return filtered
  }, [query, users, session.userId, filters, sortBy])

  // Search posts
  const searchPosts = useMemo(() => {
    if (!query.trim()) return []

    const q = query.toLowerCase()
    let filtered = posts.filter(p => {
      const author = users.find(u => u.id === p.authorId)
      return (
        p.body?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.tags?.some(tag => tag.toLowerCase().includes(q)) ||
        author?.name.toLowerCase().includes(q)
      )
    })

    // Sort posts
    if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
    } else if (sortBy === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return filtered
  }, [query, posts, users, sortBy])

  // Extract trending tags
  const trendingTags = useMemo(() => {
    const tagCount = new Map<string, number>()
    posts.forEach(p => {
      p.tags?.forEach(tag => {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
      })
    })
    return Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count }))
  }, [posts])

  // Filter trending tags by search
  const searchTags = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return trendingTags.filter(({ tag }) => tag.toLowerCase().includes(q))
  }, [query, trendingTags])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      saveSearch(query)
    }
  }

  const handleTagClick = (tag: string) => {
    setQuery(tag)
    setActiveTab('posts')
    saveSearch(tag)
  }

  const martialArts = ['BJJ', 'Muay Thai', 'Boxing', 'Wrestling', 'Judo', 'Karate', 'MMA', 'Taekwondo']
  const ranks = ['White Belt', 'Blue Belt', 'Purple Belt', 'Brown Belt', 'Black Belt']

  const tabs = [
    { id: 'all' as SearchTab, label: 'All', count: searchUsers.length + searchPosts.length + searchTags.length },
    { id: 'users' as SearchTab, label: 'Users', count: searchUsers.length },
    { id: 'posts' as SearchTab, label: 'Posts', count: searchPosts.length },
    { id: 'tags' as SearchTab, label: 'Tags', count: searchTags.length },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Search & Discovery</h1>
          <p className="text-[var(--color-text-muted)]">Find users, posts, and trending content</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Icon
              icon={icons.search}
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, posts, tags..."
              className="w-full pl-12 pr-24 py-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all text-lg"
            />
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl font-medium transition-all ${
                showFilters || filters.martialArt || filters.rank || filters.location
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
              }`}
            >
              <Icon icon={icons.filter} size={18} />
            </button>
          </div>
        </form>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mb-6 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--color-text)]">Advanced Filters</h3>
              <button
                onClick={() => setFilters({ martialArt: '', rank: '', location: '' })}
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Martial Art Filter */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                  Martial Art
                </label>
                <select
                  value={filters.martialArt}
                  onChange={(e) => setFilters(prev => ({ ...prev, martialArt: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">All Arts</option>
                  {martialArts.map(art => (
                    <option key={art} value={art}>{art}</option>
                  ))}
                </select>
              </div>

              {/* Rank Filter */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                  Rank/Belt
                </label>
                <select
                  value={filters.rank}
                  onChange={(e) => setFilters(prev => ({ ...prev, rank: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">All Ranks</option>
                  {ranks.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State, Country"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {!query && recentSearches.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[var(--color-text)]">Recent Searches</h3>
              <button
                onClick={clearRecentSearches}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(search)}
                  className="px-3 py-1.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
                >
                  <Icon icon={icons.clock} size={14} className="inline mr-1" />
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending Tags (when no search) */}
        {!query && (
          <div className="mb-6 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
              <Icon icon={icons.fire} size={20} className="text-orange-500" />
              Trending Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingTags.slice(0, 15).map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="px-3 py-1.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-sm text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all group"
                >
                  #{tag}
                  <span className="ml-1.5 text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {query && (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6 border-b border-[var(--color-border)] overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                      : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-[var(--color-surface)] text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[var(--color-text-muted)]">
                {searchUsers.length + searchPosts.length + searchTags.length} results found
              </p>
              <div className="flex gap-2">
                {(['relevant', 'recent', 'popular'] as SortBy[]).map(sort => (
                  <button
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      sortBy === sort
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
                    }`}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {/* Users Results */}
              {(activeTab === 'all' || activeTab === 'users') && searchUsers.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-4">Users</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchUsers.slice(0, activeTab === 'users' ? undefined : 4).map(user => (
                      <Link
                        key={user.id}
                        to={`/u/${user.id}`}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all group"
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-[var(--color-border)] group-hover:ring-[var(--color-primary)] transition-all"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-primary)] transition-colors">
                            {user.name}
                          </h4>
                          <p className="text-sm text-[var(--color-text-muted)] truncate">
                            {user.rank && `${user.rank} • `}
                            {user.primaryArt || 'Martial Artist'}
                          </p>
                          {user.location && (
                            <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
                              <Icon icon={icons.mapPin} size={12} />
                              {user.location}
                            </p>
                          )}
                        </div>
                        <Icon
                          icon={icons.chevronRight}
                          size={20}
                          className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors"
                        />
                      </Link>
                    ))}
                  </div>
                  {activeTab === 'all' && searchUsers.length > 4 && (
                    <button
                      onClick={() => setActiveTab('users')}
                      className="mt-4 text-sm text-[var(--color-primary)] hover:underline"
                    >
                      View all {searchUsers.length} users →
                    </button>
                  )}
                </div>
              )}

              {/* Posts Results */}
              {(activeTab === 'all' || activeTab === 'posts') && searchPosts.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-4">Posts</h3>
                  <div className="space-y-4">
                    {searchPosts.slice(0, activeTab === 'posts' ? undefined : 3).map(post => {
                      const author = users.find(u => u.id === post.authorId)
                      if (!author) return null

                      return (
                        <div
                          key={post.id}
                          className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <Link to={`/u/${author.id}`}>
                              <img
                                src={author.avatar}
                                alt={author.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-[var(--color-border)] hover:ring-[var(--color-primary)] transition-all"
                              />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <Link
                                to={`/u/${author.id}`}
                                className="font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)] transition-colors"
                              >
                                {author.name}
                              </Link>
                              <p className="text-xs text-[var(--color-text-muted)]">
                                {new Date(post.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                            {post.kind === 'JOURNAL' && (
                              <span className="px-2 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-medium">
                                Journal
                              </span>
                            )}
                          </div>

                          {post.title && (
                            <h4 className="font-bold text-[var(--color-text)] mb-2">{post.title}</h4>
                          )}
                          <p className="text-[var(--color-text)] mb-3 line-clamp-3">{post.body}</p>

                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {post.tags.map(tag => (
                                <button
                                  key={tag}
                                  onClick={() => handleTagClick(tag)}
                                  className="px-2 py-1 rounded-lg bg-[var(--color-bg)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                            <span className="flex items-center gap-1">
                              <Icon icon={icons.heart} size={14} />
                              {post.likesCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon icon={icons.comment} size={14} />
                              {post.commentsCount || 0}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {activeTab === 'all' && searchPosts.length > 3 && (
                    <button
                      onClick={() => setActiveTab('posts')}
                      className="mt-4 text-sm text-[var(--color-primary)] hover:underline"
                    >
                      View all {searchPosts.length} posts →
                    </button>
                  )}
                </div>
              )}

              {/* Tags Results */}
              {(activeTab === 'all' || activeTab === 'tags') && searchTags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[var(--color-text)] mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-3">
                    {searchTags.slice(0, activeTab === 'tags' ? undefined : 10).map(({ tag, count }) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className="px-4 py-2 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all group"
                      >
                        <span className="text-[var(--color-text)] group-hover:text-[var(--color-primary)] font-medium">
                          #{tag}
                        </span>
                        <span className="ml-2 text-sm text-[var(--color-text-muted)]">
                          {count} {count === 1 ? 'post' : 'posts'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchUsers.length === 0 && searchPosts.length === 0 && searchTags.length === 0 && (
                <div className="text-center py-12">
                  <Icon icon={icons.search} size={48} className="mx-auto text-[var(--color-text-muted)] mb-4" />
                  <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">No results found</h3>
                  <p className="text-[var(--color-text-muted)]">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
