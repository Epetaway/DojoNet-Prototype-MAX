
export const LS = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  has(key){ return localStorage.getItem(key) !== null; }
};

export function uid(prefix='id'){
  return prefix + '_' + Math.random().toString(36).slice(2, 9);
}
