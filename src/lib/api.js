
// Frontend API helper — Static mode for GitHub Pages demo
// Set to false to use localStorage only (no backend server needed)
export const USE_BACKEND = false;
const BASE = '/api';

export async function api(method, path, body){
  // In static mode, return empty response
  if (!USE_BACKEND) {
    console.log('[Static Mode] API call skipped:', method, path);
    return Promise.resolve({});
  }
  
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}
