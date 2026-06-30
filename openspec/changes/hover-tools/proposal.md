## Why

After v1 (P1–P4) a user can create and persist highlights, but cannot interact with one after the fact — no way to delete or recolor a specific highlight from the document itself. This phase adds an in-document **hover toolbar**: hovering a highlight surfaces a small floating tool strip (delete, change color, copy text). It adapts `jeromepl/highlighter`'s hover-tools concept but replaces its jQuery + global-CSS implementation with a modern, encapsulated component (shadow DOM / scoped styles) to avoid leaking into or inheriting from the pdf.js viewer styles.

## What Changes

- Attach hover behavior to `<margin-highlight>` elements: showing a floating toolbar anchored to the hovered highlight, hiding it on mouse-out with a small grace delay.
- Toolbar actions: **delete** (remove highlight + persist via P4 `highlight-store`), **copy** (selection text to clipboard), and a **color** entry point (opens the color choice; full palette behavior is P6).
- Render the toolbar in an encapsulated component (shadow DOM or scoped stylesheet) so its styles neither leak to nor inherit from the viewer.
- Position the toolbar correctly within the scrolling/zooming pdf.js viewer (re-anchor on scroll/zoom while visible).

## Capabilities

### New Capabilities

- `hover-tools`: A floating, encapsulated toolbar shown when hovering a highlight, offering delete, copy, and a color entry point, correctly positioned within the pdf.js viewer.

### Modified Capabilities

<!-- None promoted to openspec/specs yet. Consumes P3 highlight-render (the <margin-highlight> element) and P4 highlight-store (delete persistence). -->

## Impact

- Code: new `src/viewer/hover-tools/` (component, positioning, event wiring); event listeners attached when highlights are created (P3) and restored (P4).
- Ported concept: hover-tools UX from `jeromepl/highlighter` (MIT) — reimplemented, attribution where logic is reused.
- Dependencies: none required; UI-framework choice deferred per-phase (decide here — leaning vanilla Web Component for a single floating widget).
- Downstream: P6 plugs the color palette into the toolbar's color entry point.
