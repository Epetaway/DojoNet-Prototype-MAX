import React, { Suspense, lazy } from 'react'
import Skeleton from './Skeleton.jsx'

const NewMembers = lazy(()=>import('./tiles/NewMembers.jsx'))
const BestClips = lazy(()=>import('./tiles/BestClips.jsx'))
const TopConversations = lazy(()=>import('./tiles/TopConversations.jsx'))
const PhotoOfWeek = lazy(()=>import('./tiles/PhotoOfWeek.jsx'))
const TechniqueSpotlight = lazy(()=>import('./tiles/TechniqueSpotlight.jsx'))
const UpcomingEvents = lazy(()=>import('./tiles/UpcomingEvents.jsx'))

export default function BentoGrid(){
  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start">
        <Suspense fallback={<TileSkeleton />}><NewMembers/></Suspense>
        <Suspense fallback={<TileSkeleton />}><PhotoOfWeek/></Suspense>
        <Suspense fallback={<TileSkeleton />}><TopConversations/></Suspense>
        <Suspense fallback={<TileSkeleton />}><UpcomingEvents/></Suspense>
        <Suspense fallback={<TileSkeleton />}><BestClips/></Suspense>
        <Suspense fallback={<TileSkeleton />}><TechniqueSpotlight/></Suspense>
      </div>
    </section>
  )
}

function TileSkeleton({ span = '' }){
  return (
    <div className="rounded-2xl ring-1 ring-zinc-200/70 dark:ring-zinc-800 bg-white dark:bg-zinc-900 p-4 md:p-5 h-full max-h-[18rem]">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-3 h-24 w-full" />
    </div>
  )
}
