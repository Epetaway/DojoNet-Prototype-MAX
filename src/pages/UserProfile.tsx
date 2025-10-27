// UserProfile: Full profile page with hero, stats, tabs, and content
import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore } from '../store'
import { ProfileHero } from '../components/profile/ProfileHero'
import { ProfileStats } from '../components/profile/ProfileStats'
import { ProfileTabs } from '../components/profile/ProfileTabs'
import { ProfileSong } from '../components/profile/ProfileSong'
import { DojoCircle } from '../components/profile/DojoCircle'
import { PostCard } from '../components/dashboard/PostCard'
import { JournalCard } from '../components/dashboard/JournalCard'
import { Icon, icons } from '../lib/icons'

type Tab = 'Posts' | 'Journals' | 'Media' | 'Friends'

export default function UserProfile() {
  const { id } = useParams<{ id: string }>()
  const { users, session } = useStore()
  const user = users.find((u) => u.id === id)
  const isOwnProfile = session.userId === id

  const [activeTab, setActiveTab] = useState<Tab>('Posts')

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-zinc-400">User not found.</div>
      </div>
    )
  }

  const stats = {
    followers: user.followers?.length || 0,
    following: user.following?.length || 0,
    posts: user.posts?.length || 0,
    journals: user.posts?.filter((p: any) => p.type === 'note').length || 0,
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Hero */}
        <ProfileHero
          user={{
            id: user.id,
            name: user.name,
            rank: user.rank,
            location: user.location,
            bio: user.bio,
            avatar: user.avatar,
            banner: user.banner,
            verifiedGym: user.verifiedGym,
            gym: user.gym,
            affiliation: user.gym
              ? {
                  school: user.gym,
                  beltOrRank: user.rank || 'White Belt',
                }
              : undefined,
            interests: ['BJJ', 'Muay Thai'], // TODO: wire to real data
            theme: user.theme,
          }}
        />

        {/* Profile Song (MySpace-style) */}
        <ProfileSong
          songUrl={user.playlist || undefined}
          songTitle="Quiet Dojo"
          songArtist="Royalty Free Collective"
          username={user.id}
        />

        {/* Stats */}
        <ProfileStats stats={stats} />

        {/* Dojo Circle (Top 8) */}
        {((user as any).dojoCircle || user.friends) && (
          <DojoCircle
            friends={
              (user as any).dojoCircle ||
              (user.friends || []).map((friendId: string) => {
                const friend = users.find(u => u.id === friendId)
                return friend ? {
                  id: friend.id,
                  name: friend.name,
                  avatar: friend.avatar,
                  rank: friend.rank,
                  primaryArt: friend.primaryArt,
                } : null
              }).filter(Boolean)
            }
            isOwner={isOwnProfile}
          />
        )}

        {/* Edit button (if own profile) or Message button (if other user) */}
        <div className="flex justify-end gap-2">
          {isOwnProfile ? (
            <Link
              to="/profile/edit"
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-bg)] hover:bg-[var(--color-border)] text-[var(--color-text)] rounded-lg transition"
            >
              <Icon icon={icons.settings} className="h-4 w-4" />
              <span>Edit Profile</span>
            </Link>
          ) : (
            <Link
              to={`/messages?user=${user.id}`}
              onClick={(e) => {
                e.preventDefault()
                const { getOrCreateConversation } = useStore.getState()
                const currentUserId = useStore.getState().session.userId
                if (currentUserId) {
                  const conversationId = getOrCreateConversation(currentUserId, user.id)
                  window.location.href = '/messages'
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Icon icon={icons.message} className="h-4 w-4" />
              <span>Message</span>
            </Link>
          )}
        </div>

        {/* Tabs */}
  <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'Posts' && (
            <>
              {user.posts && user.posts.length > 0 ? (
                user.posts.map((post: any) => {
                  const postData = {
                    id: post.id,
                    author: {
                      id: user.id,
                      name: user.name,
                      username: user.name.toLowerCase().replace(/\s+/g, '_'),
                      avatar: user.avatar,
                    },
                    body: post.title || 'Untitled post',
                    timeAgo: post.date || 'recently',
                    likes: 0,
                    comments: 0,
                  }
                  return <PostCard {...{ key: post.id, post: postData }} />
                })
              ) : (
                <div className="text-center py-10 text-zinc-500">No posts yet.</div>
              )}
            </>
          )}

          {activeTab === 'Journals' && (
            <>
              {user.posts?.filter((p: any) => p.type === 'note').length > 0 ? (
                user.posts
                  .filter((p: any) => p.type === 'note')
                  .map((journal: any) => {
                    const journalData = {
                      id: journal.id,
                      title: journal.title,
                      body: 'Training reflection...',
                      date: journal.date,
                      visibility: 'PRIVATE' as const,
                    }
                    return <JournalCard {...{ key: journal.id, journal: journalData }} />
                  })
              ) : (
                <div className="text-center py-10 text-zinc-500">No journals yet.</div>
              )}
            </>
          )}

          {activeTab === 'Media' && (
            <div className="text-center py-10 text-zinc-500">Media gallery coming soon.</div>
          )}

          {activeTab === 'Friends' && (
            <div className="text-center py-10 text-zinc-500">
              {user.following?.length || 0} following • {user.followers?.length || 0} followers
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
