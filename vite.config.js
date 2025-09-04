import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/myPortfolio/', // GitHub Pages project repository deployment
  plugins: [react()],
  build: {
    sourcemap: false, // Disable source maps to prevent parsing errors
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendors': ['react', 'react-dom'],
          'animation-vendors': ['framer-motion', 'gsap'],
          'three-vendors': ['three', '@react-three/fiber', '@react-three/drei']
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
