## Why

After P3, highlights exist only in memory — they vanish on reload. The product is only useful if highlights persist per document and reappear when the PDF is reopened. This is the highest-risk phase: re-anchoring a saved selection back onto a freshly rendered DOM is exactly where `jeromepl/highlighter` accumulated the most complexity and bug fixes (CSS-path serialization, robust querying fallbacks, and multiple store-format versions V3→V5). We adopt their serialization approach, persist through P1's typed/versioned storage layer, and restore highlights when the viewer reopens a document.

## What Changes

- **Serialize** each highlight to durable data: a CSS-path query to the anchor/focus nodes (with special handling for text nodes), the anchor/focus offsets, the selection string, color, a uuid, and timestamps — keyed by a stable document identity.
- **Restore** highlights on viewer load: rebuild nodes from stored queries (with a robust fallback when a selector is invalid), then re-run the P3 render engine to re-apply each highlight; record failures (lost highlights) without crashing.
- Persist through P1's `storage-layer` (namespaced key per document, `version` stamped on every record, migration seam wired).
- Define the **document key** scheme (derived from the original PDF URL carried through the viewer).
- Establish the store-format **versioning + migration** path so future format changes can upgrade old records instead of dropping them.

## Capabilities

### New Capabilities

- `highlight-anchoring`: Serializing a captured selection to a reload-stable form (CSS-path queries to anchor/focus nodes + offsets) and resolving those back to live DOM nodes on a freshly rendered document, including a robust fallback for non-standard selectors.
- `highlight-store`: Persisting, loading, and removing highlights per document through the typed storage layer, with versioned records, a migration seam, and graceful handling of highlights that can no longer be anchored.

### Modified Capabilities

<!-- None promoted to openspec/specs yet. Consumes (does not redefine) P1 storage-layer and P3 highlight-render. -->

## Impact

- Code: new `src/viewer/highlight/serialize.ts` (getQuery/elementFromQuery port), `src/viewer/highlight/persistence.ts` (save/load/remove via storage-layer), `src/viewer/highlight/restore.ts` (load-all + re-apply + lost tracking); viewer init calls restore after render.
- Storage: highlight records under a per-document namespaced key; `version` from manifest; migration seam from P1 becomes active.
- Ported code: `getQuery`/`elementFromQuery`/`robustQuerySelector` and the load/store record shape from `jeromepl/highlighter` (MIT) — attribution required.
- Downstream: P5 hover-tools delete/recolor persist through `highlight-store`; P8 popup lists from it; P9 export reads it.
