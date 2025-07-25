import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // allow external access
    port: 5174,
    allowedHosts: ['warehouse-g2.online'], // prevent blocked request error
  },
})
