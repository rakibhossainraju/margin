# Margin — Implementation Roadmap

Single source of truth for **phase order**. OpenSpec does not track cross-change
ordering or dependencies — this file does. Apply changes in the order below.

## Apply order

| # | Change (apply target) | Depends on | Status |
|---|------------------------|------------|--------|
| P1 | `architecture-foundation` | — | ☐ not started |
| P2 | `pdfjs-viewer` | P1 | ☐ not started |
| P3 | `selection-highlight-engine` | P2 | ☐ not started |
| P4 | `highlight-persistence` | P3, P1 | ☐ not started |
| P5 | `hover-tools` | P3, P4 | ☐ not started |
| P6 | `color-system` | P3, P4, P5, P1 | ☐ not started |
| P7 | `command-triggers` | P1, P3, P6 | ☐ not started |
| P8 | `popup-management` | P4, P2, P6 | ☐ not started |
| P9 | `highlight-export` | P4, P1 | ☐ not started |
| P10 | `test-release-pipeline` | all | ☐ not started |

- **v1 milestone** = P1–P4 (working, persistent PDF highlighter).
- **v2 milestone** = P5–P10.
- P5–P9 are leaves once P4 lands; reorder by priority if needed. P10 is cross-cutting (light unit tests land in P3/P4 already; e2e/CI/release consolidate here).

## Per-phase loop (the "automation")

For each phase in order:

1. `/opsx:apply <change-name>` — implement all tasks in that change.
2. `bun run build` — must pass (tsc --noEmit + both vite builds), zero type errors.
3. Manual validation from that change's `tasks.md` (load unpacked, smoke-test).
4. Commit.
5. `/opsx:archive <change-name>` — promotes its specs into `openspec/specs/` and moves the change to archive.
6. Mark the row above ☑ done, then start the next phase.

> Do NOT skip step 5. Archiving promotes each capability into `openspec/specs/`,
> which is what lets later phases reference earlier specs as real (e.g. MODIFIED
> deltas). Until archived, a capability only exists inside its pending change.

## Gate before moving on

A phase is "done" only when: build passes, its tasks.md is fully checked,
manual validation succeeded, committed, and archived. Don't start phase N+1 with
phase N un-archived — later proposals were written assuming earlier specs are promoted.

## Notes / carry-forward decisions

- v1 scope locked to spine P1–P4; P2 targets local `file://` PDFs first (web PDFs deferred).
- UI framework decided per-phase (P5 hover-tools, P8 popup).
- Attribution: jeromepl/highlighter (MIT) in ported P3/P4/P5/P6/P7/P8 files; pdf.js (Apache-2.0) NOTICE in P2.
- Highest risk: P4 re-anchoring (CSS-path vs pdf.js page+char-range). Validate the serialize port against real pdf.js spans early; may split into P4a/P4b.
