import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // same-origin /ws in dev and prod: Vite proxies to the backend here,
      // Caddy does the same in production
      '/ws': { target: 'ws://localhost:8787', ws: true },
    },
  },
  optimizeDeps: {
    // big web component (CodeMirror + superdough); pre-bundling mangles it
    exclude: ['@strudel/repl'],
  },
});
