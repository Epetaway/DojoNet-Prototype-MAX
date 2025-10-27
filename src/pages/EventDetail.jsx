import React, { useMemo, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Button } from '../components'
import { useStore } from '../store'

export default function EventDetail(){
  const { id } = useParams()
  const nav = useNavigate()
  const location = useLocation()
  const { posts, users, session, rsvpToEvent, getEventRSVP, getEventRSVPCounts, 
          addEventComment, getEventComments, likeEventComment } = useStore()
  
  const evt = location.state?.event || null
  // Also check if this is a local event post
  const localEvent = posts.find(p => p.id === id && p.type === 'event')
  const [imgError, setImgError] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [activeTab, setActiveTab] = useState('details')
  
  // Get RSVP data
  const currentRSVP = getEventRSVP(id)
  const rsvpCounts = getEventRSVPCounts(id)
  const comments = getEventComments(id)

  if(!evt){
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="card p-6">
          <div className="text-sm text-[var(--color-text-muted)]">Event details are not available. This event may be external.</div>
          <div className="mt-3 flex gap-3">
            <Button variant="outline" onClick={()=>nav(-1)}>Back</Button>
          </div>
        </div>
      </div>
    )
  }

  const dateStr = evt?.start ? new Date(evt.start).toLocaleString() : ''
  const venueStr = evt?.venue ? [evt.venue.city, evt.venue.state].filter(Boolean).join(', ') : ''
  const sourceKey = String(evt?.sourceKey||'').toLowerCase()
  const sourceMap = {
    ibjjf: { label:'IBJJF', logo:'/brand/ibjjf.svg' },
    smoothcomp: { label:'Smoothcomp', logo:'/brand/smoothcomp.svg' },
    naga: { label:'NAGA', logo:null },
    eventbrite: { label:'Eventbrite', logo:null },
    meetup: { label:'Meetup', logo:null },
  }
  const sourceMeta = sourceMap[sourceKey] || (sourceKey ? { label: sourceKey.toUpperCase(), logo: null } : null)

  function handleAddToCalendar(){
    try{
      const start = new Date(evt.start)
      if(isNaN(start.getTime())) return
      const end = new Date(start.getTime() + 60*60*1000)
      const fmt = (d)=> d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z')
      const summary = (evt.title||'Event').replace(/\n/g,' ')
      const locStr = [evt.venue?.city, evt.venue?.state].filter(Boolean).join(', ')
      const ics = [
        'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//DojoNet//EN','BEGIN:VEVENT',
        `UID:evt_${id}`,
        `DTSTAMP:${fmt(new Date())}`,
        `DTSTART:${fmt(start)}`,
        `DTEND:${fmt(end)}`,
        `SUMMARY:${summary}`,
        locStr ? `LOCATION:${locStr}` : null,
        'END:VEVENT','END:VCALENDAR'
      ].filter(Boolean).join('\r\n')
      const blob = new Blob([ics], { type:'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${summary.replace(/[^a-z0-9]+/gi,'_').toLowerCase()}_${id}.ics`
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
    }catch{}
  }

  function handleAddToGoogleCalendar(){
    try{
      const start = new Date(evt.start)
      if(isNaN(start.getTime())) return
      const end = new Date(start.getTime() + 60*60*1000)
      const fmt = (d)=> d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z')
      const summary = (evt.title||'Event').replace(/\n/g,' ')
      const locStr = [evt.venue?.city, evt.venue?.state].filter(Boolean).join(', ')
      const details = [evt.registerUrl||'', window.location.origin + `/event/${id}`].filter(Boolean).join(' ')
      const url = new URL('https://www.google.com/calendar/render')
      url.searchParams.set('action','TEMPLATE')
      url.searchParams.set('text', summary)
      url.searchParams.set('dates', `${fmt(start)}/${fmt(end)}`)
      if(locStr) url.searchParams.set('location', locStr)
      url.searchParams.set('details', details)
      window.open(url.toString(), '_blank', 'noopener')
    }catch{}
  }
  
  const handleRSVP = (status) => {
    if (currentRSVP === status) {
      // Un-RSVP if clicking same status
      rsvpToEvent(id, null)
    } else {
      rsvpToEvent(id, status)
    }
  }
  
  const handleAddComment = (e) => {
    e.preventDefault()
    if (commentText.trim()) {
      addEventComment(id, commentText)
      setCommentText('')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="card overflow-hidden">
        <div className="h-56 w-full bg-fallback-dark relative overflow-hidden">
          {evt?.imageUrl && !imgError ? (
            <img src={evt.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" onError={()=>setImgError(true)} />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900" />
          )}
        </div>
        <div className="p-5">
          <div className="text-xs text-[var(--color-text-muted)]">{dateStr}</div>
          <h1 className="text-2xl font-medium mt-1 flex items-center gap-2">
            <span>{evt.title}</span>
            {evt.verified && <CheckCircle2 size={18} className="text-emerald-500" aria-label="Verified event" />}
          </h1>
          {sourceMeta && (
            <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
              {sourceMeta.logo && (
                <img src={sourceMeta.logo} alt="" className="h-4 w-4 opacity-90" />
              )}
              <span>via {sourceMeta.label}</span>
            </div>
          )}
          <div className="text-sm text-[var(--color-text-muted)]">{venueStr || 'Location TBA'}</div>
          {evt.hostAvatar && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <img src={evt.hostAvatar} alt="" className="h-7 w-7 rounded-full ring-1 ring-zinc-200" />
              <span className="text-[var(--color-text-muted)]">Organizer</span>
            </div>
          )}
          {Array.isArray(evt.tags) && evt.tags.length>0 && (
            <div className="mt-3 flex flex-wrap gap-1 text-[11px] text-[var(--color-text-muted)]">
              {evt.tags.map(t => (<span key={t} className="pill">{t}</span>))}
            </div>
          )}
          
          {/* RSVP Section */}
          <div className="mt-4 border-t pt-4">
            <div className="text-sm font-medium mb-2 text-[var(--color-text)]">
              {rsvpCounts.going} going · {rsvpCounts.interested} interested
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button 
                variant={currentRSVP === 'going' ? 'default' : 'outline'} 
                onClick={() => handleRSVP('going')}
                className="h-10 px-4"
              >
                ✓ Going
              </Button>
              <Button 
                variant={currentRSVP === 'interested' ? 'default' : 'outline'} 
                onClick={() => handleRSVP('interested')}
                className="h-10 px-4"
              >
                ★ Interested
              </Button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mt-6 border-b border-[var(--color-border)]">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'text-[var(--color-text)] border-b-2 border-[var(--color-text)]'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('discussion')}
                className={`pb-3 font-medium transition-colors ${
                  activeTab === 'discussion'
                    ? 'text-[var(--color-text)] border-b-2 border-[var(--color-text)]'
                    : 'text-[var(--color-text-muted)]'
                }`}
              >
                Discussion ({comments.length})
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="mt-4">
              <div className="flex gap-3 flex-wrap mb-4">
                {evt.registerUrl && (
                  <a href={evt.registerUrl} target="_blank" rel="noopener noreferrer">
                    <Button className="h-11 px-5">View original</Button>
                  </a>
                )}
                <Button variant="outline" onClick={handleAddToCalendar} className="h-11 px-5">Download .ics</Button>
                <Button variant="outline" onClick={handleAddToGoogleCalendar} className="h-11 px-5">Google Calendar</Button>
                <Button variant="outline" onClick={()=>nav(-1)} className="h-11 px-5">Back</Button>
              </div>
              {evt.description && (
                <div className="text-sm text-[var(--color-text)] whitespace-pre-wrap">
                  {evt.description}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'discussion' && (
            <div className="mt-4">
              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-6">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts about this event..."
                  className="w-full p-3 border border-[var(--color-border)] rounded-lg resize-none bg-[var(--color-bg)] text-[var(--color-text)]"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="h-10 px-6"
                  >
                    Post Comment
                  </Button>
                </div>
              </form>
              
              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-[var(--color-text-muted)]">
                    <p>No comments yet. Be the first to share your thoughts!</p>
                  </div>
                ) : (
                  comments.map(comment => {
                    const commentAuthor = users.find(u => u.id === comment.userId)
                    const isLiked = comment.likes?.includes(session.userId)
                    
                    return (
                      <div key={comment.id} className="bg-[var(--color-surface)] rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <img 
                            src={commentAuthor?.avatar} 
                            alt={commentAuthor?.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-[var(--color-text)]">
                                {commentAuthor?.name}
                              </span>
                              <span className="text-sm text-[var(--color-text-muted)]">
                                {new Date(comment.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-[var(--color-text)] mb-2">{comment.text}</p>
                            <button
                              onClick={() => likeEventComment(id, comment.id)}
                              className={`text-sm font-semibold ${
                                isLiked ? 'text-red-500' : 'text-[var(--color-text-muted)]'
                              }`}
                            >
                              ♥ {comment.likes?.length || 0}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
