import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

// vite build --watch only re-runs on changes to modules in the Rollup graph;
// publicDir is copied once at startup, so manifest.json edits need this to
// trigger a watch event and re-copy into dist.
function watchPublicManifest(): Plugin {
  const manifestPath = resolve(__dirname, 'public/manifest.json');
  return {
    name: 'watch-public-manifest',
    buildStart() {
      this.addWatchFile(manifestPath);
    },
    writeBundle() {
      copyFileSync(manifestPath, resolve(__dirname, 'dist/manifest.json'));
    },
  };
}

// Multi-input Rollup config (no CRXJS) so each extension entry compiles to a
// stable, predictable output path that manifest.json can reference directly.
export default defineConfig({
  plugins: [watchPublicManifest()],
  build: {
    outDir: 'dist',
    // Don't wipe dist on each (re)build: in `dev` two watchers write to the
    // same dist in parallel, so emptying here would delete the sibling's
    // content.js. The build script cleans dist once up front instead.
    emptyOutDir: false,
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/index.ts'),
        popup: resolve(__dirname, 'src/popup/index.html'),
        // NOTE: content script is built separately via vite.content.config.ts
        // as a self-contained IIFE — MV3 content scripts are not ES modules,
        // so they must not be code-split here.
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
