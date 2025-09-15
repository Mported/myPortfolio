import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use repository name as base for GitHub Pages project site
  base: '/myPortfolio/',
  resolve: {
  // avoid duplicate React copies
  dedupe: ['react', 'react-dom']
  },
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },
  build: {
    sourcemap: false,
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
    sourcemap: false,
    host: true,
    port: 5174
  },
  css: {
    devSourcemap: false
  },
  esbuild: {
    sourcemap: false,
    target: 'esnext'
  },
  optimizeDeps: {
    // ensure scheduler is pre-bundled so all imports reference the same module
    include: ['scheduler']
    // don't exclude @react-three packages here; letting Vite prebundle them helps dedupe
  }
})