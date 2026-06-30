## Context

P4 holds highlight records keyed per document; P8 gives a popup surface. Users want their highlights out (notes/backup) and back in (restore/migrate machines). Two export shapes serve two needs: JSON for lossless round-trip, Markdown for human consumption. Import must tolerate older exports via the P1 migration seam.

## Goals / Non-Goals

**Goals:**
- Export current document (and optionally all documents) to JSON and Markdown.
- JSON is a faithful, re-importable representation.
- Markdown is readable: highlighted text grouped sensibly (by document/color/order).
- Import JSON, migrate old records, merge without clobbering unrelated data.
- Trigger from the popup; download as a file.

**Non-Goals:**
- Cloud sync / accounts.
- PDF re-embedding of highlights (writing into the PDF file) — out of scope.
- Importing Markdown (lossy) — JSON is the round-trip format.

## Decisions

### D1: Two serializers — JSON (lossless) and Markdown (readable)
JSON mirrors stored records + a format header (export version, source). Markdown renders text lines grouped by document and color.
- *Why:* distinct use cases; JSON for backup/import, Markdown for notes. Matches common annotation-tool exports.

### D2: Import merges, never blind-overwrites; migrates via P1
Import parses JSON, runs each record through the P1 migration seam, then merges into the per-document store (dedupe by uuid).
- *Why:* protects existing highlights; uuid (from P4) gives a dedupe key; migration keeps old exports usable.
- *Alternative:* replace-all on import — destructive; offer only as an explicit option later.

### D3: Download without new permissions if possible
Use a Blob + `URL.createObjectURL` + anchor download from the popup; use `chrome.downloads` only if anchor-download proves unreliable.
- *Why:* minimize permission footprint.

### D4: Scope selector — current document vs all
Default export = current document; offer "all documents" as an option.
- *Why:* current-doc is the common case; all-docs serves backup.

## Risks / Trade-offs

- [Importing a malformed/foreign JSON] → validate the format header + record shape; reject with a clear error rather than corrupting the store.
- [Duplicate import creates duplicates] → dedupe by uuid; skip existing.
- [Version drift between export and current format] → run imports through the migration seam; fail loudly if a record can't be migrated.
- [Large exports] → stream/format efficiently; acceptable for v2 sizes (text records).
- [Markdown can't round-trip] → documented; JSON is the import format, Markdown is one-way.

## Migration Plan

Additive. Steps: (1) JSON serializer + format header; (2) Markdown serializer; (3) download wiring from popup; (4) import: parse → validate → migrate → merge/dedupe; (5) scope selector (current/all). Rollback = revert; export is read-only, import is additive/deduped. No destructive migration.

## Open Questions

- Markdown grouping/format details (by color? by page? include source URL?) — settle at implementation; start simple (per-document, ordered, color noted).
- Whether to offer a destructive "replace on import" option — defer unless requested.
