## Why

Highlights are trapped in `chrome.storage.local` — a user can't get them out to use in notes, share, or back up. Export/import is a clear differentiator over `jeromepl/highlighter` (which has no portable export) and turns Margin highlights into portable study/research output. This phase adds export (JSON + Markdown) and import.

## What Changes

- **Export** the current document's highlights (and optionally all documents) to:
  - **JSON** — full fidelity (records + metadata), suitable for backup/import.
  - **Markdown** — human-readable list of highlighted text (with color/heading grouping), suitable for notes.
- **Import** previously exported JSON, merging highlights into storage (with version migration via P1).
- Surface export/import from the popup (P8).

## Capabilities

### New Capabilities

- `highlight-export`: Exporting highlights to JSON (full fidelity) and Markdown (readable), and importing JSON back into the store with version migration.

### Modified Capabilities

<!-- None promoted to openspec/specs yet. Consumes P4 highlight-store (read/write), P1 storage-layer (migration on import), P8 popup-management (export/import UI entry). -->

## Impact

- Code: new `src/export/` (serializers for JSON/Markdown, import/merge); popup (P8) gains export/import controls; file download via a Blob/`URL.createObjectURL` or `chrome.downloads`.
- Permissions: possibly `downloads` (or anchor-download without it — prefer no new permission if feasible).
- Downstream: none; leaf capability.
