import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path' // You may need to run: npm install @types/node --save-dev

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        // Your existing Admin App
        main: resolve(__dirname, 'index.html'), 
        // Your new independent Voter App
        voter: resolve(__dirname, 'voter.html') 
      }
    }
  }
})
