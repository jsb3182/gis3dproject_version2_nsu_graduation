import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
<<<<<<< HEAD
=======
import cesium from 'vite-plugin-cesium'
>>>>>>> origin/develop

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
<<<<<<< HEAD
=======
    cesium(),
>>>>>>> origin/develop
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
<<<<<<< HEAD
=======
  server: {
    host: '0.0.0.0', // ✅ 외부에서도 접속 가능하게
    port: 5173,
    proxy: {
      '/api-geoserver': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-geoserver/, '/geoserver')
      }
    }
  }
>>>>>>> origin/develop
})
