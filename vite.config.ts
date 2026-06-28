import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Multi-input Rollup config (no CRXJS) so each extension entry compiles to a
// stable, predictable output path that manifest.json can reference directly.
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        popup: resolve(__dirname, 'src/popup/index.html'),
      },
      output: {
        // Keep entry filenames deterministic (no hash) for the manifest.
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
