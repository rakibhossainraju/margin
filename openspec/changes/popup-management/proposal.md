## Why

Users need an overview of and control over the highlights in the current document without scrolling the whole PDF. This phase builds the toolbar **popup**: a list of the current document's highlights with jump-to, per-item remove, and a remove-all action — managing highlights from one place. It adapts `jeromepl/highlighter`'s popup (list, show, remove, remove-all) onto Margin's typed store.

## What Changes

- Build the action **popup UI** listing the current document's highlights (text snippet + color), read from P4 `highlight-store`.
- **Jump-to**: clicking an item scrolls the viewer to that highlight.
- **Remove** a single highlight and **remove-all** for the document, persisted via P4.
- Communicate popup ↔ viewer via P1 messaging (popup → background → bridge → viewer for jump/scroll; reads via store).
- Decide the popup UI framework in-phase (per the deferred decision).

## Capabilities

### New Capabilities

- `popup-management`: A browser-action popup that lists the current document's highlights with jump-to, single remove, and remove-all, backed by the typed highlight store.

### Modified Capabilities

<!-- None promoted to openspec/specs yet. Consumes P4 highlight-store (read/remove), P1 messaging (popup↔viewer), P2 viewer (scroll-to), P6 color-system (swatch display). -->

## Impact

- Code: new/expanded `src/popup/` (list UI, actions); a viewer "scroll-to-highlight" entry on `window.marginAPI`; background routes popup requests.
- Messaging: popup → background → viewer (jump-to) via P1 bridge; remove via store.
- Ported concept: popup list/show/remove/remove-all from `jeromepl/highlighter` (MIT) — reimplemented typed.
- UI framework: decided in this phase's design (leaning vanilla/Web Components for bundle size, unless React chosen for shared components with P5/P6).
- Downstream: none in v2.
