import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { type Plugin } from 'vite';

/**
 * Vite plugin that watches public/manifest.json and copies it to dist/manifest.json on updates.
 */
export function watchPublicManifest(): Plugin {
  return {
    name: 'watch-public-manifest',
    buildStart() {
      const manifestPath = resolve(process.cwd(), 'public/manifest.json');
      this.addWatchFile(manifestPath);
    },
    writeBundle() {
      const manifestPath = resolve(process.cwd(), 'public/manifest.json');
      const distManifestPath = resolve(process.cwd(), 'dist/manifest.json');
      copyFileSync(manifestPath, distManifestPath);
    },
  };
}
