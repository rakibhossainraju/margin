## Why

Chrome's native PDF viewer (PDFium) renders PDFs inside a sealed plugin: no DOM text nodes, no working `window.getSelection()`, and no extension API to read the selection. The previous phase confirmed this is a hard wall — Margin cannot read selected PDF text through the native viewer. The only viable path (used by every DOM-based PDF tool) is to stop using the native viewer and render PDFs ourselves with Mozilla `pdf.js`, which produces a real DOM **text layer** where selection works exactly like an HTML page. This phase delivers that viewer for **local `file://` PDFs** (the current primary use case); web `http(s)` PDF support is deferred.

## What Changes

- Add `pdf.js` as a bundled dependency and build it into the extension (Vite entry, web-accessible).
- Create an extension-owned **viewer page** (`viewer/viewer.html` + `viewer/index.ts`) that loads a PDF by URL and renders pages with a selectable text layer.
- **Intercept local PDF navigations**: redirect `file://…*.pdf` loads to the viewer page (`?file=<original-url>`) via `declarativeNetRequest` (static rules).
- Add required permissions: `declarativeNetRequest`, file-URL host access, and `web_accessible_resources` for the viewer + pdf.js assets. The extension must be granted "Allow access to file URLs".
- Retire the native-PDF content-script approach: the `content_scripts` match on `*.pdf` is replaced by logic running **inside** the viewer page (which is first-party, so it uses the P1 messaging/storage directly rather than injected content scripts).
- No highlighting yet — selection becomes *possible* here; capture/render is P3.

## Capabilities

### New Capabilities

- `pdf-viewer`: An extension-owned pdf.js viewer page that renders a PDF from a given URL with a selectable DOM text layer, basic navigation (scroll/page), and zoom.
- `pdf-interception`: Redirection of local `file://` PDF document loads to the Margin viewer page, preserving the original file URL.

### Modified Capabilities

<!-- None promoted to openspec/specs yet. This supersedes the native-PDF content-script activation from the original scaffold. -->

## Impact

- Code: new `src/viewer/` (viewer page, render loop, pdf.js worker wiring); removal of native-PDF `content/` activation; `public/manifest.json` (permissions, `web_accessible_resources`, declarativeNetRequest rules, drop `*.pdf` content-script match).
- Dependencies: `pdfjs-dist` (Mozilla, Apache-2.0).
- Build: Vite must emit the viewer HTML/JS and copy/serve the pdf.js worker + cmaps as web-accessible assets with stable paths.
- Permissions: `declarativeNetRequest`, `file:///*` host access; user must enable "Allow access to file URLs".
- Downstream: P3 (selection capture + highlight render) and P4 (persistence) run inside this viewer's text layer.
