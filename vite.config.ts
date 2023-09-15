import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  server: {
    watch: {
      ignored: ['op-tm-api-docs/**']
    }
  },
  build: {
    watch: {
      include: ['src/**', 'index.html', 'next/**', 'mp4/**', 'turbo/**']
    },
    rollupOptions: {
      input: {
        appNext: fileURLToPath(new URL('./next/index.html', import.meta.url)),
        appTurbo: fileURLToPath(new URL('./turbo/index.html', import.meta.url)),
        appMP4: fileURLToPath(new URL('./mp4/index.html', import.meta.url)),
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
