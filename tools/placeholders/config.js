export const CONFIG = {
  outputDir: 'public/placeholders',
  sizes: { hero: 1920, wide: 1280, card: 960, square: 800 },
  targets: [
    { key: 'hero', count: 3, queries: ['martial arts training','dojo training wide'], sizeKey: 'hero', grayscale: false, muted: true },
    { key: 'bento', count: 12, queries: ['jiu jitsu rolls','muay thai pads','wrestling takedown','judo throw'], sizeKey: 'card', grayscale: false, muted: true },
    { key: 'feed', count: 16, queries: ['brazilian jiu jitsu','open mat','martial arts sparring','grappling training'], sizeKey: 'card', grayscale: true, muted: true },
    { key: 'events', count: 8, queries: ['martial arts tournament','dojo interior','gym exterior night'], sizeKey: 'wide', grayscale: false, muted: false },
    { key: 'avatars', count: 16, queries: ['portrait athlete','portrait coach studio'], sizeKey: 'square', grayscale: false, muted: false },
  ],
  provider: process.env.PLACEHOLDER_PROVIDER || 'unsplash',
  saveAttribution: true,
}
