import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/predict': 'http://localhost:8000',
      '/sample-transactions': 'http://localhost:8000',
      '/health': 'http://localhost:8000'
    }
  }
})