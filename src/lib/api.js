
// Frontend API helper — defaults to backend enabled.
export const USE_BACKEND = true;
const BASE = '/api';

export async function api(method, path, body){
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}
