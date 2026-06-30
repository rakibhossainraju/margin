## Context

Margin's correctness concentrates in two units: P3's whitespace-tolerant text matcher and P4's CSS-path serialize/resolve + migration. These are pure-ish DOM/string functions — ideal for fast unit tests. The integrated behavior (interception → render → select → persist → restore) needs a real browser; `jeromepl/highlighter` already uses Playwright for exactly this. The repo has Bun + Vite + an existing `playwright.config.js` reference in the highlighter clone we can model on. This phase adds the safety net and a repeatable release.

## Goals / Non-Goals

**Goals:**
- Fast unit tests for the matcher and serialize/resolve/migration units.
- Playwright e2e loading the built unpacked extension, covering: PDF opens in viewer, select+highlight, reload restores, remove, export/import round-trip.
- CI running lint + typecheck + unit + build on every push/PR.
- A release script producing a versioned, validated, store-ready zip.

**Non-Goals:**
- 100% coverage; target the high-risk surface, not getters/UI glue.
- Publishing automation to the Chrome Web Store (manual upload of the artifact for now).
- Visual regression testing.

## Decisions

### D1: Unit runner — Bun test first
Use Bun's built-in test runner (already on Bun); add a DOM environment (jsdom/happy-dom) for the matcher/serialize tests.
- *Why:* zero extra runner dependency; fast. 
- *Alternative:* Vitest — richer ecosystem/Vite integration; switch if Bun test's DOM story is insufficient for the serialize tests.

### D2: Playwright with a built unpacked extension
e2e loads `dist/` as an unpacked extension in a persistent Chromium context (with file-URL access enabled), opens a fixture PDF, and asserts DOM/storage outcomes.
- *Why:* MV3 + native-PDF override can only be validated in a real browser; mirrors highlighter's approach.
- *Trade-off:* extension e2e is slower/flakier; keep a small, high-value flow set and run unit tests as the fast gate.

### D3: CI tiers
PR/push gate = lint + typecheck + unit + build (fast). e2e on a separate/heavier trigger (label, nightly, or pre-release) to avoid flaky blocking.
- *Why:* fast feedback on every change; reserve slow browser tests for when they matter.

### D4: Release script from dist
Script: clean → build → validate manifest/version → zip `dist` to `releases/margin-<version>.zip`.
- *Why:* repeatable, store-ready artifact; mirrors highlighter's `scripts/release.js`.

## Risks / Trade-offs

- [Extension e2e flakiness] → minimal stable flow set, retries, deterministic fixtures; keep unit tests as the real gate.
- [File-URL access in CI headless] → use a persistent context with the flag; if infeasible, cover file:// interception via a web-PDF fixture or mock and test viewer logic directly.
- [pdf.js render timing in e2e] → wait on text-layer presence, not fixed timeouts.
- [Bun test DOM gaps for serialize tests] → fall back to Vitest+jsdom for those specs if needed (D1 escape hatch).
- [Release zip includes dev cruft] → build from clean `dist` only; verify zip contents.

## Migration Plan

Additive, cross-cutting. Steps: (1) unit runner + matcher/serialize/migration tests; (2) Playwright config + core e2e flows with fixtures; (3) CI workflow (fast gate + e2e trigger); (4) release/package script + manifest validation. Earlier phases should land light unit tests as they go (P3/P4 tasks already include unit tests); this phase consolidates and adds e2e + CI + release. Rollback = revert; no product impact.

## Open Questions

- Bun test vs Vitest for DOM specs — start Bun, escape to Vitest if needed.
- e2e trigger policy (nightly vs per-PR-label) — start nightly + manual, tighten later.
- Where PDF fixtures live and licensing of sample PDFs — use self-authored minimal PDFs to avoid licensing issues.
