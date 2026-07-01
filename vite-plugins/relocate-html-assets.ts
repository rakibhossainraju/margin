import { existsSync, renameSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { type Plugin } from 'vite';

/**
 * Vite plugin that relocates compiled popup and viewer HTML files to the root of dist/ after they are written to disk.
 */
export function relocateHtmlAssets(): Plugin {
  return {
    name: 'relocate-html-assets',
    writeBundle() {
      const distPath = resolve(process.cwd(), 'dist');

      const popupSrc = resolve(distPath, 'src/entries/popup/index.html');
      const popupDest = resolve(distPath, 'popup.html');
      if (existsSync(popupSrc)) {
        renameSync(popupSrc, popupDest);
      }

      const viewerSrc = resolve(distPath, 'src/entries/viewer/viewer.html');
      const viewerDest = resolve(distPath, 'viewer.html');
      if (existsSync(viewerSrc)) {
        renameSync(viewerSrc, viewerDest);
      }

      // Cleanup empty src subdirectories
      const srcDir = resolve(distPath, 'src');
      if (existsSync(srcDir)) {
        rmSync(srcDir, { recursive: true, force: true });
      }
    },
  };
}
