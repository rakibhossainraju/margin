## 1. Unit testing

- [ ] 1.1 Set up the unit runner (Bun test; add jsdom/happy-dom for DOM specs)
- [ ] 1.2 Tests for the whitespace-tolerant matcher (single/multi/partial node, whitespace, mismatch abort)
- [ ] 1.3 Tests for serialize/resolve round-trip incl. invalid-selector fallback
- [ ] 1.4 Tests for the storage migration seam with an older-record fixture
- [ ] 1.5 Add a `test:unit` script

## 2. E2E testing

- [ ] 2.1 Add `@playwright/test` + `playwright.config.ts`
- [ ] 2.2 Load `dist/` as an unpacked extension in a persistent Chromium context with file-URL access
- [ ] 2.3 Author minimal self-made PDF fixtures
- [ ] 2.4 E2E: open PDF in viewer + select + highlight
- [ ] 2.5 E2E: reload restores highlight; remove flow; export/import round-trip
- [ ] 2.6 Wait on text-layer presence (no fixed timeouts); add a `test:e2e` script

## 3. CI

- [ ] 3.1 GitHub Actions workflow: lint + typecheck + unit + build on push/PR
- [ ] 3.2 Separate e2e job on a defined trigger (nightly/manual/pre-release)

## 4. Release

- [ ] 4.1 Release script: clean → build → validate manifest/version → zip to `releases/margin-<version>.zip`
- [ ] 4.2 Verify zip contents exclude dev cruft
- [ ] 4.3 Add a `release` script

## 5. Validation

- [ ] 5.1 `test:unit` passes locally and in CI
- [ ] 5.2 `test:e2e` passes against a built extension
- [ ] 5.3 CI fails on an intentionally broken change; green on a clean one
- [ ] 5.4 Release script produces a loadable, store-ready zip
