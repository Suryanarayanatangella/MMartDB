import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { Target } from 'lucide-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server :{
    port:5173,
    proxy: {
    '/api': {
      Target : 'https://mmartdb.onrender.com',
      changeOrigin : true,
    }
  }
  }
})
