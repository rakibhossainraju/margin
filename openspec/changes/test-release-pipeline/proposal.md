## Why

The riskiest logic (whitespace-tolerant matching in P3, CSS-path re-anchoring + migration in P4) is currently only manually checked. Without automated tests and a repeatable release process, regressions in anchoring will silently break highlights, and packaging will be error-prone. This phase hardens the project: unit tests for the high-risk engine, end-to-end tests in a real browser (Playwright, as `jeromepl/highlighter` uses), and build/release/CI automation. It's cross-cutting — light scaffolding lands early, full coverage lands here.

## What Changes

- Add a **unit test runner** (Bun's built-in test or Vitest) and tests for the anchoring/matching engine and the storage migration seam (highest-risk units).
- Add **Playwright e2e** tests that load the built extension in Chromium and verify core flows: open PDF in viewer, select + highlight, reload + restore, remove, export/import.
- Add **CI** (GitHub Actions): lint + typecheck + unit + build on push/PR; e2e on a defined trigger.
- Add a **release/package** script: produce a versioned, store-ready zip from `dist` with manifest validation.

## Capabilities

### New Capabilities

- `test-suite`: Automated unit tests for the high-risk engine/migration units and Playwright e2e tests covering core highlight flows in a real browser.
- `release-pipeline`: CI checks (lint/typecheck/unit/build) and a repeatable release packaging step producing a store-ready artifact.

### Modified Capabilities

<!-- None promoted to openspec/specs yet. Exercises all prior capabilities; adds no product behavior. -->

## Impact

- Code: `tests/unit/**`, `tests/e2e/**`, `playwright.config.ts`, `.github/workflows/*.yml`, `scripts/release.*`.
- Dependencies: a unit runner (Bun test or Vitest), `@playwright/test`.
- Build: release script depends on `bun run build` output; CI runs the existing lint/format/build scripts.
- Downstream: ongoing safety net for all future phases.
