import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: { ignored: ['**/qa/s1-phase1/edge-profile/**'] },
  },
  build: {
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        s1Preview: fileURLToPath(new URL('./s1-preview.html', import.meta.url)),
      },
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
})
