import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/myPortfolio/', // GitHub Pages repository name (repo: Mported/myPortfolio)
  plugins: [react({
    babel: {
      plugins: [['styled-jsx/babel', { optimizeForSpeed: true }]]
    }
  })],
  build: {
    sourcemap: false, // Disable source maps to prevent parsing errors
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) return 'three-vendors';
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('gsap')) return 'gsap';
            if (id.includes('react') || id.includes('react-dom')) return 'react-vendors';
            return 'vendor';
          }
        }
      }
    },
  },
  server: {
    sourcemap: false, // Disable source maps in development
  },
  css: {
    devSourcemap: false, // Disable CSS source maps
  },
  esbuild: {
    sourcemap: false, // Disable esbuild source maps
  },
})
