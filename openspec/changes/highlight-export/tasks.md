## 1. JSON export

- [ ] 1.1 Implement JSON serializer (records + format/version header) in `src/export/json.ts`
- [ ] 1.2 Support current-document and all-documents scope

## 2. Markdown export

- [ ] 2.1 Implement Markdown serializer (per-document, ordered, color noted) in `src/export/markdown.ts`

## 3. Download

- [ ] 3.1 Trigger file download via Blob + `URL.createObjectURL` + anchor from the popup (avoid new permissions if possible)
- [ ] 3.2 Fall back to `chrome.downloads` only if anchor-download is unreliable

## 4. Import

- [ ] 4.1 Parse + validate JSON (format header + record shape) in `src/export/import.ts`
- [ ] 4.2 Run each record through the P1 migration seam
- [ ] 4.3 Merge into the per-document store, dedupe by uuid
- [ ] 4.4 Reject malformed/foreign files with a clear error; leave store unchanged

## 5. Popup wiring

- [ ] 5.1 Add export (JSON/Markdown, scope selector) controls to the popup
- [ ] 5.2 Add import control + result feedback

## 6. Validation

- [ ] 6.1 Manual: export JSON → reimport → highlights restored, no duplicates
- [ ] 6.2 Manual: export Markdown → readable list of highlighted text
- [ ] 6.3 Manual: import older-format fixture → migrated correctly
- [ ] 6.4 Manual: import malformed file → rejected, store intact
- [ ] 6.5 `bun run build` passes with no type errors
