import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // Base path for GitHub Pages project site: https://vladislav-cheremisin.github.io/snake-arcade/
  base: '/snake-arcade/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/shared/test/setup.ts',
  },
})
