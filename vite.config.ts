import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const apigateTarget = process.env.APIGATE_PROXY_TARGET || 'http://127.0.0.1:4000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/apigate': {
        target: apigateTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apigate/, ''),
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    proxy: {
      '/apigate': {
        target: apigateTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apigate/, ''),
      },
    },
  },
})
