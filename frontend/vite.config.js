import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// =============================================================================
// Bank Churn Prediction - Vite Configuration
// Single Port Architecture: Frontend served from backend port 8000
// =============================================================================

export default defineConfig({
  plugins: [react()],
  
  // Build configuration for production
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Use esbuild minifier (default, doesn't require terser)
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Fixed chunk configuration to avoid circular dependencies
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor'
            if (id.includes('recharts') || id.includes('@nivo') || id.includes('d3')) return 'chart-libs'
            if (id.includes('framer-motion')) return 'animation'
            return 'vendor'
          }
        }
      }
    }
  },
  
  // Development server configuration (for local dev only)
  server: {
    port: 5173,
    host: true,
    // Proxy API calls to backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true
      }
    }
  },
  
  // Preview server (for testing production build locally)
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true
      }
    }
  }
})
