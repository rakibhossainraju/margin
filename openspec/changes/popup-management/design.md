## Context

P4 stores highlights per document; P2 viewer can scroll. Users want a single panel to see and manage a document's highlights. `jeromepl/highlighter`'s popup lists highlights and supports show (scroll-to), remove, and remove-all. Margin's popup reads the typed store and drives the viewer via the P1 bridge. The popup runs in its own page context (browser action), so it reaches the viewer through background messaging, not directly.

## Goals / Non-Goals

**Goals:**
- List the current document's highlights (snippet + color) from P4.
- Jump-to: scroll the viewer to a chosen highlight.
- Remove one; remove-all for the document; both persisted.
- Reflect changes (made in popup or viewer) consistently.

**Non-Goals:**
- Cross-document / global highlight browser (only current document in v2).
- Editing highlight text; recolor lives in viewer (P6) — popup may link to it later.
- Search/filter (possible later).

## Decisions

### D1: Determine current document, then read its store
Popup resolves the active tab's document (the viewer's `?file=` → docKey), then loads highlights for that docKey from P4.
- *Why:* popup is document-scoped (matches highlighter's per-page list); docKey is the join key.
- *Alternative:* show all documents — larger scope, deferred.

### D2: Jump-to via background → bridge → viewer
Clicking an item sends a message to background, which uses the executeScript bridge to call a viewer `scrollToHighlight(id)` on `window.marginAPI`.
- *Why:* popup can't touch the viewer DOM directly; reuse the P1 bridge.
- *Add:* a `highlight.scrollTo(id)` method to `window.marginAPI` (viewer side).

### D3: Remove/remove-all through P4, with viewer sync
Removes go through P4 store; the viewer updates its in-document highlights (either via a store-change notification or a bridge call to unwrap).
- *Why:* one persistence path; keep viewer DOM and store consistent.
- *Decision:* use a storage-change listener in the viewer (`chrome.storage.onChanged`) so popup-driven removes reflect live without bespoke messaging.

### D4: UI framework decided here
Pick the popup framework now (deferred decision). Default: vanilla TS + Web Components for minimal bundle; choose React/Preact only if component reuse with P5/P6 justifies the runtime.
- *Why:* the per-phase deferral lands here since this is the largest UI surface.

## Risks / Trade-offs

- [Popup and viewer state drift on edits] → use `chrome.storage.onChanged` as the sync channel so both react to the same source of truth.
- [Jump-to fails if highlight is lost/unanchored] → indicate lost highlights in the list (P4 tracks them); jump is a no-op with feedback.
- [No active viewer tab when popup opens] → show an empty/“open a PDF” state instead of erroring.
- [Large highlight counts] → virtualize/paginate the list if needed; v1 renders all with a reasonable cap.

## Migration Plan

Additive. Steps: (1) popup resolves docKey + reads P4; (2) render list (snippet + color); (3) add `highlight.scrollTo` to viewer API + jump-to via bridge; (4) remove/remove-all via P4 + viewer sync through `storage.onChanged`; (5) empty/lost states. Rollback = revert; no data changes.

## Open Questions

- Final UI framework (vanilla vs Preact/React) — decide at implementation start of this phase.
- Whether to add search/filter and color grouping now or later — default later.
