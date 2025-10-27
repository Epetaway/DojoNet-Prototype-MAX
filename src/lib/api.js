
// Frontend API helper — Static mode for GitHub Pages demo
// Set to false to use localStorage only (no backend server needed)
export const USE_BACKEND = false;
const BASE = '/api';

export async function api(method, path, body){
  // In static mode, fake minimal endpoints to keep UI stable
  if (!USE_BACKEND) {
    console.log('[Static Mode] API call intercepted:', method, path)
    const p = String(path || '')
    if (method === 'GET') {
      if (p.startsWith('/threads')) return []
      if (p.startsWith('/events')) return []
      if (p.startsWith('/users')) return []
    }
    // Default fallback
    return {}
  }
  
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}
