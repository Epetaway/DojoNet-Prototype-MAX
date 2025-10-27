export async function searchEvents(params={}){
  const url = new URL('/api/events/search', window.location.origin)
  Object.entries(params).forEach(([k,v])=>{
    if(v==null || v==='') return
    if(Array.isArray(v)) url.searchParams.set(k, v.join(','))
    else url.searchParams.set(k, String(v))
  })
  const res = await fetch(url.toString())
  if(!res.ok) throw new Error('events search failed')
  return await res.json()
}
