
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from './app/store'
import React, { Suspense, lazy } from 'react'
import { Home as HomeIcon, CalendarDays, MessageSquare, Bell } from 'lucide-react'
import NotificationDropdown from './components/layout/NotificationDropdown'
import FloatingNav from './components/layout/FloatingNav'
const Home = lazy(() => import('./pages/Home.jsx'))
const Explore = lazy(() => import('./pages/Explore.jsx'))
const Profile = lazy(() => import('./pages/Profile.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Signup = lazy(() => import('./pages/Signup.jsx'))
const Events = lazy(() => import('./pages/Events.jsx'))
const Notifications = lazy(() => import('./pages/Notifications.jsx'))
const Me = lazy(() => import('./pages/Me.jsx'))
const Dashboard = lazy(() => import('./pages/DashboardNew.tsx'))
const Onboarding = lazy(() => import('./pages/Onboarding.jsx'))
const EventDetail = lazy(() => import('./pages/EventDetail.jsx'))
const Messages = lazy(() => import('./pages/Messages.tsx'))
const Forums = lazy(() => import('./pages/Forums.jsx'))
const Thread = lazy(() => import('./pages/Thread.jsx'))
const Partners = lazy(() => import('./pages/Partners.jsx'))
const Journal = lazy(() => import('./pages/Journal.jsx'))
// New production UI pages
const DashboardNew = lazy(() => import('./pages/DashboardNew.tsx'))
const UserProfile = lazy(() => import('./pages/UserProfile.tsx'))
const ProfileEditor = lazy(() => import('./pages/ProfileEditor.tsx'))
const TestProfiles = lazy(() => import('./pages/TestProfiles.tsx'))
const Search = lazy(() => import('./pages/Search.tsx'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage.tsx'))
const TrainingJournal = lazy(() => import('./pages/TrainingJournal.tsx'))
const PartnerMatchmaking = lazy(() => import('./pages/PartnerMatchmaking.jsx'))
import Settings from './pages/Settings.jsx'
import ThemeToggle from './components/ThemeToggle.jsx'
import { Button } from './components'
import Skeleton from './components/Skeleton.jsx'

function Header(){
  const { session, users, logout } = useStore()
  const me = users.find(u=>u.id===session.userId)
  const nav = useNavigate()
  const { pathname } = useLocation()
  
  // Determine if we should show the full navigation
  const isAuthPage = ['/', '/login', '/signup'].includes(pathname)
  const isLoggedIn = !!session.userId
  const showFullNav = isLoggedIn || !isAuthPage
  
  return (
    <header className="site-header">
      <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center gap-4" role="navigation" aria-label="Top">
        <Link to="/" className="font-display text-2xl tracking-wide uppercase" aria-label="DojoNet Home">DojoNet</Link>
        
        {/* Main Navigation - Show when logged in or not on auth pages */}
        {showFullNav && (
          <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
            <nav className="flex gap-6 text-sm text-[var(--color-text-muted)]" aria-label="Main">
              <Link to="/explore" className={`hover:text-[var(--accent-primary)] ${pathname==='/explore' ? 'border-b-2 border-[#B71C1C] pb-1 text-[var(--color-text)]' : ''}`}>Explore</Link>
              <Link to="/events" className={`hover:text-[var(--accent-primary)] ${pathname.startsWith('/events') ? 'border-b-2 border-[#B71C1C] pb-1 text-[var(--color-text)]' : ''}`}>Events</Link>
              <Link to="/forums" className={`hover:text-[var(--accent-primary)] ${pathname.startsWith('/forums') || pathname.startsWith('/thread/') ? 'border-b-2 border-[#B71C1C] pb-1 text-[var(--color-text)]' : ''}`}>Forums</Link>
            </nav>
          </div>
        )}
        
        {/* Search - Show when logged in */}
        {isLoggedIn && (
          <div className="hidden md:block ml-auto">
            <Link to="/search">
              <label htmlFor="global-search" className="sr-only">Search</label>
              <input 
                id="global-search" 
                className="input w-64 cursor-pointer" 
                placeholder="Search users, posts, tags..." 
                readOnly
                onClick={(e) => {
                  e.preventDefault()
                  nav('/search')
                }}
              />
            </Link>
          </div>
        )}
        
        {/* Icon Navigation - Show when logged in */}
        {isLoggedIn && (
          <div className="hidden md:flex items-center gap-3 ml-4 text-[var(--color-text-muted)]">
            <Link to="/" className={`p-2 rounded hover:bg-[var(--color-elevated)] ${pathname==='/'?'text-[var(--accent-primary)]':''}`} aria-label="Home"><HomeIcon size={18} /></Link>
            <Link to="/events" className={`p-2 rounded hover:bg-[var(--color-elevated)] ${pathname.startsWith('/events')?'text-[var(--accent-primary)]':''}`} aria-label="Events"><CalendarDays size={18} /></Link>
            <Link to="/messages" className={`p-2 rounded hover:bg-[var(--color-elevated)] ${pathname.startsWith('/messages')?'text-[var(--accent-primary)]':''}`} aria-label="Messages"><MessageSquare size={18} /></Link>
            <NotificationDropdown />
          </div>
        )}
        
        {/* Spacer for logged-out state on auth pages */}
        {!isLoggedIn && isAuthPage && <div className="flex-1" />}
        
        {/* User Menu / Auth Buttons */}
        {me ? (
          <div className="hidden md:flex items-center gap-3 ml-4">
            <Link to={`/u/${me.id}`} className="flex items-center gap-2 hover:opacity-80 transition">
              <img src={me.avatar} alt="" aria-hidden="true" className="avatar h-8 w-8" />
              <span className="text-sm">{me.name}</span>
            </Link>
            <Button variant="outline" className="h-10" onClick={()=>{logout(); nav('/login')}}>Logout</Button>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-3 ml-4">
            <Link to="/login"><Button variant="outline" className="h-10">Login</Button></Link>
            <Link to="/signup"><Button className="h-10">Join Free</Button></Link>
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  )
}

export default function App(){
  return (
    <div>
      <Header />
      <div className="pt-4 md:pt-6">
        <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-10"><div className="card p-6"><Skeleton className="h-5 w-40" /><Skeleton className="mt-3 h-4 w-full" /><Skeleton className="mt-2 h-4 w-2/3" /></div></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard-new" element={<DashboardNew />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/u/:id" element={<UserProfile />} />
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/profile/edit" element={<ProfileEditor />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* Gyms route removed per spec */}
            <Route path="/events" element={<Events />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/training" element={<TrainingJournal />} />
            <Route path="/training-journal" element={<TrainingJournal />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/event/:id" element={<EventDetail />} />
            <Route path="/me" element={<Me />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/forums" element={<Forums />} />
            <Route path="/thread/:id" element={<Thread />} />
            <Route path="/partners" element={<PartnerMatchmaking />} />
            <Route path="/partners/swipe" element={<PartnerMatchmaking />} />
            <Route path="/search" element={<Search />} />
            <Route path="/test-profiles" element={<TestProfiles />} />
          </Routes>
        </Suspense>
        <div className="max-w-6xl mx-auto px-4 py-10 text-center text-[var(--color-text-muted)] text-xs">
          Local prototype — all data stored in your browser (localStorage)
        </div>
      </div>
      <FloatingNav />
    </div>
  )
}
