import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// On GitHub Pages the app is served from https://<user>.github.io/<repo>/,
// so production assets must be served from the "/customfy/" sub-path.
// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/customfy/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}))
