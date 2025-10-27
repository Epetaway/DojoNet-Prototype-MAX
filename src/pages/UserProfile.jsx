import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useStore } from '../store'
import ProfileHero from '../components/profile/ProfileHero'
import ProfileStats from '../components/profile/ProfileStats'
import ProfileTabs from '../components/profile/ProfileTabs'
import PostCard from '../components/dashboard/PostCard'
import JournalCard from '../components/dashboard/JournalCard'

export default function UserProfile() {
  const { id } = useParams()
  const { users, session } = useStore()
  const [activeTab, setActiveTab] = useState('posts')
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const foundUser = users.find(u => u.id === parseInt(id))
    if (foundUser) {
      setUser({
        ...foundUser,
        followers: 156,
        following: 89,
        posts: 42,
        journals: 18,
        interests: ['BJJ', 'No-Gi', 'Wrestling'],
        bio: 'BJJ practitioner focused on competition and continuous improvement.',
        verified: true
      })
    }
  }, [id, users])
  
  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Loading profile...</p>
      </div>
    )
  }
  
  const isOwnProfile = session.userId === user.id
  
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <ProfileHero user={user} />
        
        {/* Stats */}
        <div className="mt-6 bg-[var(--color-surface)] rounded-2xl shadow-soft ring-1 ring-[var(--color-border)]">
          <ProfileStats user={user} />
          
          {/* Edit Profile Button */}
          {isOwnProfile && (
            <div className="p-4 border-t border-zinc-800">
              <Link
                to="/profile/edit"
                className="block text-center px-6 py-2 bg-[var(--color-bg)] text-[var(--color-text)] rounded-lg hover:bg-[var(--color-border)] transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          )}
        </div>
        
        {/* Tabs */}
        <div className="mt-6 bg-[var(--color-surface)] rounded-2xl shadow-soft ring-1 ring-[var(--color-border)] overflow-hidden">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          {/* Tab Content */}
          <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
            {activeTab === 'posts' && (
              <div className="space-y-4">
                <PostCard 
                  post={{
                    id: 1,
                    body: "Great training session today! Working on sweep entries.",
                    timeAgo: "3h ago",
                    likes: 15,
                    comments: 3
                  }}
                  user={user}
                />
              </div>
            )}
            
            {activeTab === 'journals' && (
              <div className="space-y-4">
                <JournalCard 
                  journal={{
                    id: 1,
                    title: "Competition Prep - Week 2",
                    date: "October 20, 2025",
                    body: "Focusing on conditioning and timing. Need to improve cardio for longer matches.",
                    visibility: "private",
                    tags: ["competition", "training"]
                  }}
                />
              </div>
            )}
            
            {activeTab === 'media' && (
              <div className="text-center text-zinc-500 py-12">
                <p>No media uploaded yet</p>
              </div>
            )}
            
            {activeTab === 'friends' && (
              <div className="grid grid-cols-3 gap-4">
                {users.slice(0, 6).map(friend => (
                  <Link 
                    key={friend.id}
                    to={`/user/${friend.id}`}
                    className="flex flex-col items-center p-4 bg-[var(--color-bg)] rounded-lg hover:bg-zinc-750 transition-colors"
                  >
                    <img 
                      src={friend.avatar || '/avatars/default.jpg'} 
                      alt={friend.name}
                      className="w-16 h-16 rounded-full" 
                    />
                    <p className="mt-2 text-sm text-[var(--color-text)] text-center">{friend.name}</p>
                    <p className="text-xs text-zinc-500">@{friend.username}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
