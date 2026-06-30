## Context

P3 renders highlights as `<margin-highlight>` custom elements; P4 persists them. Users need to act on an existing highlight without leaving the document. `jeromepl/highlighter` does this with a hover toolbar (`hoverTools`) built on jQuery and a global stylesheet injected into the page. In Margin the host is our own pdf.js viewer, but pdf.js owns a lot of layout/styling and re-renders the text layer on zoom/scroll, so the toolbar must be style-encapsulated and re-positionable. UI-framework choice was deferred to per-phase; for a single floating widget a dependency-free Web Component is the lightest fit.

## Goals / Non-Goals

**Goals:**
- Show a toolbar when a highlight is hovered; hide on mouse-out with a grace delay so the user can move into the toolbar.
- Actions: delete (persisted), copy text, color entry point (palette behavior in P6).
- Encapsulated styling (shadow DOM / scoped sheet) — no leak to or inheritance from viewer.
- Correct positioning that survives viewer scroll/zoom while the toolbar is visible.

**Non-Goals:**
- The color palette/selection itself (P6) — P5 only exposes the entry point.
- Keyboard/context-menu triggers (P7).
- Popup management list (P8).
- Multi-select / bulk actions.

## Decisions

### D1: Vanilla Web Component for the toolbar
Implement the toolbar as a custom element with a shadow root; one singleton instance reused, repositioned per hovered highlight.
- *Why:* single floating widget doesn't justify a framework runtime; shadow DOM gives free style isolation from pdf.js.
- *Alternatives:* React/Preact island — heavier for one widget; revisit if P8 popup picks a framework and sharing components becomes worthwhile.

### D2: Event delegation on the highlight container, not per-element listeners
Attach `mouseover`/`mouseout` on the page/highlight container and detect `<margin-highlight>` targets, rather than binding listeners to every highlight (highlighter bound per-element).
- *Why:* highlights are created and restored continuously (P3/P4 re-apply on re-render); delegation avoids re-binding on every re-render and leaks.

### D3: Position with a grace-delay hide + re-anchor on scroll/zoom
On hover, position the toolbar relative to the highlight's bounding rect; keep it open while pointer is over highlight or toolbar; hide after a short timeout otherwise. Re-anchor on viewer scroll/zoom while visible.
- *Why:* pdf.js scrolls/zooms; a statically-placed toolbar would detach. Grace delay is standard hover-menu UX.

### D4: Delete goes through P4, copy through Clipboard API
Delete calls P4 `highlight-store` remove (DOM unwrap + storage delete). Copy uses `navigator.clipboard.writeText` with the highlight's stored string.
- *Why:* one persistence path (P4); no duplicate storage logic in the UI.

## Risks / Trade-offs

- [Toolbar detaches/misaligns on zoom or scroll] → re-anchor on scroll/zoom events while visible; recompute from live bounding rect, not cached coordinates.
- [Hover flicker between highlight and toolbar] → grace-delay hide + treat toolbar hover as keeping it open.
- [Re-render (P3/P4) replaces highlight DOM, orphaning listeners] → delegation (D2) means listeners live on the container, not the highlights, so re-render is safe.
- [Shadow DOM blocks needed inherited fonts/icons] → ship the toolbar's own minimal styles/icons inside the shadow root; don't rely on page inheritance.
- [Clipboard API requires user gesture/permission] → triggered by a click (gesture present); handle rejection gracefully.

## Migration Plan

Additive. Steps: (1) toolbar Web Component + scoped styles; (2) delegation + positioning + grace-delay; (3) wire delete (P4) and copy; (4) stub color entry point for P6. Rollback = revert; no data changes.

## Open Questions

- Final visual design/iconography — defer to a design pass; v1 of the toolbar can be minimal.
- Whether the color entry point opens inline in the toolbar or a separate popover — decide with P6.
