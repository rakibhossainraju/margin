## Context

After P1 (typed messaging + storage skeleton), Margin needs a surface where PDF text is actually selectable. The native PDFium viewer exposes nothing. `pdf.js` renders each page to a canvas plus an absolutely-positioned, transparent **text layer** of real DOM spans — selection, `getSelection()`, and DOM wrapping all work there. This phase stands up that viewer and routes local PDFs into it. Constraints: MV3 forbids remote code, so pdf.js (incl. its worker) must be bundled and served from the extension origin; `file://` interception is more restricted than `http(s)` and needs explicit user opt-in ("Allow access to file URLs").

## Goals / Non-Goals

**Goals:**
- Open a `file://…pdf` and have it render in Margin's viewer with selectable text.
- Bundle pdf.js + worker + cmaps fully offline (no CDN, MV3-compliant).
- Preserve the original file URL so later phases can key storage by document.
- Run viewer logic as a first-party extension page (uses P1 messaging/storage directly).

**Non-Goals:**
- Web `http(s)` PDF interception (deferred; P2 is file:// first).
- Selection capture, highlight rendering, persistence (P3/P4).
- Full-featured viewer parity with Chrome (print, rotate, annotations toolbar) — only scroll/page + zoom needed to validate selection.
- Viewer theming/UI polish.

## Decisions

### D1: Bundle `pdfjs-dist`, serve worker from extension origin
Import `pdfjs-dist`; configure `GlobalWorkerOptions.workerSrc` to an extension-packaged worker file (`chrome.runtime.getURL`). Bundle cmaps/standard fonts as web-accessible assets.
- *Why:* MV3 bans remote script; the worker must load from `chrome-extension://`. CDN workerSrc would violate CSP.
- *Alternatives:* `pdf.js` prebuilt viewer (the full Mozilla `web/viewer.html`) — heavier, harder to hook our highlight engine into; we want a minimal viewer we control. Rejected for v1, but we mirror its text-layer approach.

### D2: Render canvas + text layer per page
For each page: render to canvas for visuals, and build the text layer via pdf.js `TextLayer`/`renderTextLayer` so transparent positioned spans overlay the canvas.
- *Why:* the text layer is the entire point — it's where selection and (P3) highlight wrapping happen. Canvas alone gives no selectable text.
- *Trade-off:* text layer alignment depends on correct viewport scaling; zoom must re-render both layers consistently.

### D3: Intercept local PDFs with declarativeNetRequest static redirect
Static DNR rule: match `file://*/*.pdf*` main-frame navigations → redirect to `viewer.html?file=<encoded original url>`.
- *Why:* DNR is the MV3-sanctioned, listener-free way to redirect navigations; no blocking webRequest. Static rules ship in the manifest.
- *Trade-off:* `file://` rules only fire when "Allow access to file URLs" is enabled; we must detect/guide the user. Some non-`.pdf`-suffixed PDFs won't match — acceptable for v1 (mirrors current content-script match heuristic).
- *Alternatives:* `chrome.webNavigation` + `tabs.update` redirect — needs a listener + extra permission, races the load; `webRequest` blocking — not allowed in MV3.

### D4: Viewer is a first-party page, not a content script
Highlight/selection logic lives in the viewer page bundle, which can `import` P1's `shared/messaging` + `shared/storage` directly and talk to the background via the typed protocol — no injected content script into the PDF.
- *Why:* removes the whole content-script-injection-into-PDF problem class; the viewer is our DOM.
- *Consequence:* the `*.pdf` `content_scripts` entry is removed; P1's `window.marginAPI` bridge is still used where the background needs to invoke the viewer (e.g. command-triggered highlight in P3).

### D5: Document identity = original file URL
Carry the original URL through `?file=`; derive the storage `docKey` from it (finalized in P4). Viewer decodes and validates it before fetching.
- *Why:* P4 keys highlights per document; the native URL is the stable identity.

## Risks / Trade-offs

- [File-URL access disabled by default] → on viewer load without file access, detect the failed fetch and show guidance to enable "Allow access to file URLs"; document in onboarding.
- [pdf.js worker/cmap paths break under Vite bundling] → pin asset paths via `chrome.runtime.getURL`, add them to `web_accessible_resources`, and verify in a loaded-unpacked smoke test (not just dev server).
- [Text-layer misalignment at zoom levels] → single source of truth for viewport scale; re-render canvas + text layer together; cover with a manual zoom check.
- [Large PDFs cause memory/lag from rendering all pages] → render visible pages (virtualize) or lazy-render on scroll; v1 may render eagerly with a page cap, optimize later.
- [DNR redirect loops] → exclude the viewer's own URL and non-`.pdf` requests from the rule; test that `viewer.html?file=` does not re-match.
- [pdf.js version/API churn] → pin `pdfjs-dist`; isolate pdf.js calls behind a thin viewer module so upgrades touch one place.

## Migration Plan

Additive + one removal. Steps: (1) add `pdfjs-dist`, wire Vite viewer entry + worker/cmap assets; (2) build minimal viewer (render + text layer + zoom/scroll); (3) add DNR static rule + permissions + `web_accessible_resources`; (4) remove `*.pdf` content-script match and native activation code. Rollback = revert; no persisted data yet. No user data migration.

## Open Questions

- Eager vs virtualized page rendering for v1 — start eager with a page cap, revisit if large PDFs lag.
- Exact `docKey` derivation (raw URL vs normalized/hashed) — settle in P4; P2 only needs to pass the original URL through intact.
- Whether to also handle `file://` PDFs opened via the extension action (open-file picker) in this phase or defer — leaning defer; interception-on-navigation covers the primary flow.
