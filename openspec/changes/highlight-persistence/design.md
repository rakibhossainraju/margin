## Context

P3 renders highlights from a capture object held in memory. P4 makes them durable. The challenge is **re-anchoring**: a stored highlight must reattach to a DOM that was re-created from scratch on the next load, where object references are gone and node positions are the only stable handle. `jeromepl/highlighter` solves this by serializing each endpoint node as a CSS-path query (`html>div:nth-of-type(2)>textNode:nth-of-type(3)`) plus its character offset, then on load resolving the query back to a node (`document.querySelector`, with a manual-walk fallback for selectors the browser rejects) and re-running the wrapping engine. Text nodes need special handling because `textNode:nth-of-type(n)` is not valid CSS. This is the most defect-prone area in their history, so we port their proven logic, type it, key it per document, and bake in versioned migration from the start (P1 already stamps `version`).

A pdf.js-specific wrinkle: the text layer is regenerated on (re)render, and pages may render lazily/virtualized (P2 open question). Restore must run after a page's text layer exists, and may need to re-apply when a page is (re)rendered, not just once at load.

## Goals / Non-Goals

**Goals:**
- Serialize a P3 capture to a reload-stable record (path queries + offsets + string + color + uuid + timestamps).
- Resolve stored queries back to live nodes after a fresh render, with a fallback for invalid selectors.
- Re-apply restored highlights via the existing P3 render engine (no second rendering implementation).
- Persist per document via P1 `storage-layer`, version-stamped, migration seam active.
- Track highlights that fail to anchor ("lost") without throwing or blocking other highlights.

**Non-Goals:**
- Hover-tools UI, delete/recolor UX (P5/P6) — P4 exposes save/remove/update primitives they call.
- Popup list / export (P8/P9) — they read this store.
- Cross-device sync — local storage only.
- Perfecting exotic-script/hyphenation anchoring — port proven logic, accept known limits.

## Decisions

### D1: CSS-path serialization with text-node special case (ported)
Port `getQuery` (element → query, with `>textNode:nth-of-type(i)` for text nodes via child index) and `elementFromQuery` (query → node, splitting off the text-node suffix and indexing `childNodes`).
- *Why:* it's the proven, dependency-free way to address a specific text node across reloads. pdf.js text-layer spans are stable enough in structure to address this way.
- *Alternatives:* store page index + glyph/character range from pdf.js text content — more pdf.js-native and possibly more robust, but a larger original design and untested for us; keep as a fallback strategy to revisit if CSS-path proves fragile on pdf.js. Range/StaticRange serialization — not persistable across reloads.

### D2: Robust query resolution with manual-walk fallback (ported)
Use `document.querySelector`; on `SyntaxError`/null from an invalid-but-real selector, fall back to manually walking `childNodes` by tag + nth-of-type.
- *Why:* mirrors highlighter's fix for real-world DOMs with invalid selectors; cheap insurance.

### D3: Restore re-uses the P3 render engine
Restore resolves nodes, reconstructs a capture-equivalent object, and calls the P3 wrapper. No parallel rendering code.
- *Why:* one rendering path = one place for bugs; restored and freshly-created highlights look/behave identically.

### D4: Per-document storage key + versioned records
`docKey` derived from the original PDF URL (carried via P2 `?file=`). Records stored as a list under `highlights:<docKey>`; each record carries `version`. Reads pass through the P1 migration seam.
- *Why:* highlights belong to a document; the native URL is the stable identity. Versioning now avoids a painful retrofit (highlighter shipped V3/V4/V5).
- *Decision on docKey:* normalize the URL (decode, strip volatile query/hash) before keying; final exact rule fixed in tasks. Avoid raw unnormalized URLs to reduce key drift.

### D5: Lost-highlight tracking, non-fatal
If a record can't be anchored (nodes missing, mismatch), skip it, record it as "lost," and continue. Never let one bad record block the rest.
- *Why:* documents and pdf.js output change; partial restore beats total failure. Surfacing lost highlights is a later UI concern (P5/P8).

### D6: Restore timing tied to text-layer availability
Run restore per page after its text layer renders; re-apply on re-render (zoom) rather than assuming a single load-time pass.
- *Why:* pdf.js regenerates the text layer; a one-shot restore would lose highlights after the first zoom/scroll re-render.

## Risks / Trade-offs

- [pdf.js text-layer structure differs from HTML DOM, breaking CSS-path anchoring] → validate the getQuery/elementFromQuery port specifically against pdf.js spans early; if fragile, switch to the D1-alternative page+character-range strategy. Flag as the phase's primary risk.
- [Text-layer re-render drops applied highlights] → D6 re-applies on render; keep the in-memory registry from P3 as the live source and storage as durable backing.
- [Offsets invalidated by `splitText` from a prior highlight on the same node] → restore in a deterministic order; re-derive offsets against current node state (highlighter counts chars rather than trusting offsets blindly) — port that char-counting safeguard.
- [docKey drift (same PDF, different URL spelling)] → normalize URL before keying; document the rule; accept that moved files get a new key.
- [Storage growth / quota for highlight-heavy docs] → records are small text; monitor; `chrome.storage.local` quota is ample for v1.
- [Migration bugs silently dropping data] → migration seam must be covered by tests with a fixture of an older record shape before any format bump.

## Migration Plan

Additive; first real persisted data. Steps: (1) port serialize (getQuery/elementFromQuery/robustQuerySelector) with tests; (2) define record shape + docKey normalization + storage save/load/remove via P1 layer; (3) restore-all + re-apply via P3 engine + lost tracking; (4) wire restore into viewer render lifecycle (per-page, on re-render); (5) activate version/migration seam with a no-op current migration + a test fixture. Rollback = revert; since this introduces the first persisted records, a revert simply leaves orphan storage entries (harmless, namespaced). No destructive migration.

## Open Questions

- CSS-path vs pdf.js page+character-range as the primary anchoring strategy — start with the ported CSS-path; switch if early pdf.js validation shows fragility.
- Exact docKey normalization rule (which URL parts to strip) — finalize in tasks against real file:// URLs.
- Whether to split this change into P4a (serialize/store) and P4b (restore/migration) if implementation grows — decide after the serialize port lands; the spec is written so the split is clean.
- Eager vs virtualized rendering (inherited P2 question) directly affects restore timing — align with whatever P2 ships.
