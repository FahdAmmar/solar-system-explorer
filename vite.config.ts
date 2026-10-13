import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// React is shared by the landing page and the 3D libraries, so it gets its own chunk: without
// one, the bundler stores it inside the 3D chunk and the landing page would have to load that.
const REACT_CORE = /node_modules[\\/](react|react-dom|scheduler)[\\/]/

// Core 3D libraries only. drei and three-stdlib stay with the Explore page, which is the only
// one that needs the camera controls, so the landing page does not download them.
const THREE_CORE =
  /node_modules[\\/](three|@react-three[\\/]fiber|its-fine|suspend-react|react-use-measure)[\\/]/

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rolldownOptions: {
      output: {
        // A chunk of their own: it changes only when the libraries do, so a deploy that touches
        // app code leaves the biggest download in the visitor's cache.
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: REACT_CORE, priority: 2 },
            { name: 'vendor-three', test: THREE_CORE },
          ],
        },
      },
    },
    // three.js alone is ~700 kB minified. It already loads lazily (after the landing hero, or
    // with the Explore page), so the default 500 kB warning cannot be acted on. Still warns above 1 MB.
    chunkSizeWarningLimit: 1000,
  },
  // Unit tests cover pure logic (data, math, services, store), so no browser DOM is needed.
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
