import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

//import { analyzer } from "vite-bundle-analyzer";
const hosted_target = 'https://se.k6n.net'
//const cartTarget = "https://slask-finder.knatofs.se/";
const target = 'http://localhost:8080/'
const writer_target = 'http://localhost:8082/'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  server: {
    proxy: {
      '/api': {
        target, //: hosted_target,
        changeOrigin: true,
      },
      '/location': {
        target: hosted_target,
        changeOrigin: true,
      },
      '/payment': {
        target: hosted_target,
        changeOrigin: true,
      },
      '/inventory': {
        target: hosted_target,
        changeOrigin: true,
      },
      '/reservations': {
        target: hosted_target,
        changeOrigin: true,
      },
      '/cart': {
        target: hosted_target,
        changeOrigin: true,
      },
      '/tracking': {
        target: hosted_target,
        changeOrigin: true,
      },
      '/track': {
        target: hosted_target,
        changeOrigin: true,
      },
      '/admin': {
        target: writer_target,
        changeOrigin: true,
      },
    },
  },
  plugins: [react()], //, analyzer()
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor' // Split vendor libraries
          }
          if (id.includes('src/components/')) {
            return 'components' // Split components into their own chunk
          }
        },
      },
    },
  },
}))
