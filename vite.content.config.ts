import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Content scripts in Manifest V3 are NOT loaded as ES modules, so they cannot
// use `import`. Build the content script as a single self-contained IIFE with
// all dependencies inlined. emptyOutDir is false so this build appends to the
// dist produced by the main config instead of wiping it.
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/index.ts'),
      },
      output: {
        format: 'iife',
        entryFileNames: 'content.js',
        inlineDynamicImports: true,
      },
    },
  },
});
