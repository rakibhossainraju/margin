import { copyFileSync, cpSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { type Plugin } from 'vite';

/**
 * Vite plugin that copies pdf.js assets (worker, cmaps, standard_fonts) to dist/ on build.
 */
export function copyPdfJsAssets(): Plugin {
  return {
    name: 'copy-pdfjs-assets',
    writeBundle() {
      const distPath = resolve(process.cwd(), 'dist');
      const pdfjsDistPath = resolve(process.cwd(), 'node_modules/pdfjs-dist');

      if (!existsSync(distPath)) {
        mkdirSync(distPath, { recursive: true });
      }

      // Copy worker
      copyFileSync(
        resolve(pdfjsDistPath, 'build/pdf.worker.min.mjs'),
        resolve(distPath, 'pdf.worker.mjs')
      );

      // Copy cmaps
      cpSync(
        resolve(pdfjsDistPath, 'cmaps'),
        resolve(distPath, 'cmaps'),
        { recursive: true }
      );

      // Copy standard_fonts
      cpSync(
        resolve(pdfjsDistPath, 'standard_fonts'),
        resolve(distPath, 'standard_fonts'),
        { recursive: true }
      );
    },
  };
}
