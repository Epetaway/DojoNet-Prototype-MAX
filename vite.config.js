
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // For GitHub Pages deployment
  base: '/DojoNet-Prototype-MAX/',
  build: {
    // Enable clearer stack traces on GitHub Pages to diagnose runtime errors
    sourcemap: true,
    // Disable minification temporarily to avoid opaque minified stacks like H8(...)
    // Re-enable later once the error is fully resolved
    minify: false,
  },
  server: {
    proxy: {
      // Forward API calls to the local Express server during development
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        // Ensure websockets or other methods work if added later
        ws: true,
      },
      // Serve cached media and brand logos from Express
      '/assets': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
      '/brand': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      }
    }
  }
})
