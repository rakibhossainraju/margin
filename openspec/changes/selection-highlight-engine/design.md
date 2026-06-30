## Context

P2 gives a pdf.js text layer: absolutely-positioned transparent spans over each page canvas, where `window.getSelection()` works. P3 turns a selection into a rendered highlight. The proven algorithm is `jeromepl/highlighter`'s `_recursiveWrapper`: rather than naive `Range.surroundContents` (which breaks on selections spanning multiple elements), it walks the common-ancestor container, finds the anchor/focus text node + offset, then advances through text nodes matching the selection string character-by-character (tolerating whitespace differences) and wraps the exact matched range with `splitText`. We port that to TS and swap its `<span>`/jQuery/global-CSS for a `<margin-highlight>` custom element with scoped styles. Constraint: pdf.js may re-render the text layer (zoom, re-paint), so highlights must be re-applicable from data — but that restore path is P4; P3 keeps highlights in memory and re-render coordination minimal.

## Goals / Non-Goals

**Goals:**
- Capture a non-empty selection in the viewer and produce a normalized capture object (string, anchorNode, anchorOffset, focusNode, focusOffset, container).
- Wrap the selection into one or more `<margin-highlight>` elements covering exactly the selected text, robust to multi-node / partial-node selections.
- Tolerate whitespace mismatches between the selection string and text-node content (pdf.js text layers are whitespace-noisy).
- Remove a highlight by id (in-memory), restoring the original text nodes.
- Make `highlight.create`/`highlight.remove` callable both in-page and via the P1 bridge.

**Non-Goals:**
- Persistence / serialization / reload restore (P4).
- Hover tools, delete UI, color picker (P5/P6).
- Re-applying highlights after pdf.js re-renders a page's text layer (depends on P4's data model) — P3 may simply re-highlight from in-memory records on demand, full robustness deferred.
- Cross-frame highlighting (viewer is a single first-party page).

## Decisions

### D1: Port `_recursiveWrapper`, don't use Range.surroundContents
Adapt highlighter's recursive walk + char-matching algorithm to TS with explicit types.
- *Why:* `surroundContents` throws on selections that cross element boundaries (the common case across pdf.js spans/lines). The recursive matcher handles partial and multi-node ranges and is battle-tested.
- *Alternatives:* CSS Custom Highlight API (`::highlight()`) — promising, no DOM mutation, but styling/per-highlight interaction (hover tools in P5) is weaker and browser support/control is limited; revisit later. The DOM-wrapping approach is what the rest of the roadmap (P5 hover, P6 color) is built around.

### D2: Whitespace-tolerant character matching
While matching the selection string against text-node content, skip/normalize whitespace on both sides (port highlighter's logic). On a non-whitespace mismatch, abort that highlight (it's unanchorable).
- *Why:* pdf.js text layers insert/merge whitespace inconsistently vs the `selection.toString()` value; strict matching would fail constantly.

### D3: `<margin-highlight>` custom element + scoped styles
Define a custom element carrying `data-highlight-id` and a color; style via a constructable stylesheet / scoped CSS rather than global rules or inline jQuery.
- *Why:* custom element avoids collisions with page `<span>` styling (the reason highlighter moved to `highlighter-span` in V5) and gives a clean hook for P5 hover listeners and P6 color updates.
- *Trade-off:* must register the element once before use; ensure idempotent registration.

### D4: API methods on `window.marginAPI`
Extend the P1-exposed API with `highlight.create(opts)` and `highlight.remove(id)`. Background commands (P7) and in-page triggers both go through these.
- *Why:* single invocation surface; keeps the P1 bridge as the one background→page path.

### D5: In-memory highlight registry keyed by id
Maintain a viewer-scoped map of `id → capture data` so removal can find and unwrap, and so P4 can later persist the same records.
- *Why:* gives P4 a ready-made record shape and lets P3 validate create/remove without storage.

## Risks / Trade-offs

- [pdf.js re-renders text layer on zoom/scroll, dropping injected highlight DOM] → P3 keeps an in-memory registry and can re-apply on re-render; full restore correctness is owned by P4's serialization. Document the seam clearly so P4 closes it.
- [Whitespace matcher edge cases (ligatures, hyphenation, RTL)] → port highlighter's proven logic first; add targeted unit tests around the matcher (highest-risk function); treat exotic scripts as known-limitation for v1.
- [`splitText` mutations corrupt the text layer's positioning] → wrap only within existing text nodes, normalize on removal to undo splits; verify selection still works after create+remove.
- [Custom element double-registration throws] → guard registration; define once at module load.
- [Selection spanning page boundaries (two page containers)] → v1 may restrict a highlight to a single page container; cross-page selections handled later or split per page.

## Migration Plan

Additive. Steps: (1) selection capture + normalization; (2) port recursive wrapper + matcher to TS with tests; (3) define `<margin-highlight>` element + scoped styles; (4) render path create/remove + in-memory registry; (5) wire `highlight.create/remove` onto `window.marginAPI`. Rollback = revert; no persisted state. No data migration.

## Open Questions

- CSS Custom Highlight API vs DOM wrapping — committing to DOM wrapping for v1 (needed by P5/P6); reconsider only if DOM mutation proves to fight pdf.js re-renders badly.
- Whether P3 re-applies highlights on text-layer re-render, or defers all restore to P4 — leaning minimal in P3 (in-memory re-apply on demand), authoritative restore in P4.
- Single-page vs cross-page selection scope for v1 — default single-page container; revisit if needed.
