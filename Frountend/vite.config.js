import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vite.dev/config/
export default defineConfig({
  define: {
    'import.meta.env': process.env},
  plugins: [react()],
})


