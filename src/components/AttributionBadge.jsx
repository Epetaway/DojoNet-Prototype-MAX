import React from 'react'

// Dev-only attribution badge for placeholder images. Pass a manifest item.
export default function AttributionBadge({ item, showInProd=false, className='' }){
  if(!item) return null
  const { authorName, authorUrl, sourceUrl, provider } = item
  const href = sourceUrl || authorUrl || '#'
  const label = authorName || (provider ? `via ${provider}` : 'source')
  if(!import.meta.env.DEV && !showInProd) return null
  return (
    <div className={`absolute bottom-1 right-1 ${className}`}
         style={{pointerEvents:'auto'}}>
      <a href={href} target="_blank" rel="noopener noreferrer"
         className="bg-black/45 hover:bg-black/60 text-white text-[10px] leading-4 px-2 py-0.5 rounded shadow-sm backdrop-blur-sm">
        Photo: {label}
      </a>
    </div>
  )
}
