import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/lib/index.ts'),
      name: 'droppable-zone',
      formats: ['es', 'cjs'],
      fileName: (format) => `droppable-zone.${format}.js`,
    },
    rollupOptions: {
      // Do not bundle peer deps
      external: ['react', 'react-dom', 'react-redux', '@dnd-kit/core'],
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
})
