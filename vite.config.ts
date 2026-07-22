import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), visualizer({ open: true, filename: 'dist/stats.html', gzipSize: true })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Keep vendor code in its own chunk so it's cached separately from
    // app code that changes often — big win on slow/repeat-visit mobile networks.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules') && (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('/react/'))) {
            return 'vendor'
          }
        },
      },
    },
    // Warn early if a page's bundle grows heavy — matters a lot on 3G/4G in Rwanda.
    chunkSizeWarningLimit: 300,
  },
  server: {
    port: 5173,
  },
})