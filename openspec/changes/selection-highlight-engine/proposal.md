## Why

With the pdf.js viewer (P2) producing a real DOM text layer, the user can now *select* PDF text — but nothing happens with it. This phase delivers the core highlighting engine: turn the current selection into a visible, persistent-looking highlight in the DOM. This is the heart of the product and the part most directly adapted from the MIT-licensed `jeromepl/highlighter` engine, ported to TypeScript and modernized (custom element + scoped styles instead of jQuery + global CSS). Highlights are in-memory only here; saving and reload-restore are P4.

## What Changes

- Add a **selection capture** module: read `window.getSelection()` in the viewer text layer, normalize it, and reject empty/collapsed selections.
- Port the **recursive text-node wrapper** (highlighter's `_recursiveWrapper`) to TypeScript: walk the common-ancestor container, match the selection string across text nodes with whitespace tolerance, and `splitText`-wrap the exact range.
- Render each highlight as a custom element (`<margin-highlight>`) carrying an id and color, styled via scoped CSS (not global jQuery-era styles).
- Expose highlight creation through P1's typed contract: a `highlight.create` method on `window.marginAPI`, invokable both in-page and via the background `executeScript` bridge.
- Provide in-memory highlight removal (by id) to support iteration; durable storage is P4.

## Capabilities

### New Capabilities

- `selection-capture`: Reading and normalizing the user's text selection within the viewer, producing the data the highlight engine needs (selection string, anchor/focus nodes + offsets, common-ancestor container).
- `highlight-render`: Wrapping a captured selection's text nodes into styled `<margin-highlight>` custom elements (whitespace-tolerant matching, exact-range `splitText`), and removing them by id.

### Modified Capabilities

<!-- None. The `window.marginAPI` extension (`highlight.create`/`highlight.remove`) is specified under `highlight-render` rather than as a delta on `messaging-protocol`, which is not yet promoted to openspec/specs. -->

## Impact

- Code: new `src/viewer/highlight/` (capture, recursive wrapper, render, remove), `src/viewer/highlight/custom-element.ts` (`<margin-highlight>` definition + scoped styles); extend the content/viewer `window.marginAPI` implementation and its shared type.
- Dependencies: none new (pure DOM/TS).
- Ported code: `_recursiveWrapper` logic from `jeromepl/highlighter` (MIT) — attribution required.
- Downstream: P4 serializes/restores exactly these highlights; P5 attaches hover tools to `<margin-highlight>`; P6 sets its color.
