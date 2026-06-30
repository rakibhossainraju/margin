## 1. Serialization (ported)

- [ ] 1.1 Port `getQuery` (element/text-node → CSS-path query) to TS in `src/viewer/highlight/serialize.ts`
- [ ] 1.2 Port `elementFromQuery` (query → node, text-node suffix handling) to TS
- [ ] 1.3 Port `robustQuerySelector` fallback (manual childNodes walk on invalid selector)
- [ ] 1.4 Add MIT attribution header crediting jeromepl/highlighter
- [ ] 1.5 Validate getQuery/elementFromQuery against real pdf.js text-layer spans early (primary risk check)

## 2. Record shape + document key

- [ ] 2.1 Define the highlight record type (queries, offsets, string, color, uuid, timestamps, version)
- [ ] 2.2 Implement docKey derivation from the original PDF URL (normalize: decode, strip volatile query/hash)
- [ ] 2.3 Define the namespaced storage key (`highlights:<docKey>`)

## 3. Persistence via storage-layer

- [ ] 3.1 Implement save (append record under docKey) in `src/viewer/highlight/persistence.ts`
- [ ] 3.2 Implement load-all for a docKey
- [ ] 3.3 Implement remove-by-id and update (color) persistence
- [ ] 3.4 Stamp `version` on save; route reads through the P1 migration seam

## 4. Restore

- [ ] 4.1 Implement restore: resolve queries → reconstruct capture → re-apply via the P3 render engine in `src/viewer/highlight/restore.ts`
- [ ] 4.2 Port the char-counting safeguard so offsets survive prior `splitText` mutations
- [ ] 4.3 Track unanchorable records as "lost"; never throw or block remaining highlights
- [ ] 4.4 Wire restore into the viewer render lifecycle: per-page after text-layer render, and re-apply on re-render (zoom)

## 5. Versioning + migration

- [ ] 5.1 Implement the current no-op migration and the version-bump dispatch
- [ ] 5.2 Add a test fixture of an older-shaped record and assert it migrates correctly

## 6. Tests + validation

- [ ] 6.1 Unit-test serialize/resolve round-trip on representative DOM (incl. text nodes + invalid-selector fallback)
- [ ] 6.2 Unit-test migration seam with the older-record fixture
- [ ] 6.3 Manual: highlight a PDF, reload → highlights reappear over correct text
- [ ] 6.4 Manual: zoom → highlights re-apply and stay aligned
- [ ] 6.5 Manual: remove + recolor persist across reload
- [ ] 6.6 Manual: corrupt/unanchorable record is skipped, others restore
- [ ] 6.7 `bun run build` passes with no type errors
