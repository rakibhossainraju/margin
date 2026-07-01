## 1. Dependency + build wiring

- [x] 1.1 Add `pdfjs-dist` (pinned) as a dependency
- [x] 1.2 Add a Vite entry for the viewer page (`viewer.html` + `src/viewer/index.ts`)
- [x] 1.3 Configure `GlobalWorkerOptions.workerSrc` to an extension-packaged worker via `chrome.runtime.getURL`
- [x] 1.4 Bundle/copy pdf.js worker, cmaps, and standard fonts as build outputs with stable paths
- [x] 1.5 Add viewer page + pdf.js assets to `web_accessible_resources` in the manifest

## 2. Viewer page

- [x] 2.1 Build `viewer.html` shell + `src/viewer/index.ts` entry
- [x] 2.2 Parse and validate the `?file=` parameter (decode original URL)
- [x] 2.3 Load the PDF document with pdf.js from the file URL
- [x] 2.4 Render each page: canvas visual layer + overlaid text layer (`renderTextLayer`)
- [x] 2.5 Implement scroll/paging navigation
- [x] 2.6 Implement zoom that re-renders canvas + text layer together, keeping alignment
- [x] 2.7 Detect file-access failure and show "Allow access to file URLs" guidance

## 3. Interception

- [x] 3.1 Add a `declarativeNetRequest` static rule: `file://*/*.pdf*` main-frame → `viewer.html?file=<encoded url>`
- [x] 3.2 Exclude the viewer URL and non-PDF requests to prevent redirect loops
- [x] 3.3 Add `declarativeNetRequest` permission and `file:///*` host access to the manifest

## 4. Retire native-PDF path

- [x] 4.1 Remove the `*.pdf` `content_scripts` match and native activation code from `src/content/`
- [x] 4.2 Ensure viewer uses P1 `shared/messaging` + `shared/storage` directly (first-party page, no injected content script)

## 5. Validation

- [x] 5.1 `bun run build` passes; viewer + worker assets emit to expected paths
- [x] 5.2 Load unpacked, enable file-URL access; open a local `file://…pdf` → renders in Margin viewer
- [x] 5.3 Drag-select PDF text → `getSelection().toString()` returns the text
- [x] 5.4 Confirm no remote script requests (worker loads from extension origin)
- [x] 5.5 Confirm zoom keeps text layer aligned and no redirect loop on the viewer page
- [x] 5.6 Add Apache-2.0 attribution/NOTICE for bundled pdf.js
