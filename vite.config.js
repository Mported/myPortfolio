import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Mported_dev/', // GitHub Pages repository name
  plugins: [react({
    babel: {
      plugins: [['styled-jsx/babel', { optimizeForSpeed: true }]]
    }
  })],
  build: {
    sourcemap: false, // Disable source maps to prevent parsing errors
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
