
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // For GitHub Pages deployment, uncomment and set your repo name:
  base: 'Epetaway/DojoNet-Local-Prototype-MAX/',
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
