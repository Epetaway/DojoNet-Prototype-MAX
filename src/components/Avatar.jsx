/**
 * Deprecated: Use the avatar CSS utility classes instead (e.g., className="avatar avatar-md").
 * This component remains temporarily to avoid breaking direct path imports.
 */
export default function Avatar(){
  if (typeof window !== 'undefined' && import.meta?.env?.DEV) {
    // eslint-disable-next-line no-console
  console.warn('Deprecated Avatar component used. Switch to the avatar utility classes instead.')
  }
  return null
}
