import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // For WordPress root deployment
  plugins: [
    react({
      babel: {
        plugins: [['styled-jsx/babel', { optimizeForSpeed: true }]]
      }
    }),
    tailwind()
  ],
  build: {
    sourcemap: false, // Disable source maps to prevent parsing errors
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        format: 'es', // Keep ES modules for now
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          animations: ['framer-motion', 'gsap']
        }
      }
    }
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
