import React, { useState, useEffect } from 'react'
import { Home, Calendar, MessageSquare, Users, BookOpen, Settings, PlusCircle } from 'lucide-react'
import NavItem from '../components/dashboard/NavItem'
import PostCard from '../components/dashboard/PostCard'
import JournalCard from '../components/dashboard/JournalCard'
import MiniProfileCard from '../components/dashboard/MiniProfileCard'
import { useStore } from '../store'

export default function Dashboard() {
  const { users, session } = useStore()
  const currentUser = users.find(u => u.id === session.userId)
  
  // Mock data - replace with actual API calls
  const [posts, setPosts] = useState([
    {
      id: 1,
      body: "Just finished an amazing rolling session! Working on my guard retention has really paid off. Managed to hit a nice triangle choke today 🥋",
      timeAgo: "2h ago",
      likes: 24,
      comments: 5,
      userId: session.userId
    },
    {
      id: 2,
      body: "Competition prep is intense but I'm loving every minute. Shoutout to my training partners for pushing me every day!",
      timeAgo: "5h ago",
      likes: 42,
      comments: 8,
      userId: users[1]?.id
    }
  ])
  
  const [journals, setJournals] = useState([
    {
      id: 1,
      title: "Training Session - Guard Work",
      date: "October 23, 2025",
      body: "Focused on maintaining closed guard and breaking posture. Need to work more on transitioning to submissions when opponent tries to stand.",
      visibility: "private",
      tags: ["guard", "fundamentals"]
    }
  ])

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Sidebar */}
      <aside className="w-60 h-screen fixed top-0 left-0 pt-20 px-3 bg-[var(--color-surface)] border-r border-[var(--color-border)] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
        <nav className="space-y-1">
          <NavItem to="/dashboard" icon={Home} label="Dashboard" />
          <NavItem to="/events" icon={Calendar} label="Events" />
          <NavItem to="/forums" icon={MessageSquare} label="Forum" />
          <NavItem to="/explore" icon={Users} label="Community" />
          <NavItem to="/techniques" icon={BookOpen} label="Techniques" />
          <NavItem to="/profile/edit" icon={Settings} label="Settings" />
        </nav>
        
        <button className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand text-white rounded-lg hover:bg-rose-600 transition-all duration-200 shadow-soft hover:shadow-soft-lg">
          <PlusCircle className="w-5 h-5" />
          <span className="font-medium">New Post</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-60 mr-80 px-6 py-8 pt-20">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-zinc-50">Your Feed</h1>
          
          {/* Posts */}
          {posts.map(post => {
            const user = users.find(u => u.id === post.userId) || currentUser
            return (
              <PostCard 
                key={post.id} 
                post={post} 
                user={{
                  avatar: user?.avatar || '/avatars/default.jpg',
                  name: user?.name || 'User',
                  username: user?.username || 'user'
                }}
              />
            )
          })}
          
          {/* Journals */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">Recent Journals</h2>
            {journals.map(journal => (
              <JournalCard key={journal.id} journal={journal} />
            ))}
          </div>
        </div>
      </main>

      {/* Right Panel */}
      <aside className="w-80 h-screen fixed top-0 right-0 pt-20 px-4 py-6 border-l border-[var(--color-border)] bg-[var(--color-bg)]/30 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 hover:scrollbar-thumb-zinc-600 scrollbar-track-transparent">
        <div className="space-y-6">
          {currentUser && (
            <MiniProfileCard user={{
              ...currentUser,
              avatar: currentUser?.avatar || '/avatars/default.jpg',
              followers: 156,
              following: 89,
              posts: 42
            }} />
          )}
          
          <div className="bg-[var(--color-surface)] rounded-xl p-4 ring-1 ring-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Upcoming Events</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-300">IBJJF Championship</span>
                <span className="text-zinc-500">Nov 5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-300">Open Mat Session</span>
                <span className="text-zinc-500">Oct 28</span>
              </div>
            </div>
          </div>
          
          <div className="bg-[var(--color-surface)] rounded-xl p-4 ring-1 ring-[var(--color-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">Trending Posts</h3>
            <div className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <p className="hover:text-zinc-300 cursor-pointer transition-colors">Best drills for guard retention</p>
              <p className="hover:text-zinc-300 cursor-pointer transition-colors">Competition mindset tips</p>
              <p className="hover:text-zinc-300 cursor-pointer transition-colors">Recovery and injury prevention</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}
