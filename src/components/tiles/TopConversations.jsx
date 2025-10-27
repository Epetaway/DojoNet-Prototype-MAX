import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useInView } from '../../lib/useInView'
import { api } from '../../lib/api'
import BentoCard from '../BentoCard'

export default function TopConversations(){
  const [threads, setThreads] = useState(null)
  useEffect(()=>{ api('GET','/threads?sort=hot').then(setThreads).catch(()=>setThreads([])) }, [])
  const { ref, visible } = useInView()
  
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }
  
  return (
    <div ref={ref} className={`fade-in ${visible? 'visible':''}`}>
      <BentoCard title="Top conversations" subtitle="Hot in your network">
        <div className="overflow-y-auto max-h-[250px] scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent hover:scrollbar-thumb-zinc-400 dark:hover:scrollbar-thumb-zinc-600 pr-1">
          <ul>
            {(threads||[]).slice(0,8).map(t => (
              <li key={t.id} className="py-3">
                <Link 
                  to={`/thread/${t.id}`}
                  className="group flex items-start gap-3 rounded-lg px-1 hover:bg-[var(--color-elevated)] transition"
                >
                  <div className="mt-0.5 grid place-content-center rounded-md bg-[var(--color-bg)] text-[var(--color-text)] px-2 py-1 text-xs font-semibold min-w-[2.5rem]">
                    {t.votesUp - (t.votesDown || 0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] line-clamp-2">
                      {t.title}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      {t.commentCount || 0} replies · {formatTimeAgo(t.createdAt)}
                    </p>
                    {t.tags && t.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {t.tags.slice(0,3).map(tag => (
                          <span key={tag} className="text-[10px] rounded bg-[var(--color-bg)] px-1.5 py-0.5 text-[var(--color-text-muted)]">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ))}
            {threads && !threads.length && (
              <li className="py-3 text-xs text-[var(--color-text-muted)]">No threads yet. Be the first to post in <Link to="/forums" className="link hover:underline">Forums</Link>.</li>
            )}
            {threads===null && (
              <li className="py-3 text-xs text-[var(--color-text-muted)]">Loading…</li>
            )}
          </ul>
        </div>
      </BentoCard>
    </div>
  )
}
