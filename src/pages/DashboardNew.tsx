// DashboardNew: 3-column layout with sidebar, feed, and right panel
import React, { useState } from 'react'
import { useStore } from '../store'
import PostComposer from '../components/dashboard/PostComposer'
import FeedStream from '../components/dashboard/FeedStream'
import ConnectionsWidget from '../components/dashboard/ConnectionsWidget'
import QuickActionsCard from '../components/dashboard/QuickActionsCard'
import DraftsWidget from '../components/dashboard/DraftsWidget'
import RecentJournalsWidget from '../components/dashboard/RecentJournalsWidget'
import SuggestedPartnersWidget from '../components/dashboard/SuggestedPartnersWidget'
import UpcomingEventsWidget from '../components/dashboard/UpcomingEventsWidget'
import MilestonesWidget from '../components/dashboard/MilestonesWidget'
import WidgetTabBar from '../components/dashboard/WidgetTabBar'
// import MiniProfileCard from '../components/dashboard/MiniProfileCard'
import { NavItem } from '../components/dashboard/NavItem'
import { Icon, icons } from '../lib/icons'
import { Link, useNavigate } from 'react-router-dom'

export default function DashboardNew() {
  const { session, users, logout } = useStore()
  const me = users.find((u) => u.id === session.userId)
  const navigate = useNavigate()
  const [activeWidget, setActiveWidget] = useState<string | null>(null)

  if (!me) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-[var(--color-text-muted)]">
          <Link to="/login" className="text-[var(--accent-primary)] hover:underline">
            Login
          </Link>{' '}
          to see your dashboard.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex">
      {/* Sidebar (Left - Hidden Below 1280px) */}
      <aside className="w-60 h-screen fixed top-0 left-0 pt-20 px-3 bg-[var(--color-surface)] border-r border-[var(--color-border)] overflow-y-auto" style={{ display: 'none' }}>
        {/* Profile Card */}
        <Link 
          to={`/u/${me.id}`}
          className="block mb-6 p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--accent-primary)] transition group"
        >
          <div className="flex items-center gap-3">
            <img
              src={me.avatar}
              alt={me.name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-[var(--color-border)] group-hover:ring-[var(--accent-primary)] transition"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--accent-primary)] transition">
                {me.name}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                View Profile
              </p>
            </div>
            <Icon icon={icons.arrowRight} className="h-4 w-4 text-[var(--color-text-muted)] group-hover:text-[var(--accent-primary)] transition" />
          </div>
        </Link>

        <nav className="space-y-1">
          <NavItem to="/dashboard" icon={icons.home} label="Dashboard" />
          <NavItem to="/forums" icon={icons.message} label="Forums" />
          <NavItem to="/events" icon={icons.calendar} label="Events" />
          <NavItem to="/explore" icon={icons.users} label="Explore" />
          <NavItem to="/partners" icon={icons.sparkles} label="Partners" />
          <NavItem to="/journal" icon={icons.book} label="Journal" />
          <NavItem to="/notifications" icon={icons.bell} label="Notifications" badge={0} />
        </nav>

        <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand hover:bg-rose-600 text-white rounded-lg font-semibold transition">
            <Icon icon={icons.plus} className="h-5 w-5" />
            <span>New Post</span>
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-[var(--color-border)] space-y-1">
          <NavItem to="/settings" icon={icons.settings} label="Settings" />
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] transition"
          >
            <Icon icon={icons.logout} className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main (Center) */}
      <main className="flex-1 px-6 py-8 pt-24 space-y-6 overflow-y-auto">
        {/* Widget Tab Bar (Mobile/Tablet Only) */}
        <div className="xl:hidden">
          <WidgetTabBar activeWidget={activeWidget} onSelectWidget={setActiveWidget} />
          
          {/* Active Widget Content */}
          {activeWidget && (
            <div className="mb-6 animate-slideDown">
              {activeWidget === 'milestones' && <MilestonesWidget />}
              {activeWidget === 'events' && <UpcomingEventsWidget />}
              {activeWidget === 'connections' && <ConnectionsWidget />}
              {activeWidget === 'partners' && <SuggestedPartnersWidget />}
              {activeWidget === 'drafts' && <DraftsWidget />}
              {activeWidget === 'journals' && <RecentJournalsWidget />}
              {activeWidget === 'actions' && <QuickActionsCard />}
            </div>
          )}
        </div>

        {/* Post Composer */}
        <div data-composer>
          <PostComposer />
        </div>

        {/* Feed Stream */}
        <FeedStream />
      </main>

      {/* Right Panel (Desktop Only - Hidden Below 1280px) */}
      <aside className="w-80 h-screen fixed top-0 right-0 pt-20 px-4 py-6 border-l border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_90%,transparent)] overflow-y-auto" style={{ display: 'none' }}>
        <div className="space-y-6">
          {/* Milestones */}
          <MilestonesWidget />

          {/* Upcoming Events */}
          <UpcomingEventsWidget />

          {/* Connections Widget */}
          <ConnectionsWidget />

          {/* Suggested Partners */}
          <SuggestedPartnersWidget />

          {/* Drafts */}
          <DraftsWidget />

          {/* Recent Journals */}
          <RecentJournalsWidget />

          {/* Quick Actions */}
          <QuickActionsCard />
        </div>
      </aside>
      
      <style>{`
        /* Main content margin adjustment */
        main {
          margin-left: 0;
          margin-right: 0;
        }
        
        @media (min-width: 1280px) {
          /* Show both sidebars and adjust main margins on desktop */
          aside:first-of-type {
            display: block !important;
          }
          aside:last-of-type {
            display: block !important;
          }
          main {
            margin-left: 240px;
            margin-right: 320px;
          }
        }
        
        @media (max-width: 1279px) {
          /* Hide both sidebars completely on mobile/tablet */
          aside:first-of-type {
            display: none !important;
          }
          aside:last-of-type {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
