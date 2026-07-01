# Architecture Rules

Margin (Chrome MV3 extension) is organized by **architectural layer**, not by
extension entry point. Read this before adding or moving any file.

These boundaries are enforced by ESLint (`eslint-plugin-boundaries`), not
just convention — see [Lint enforcement](#lint-enforcement) below. A
disallowed import fails `bun run lint`.

## Import aliases

Cross-layer imports use path aliases instead of relative `../../..` chains:
`@entries/*`, `@core/*`, `@adapters/*`, `@infrastructure/*`, `@ui/*`,
`@shared/*`, and `@/*` for `src/*` generally. Defined once in
`tsconfig.json` (`compilerOptions.paths`) — that's the single source of
truth. `vite-tsconfig-paths` makes Vite read the same config, and
`eslint-import-resolver-typescript` makes ESLint's boundaries rules read it
too, so nothing is duplicated. Same-directory imports (e.g. `./types`,
`./viewer.css`) stay relative — aliases are for imports that cross into
another folder.

## Layers and folder responsibilities

```
src/
├── entries/         startup/bootstrap for each extension entry point
├── core/             business logic, platform-independent
├── adapters/          translate platform specifics into things entries/core can use
├── infrastructure/     implementation details (messaging transport, storage, config)
├── ui/                 presentation logic only
└── shared/             small reusable utilities and cross-runtime contracts
```

### `entries/`
One subfolder per Chrome extension entry point: `background/`, `content/`,
`popup/`, `viewer/`. Each contains almost no application logic — only:
- registering listeners (`chrome.runtime.onMessage`, `chrome.commands`, DOM event listeners)
- initializing services (`configurePdfWorker()`, `setupDnrRules()`)
- dependency wiring — calling `core/`, `adapters/`, `infrastructure/`, `ui/`, `shared/`
- updating the UI

Entries are the only layer allowed to depend on every other layer.

### `core/`
Pure business logic. **Must never** import:
- `chrome.*`, `window`, `document` (enforced — see below)
- DOM APIs
- `pdfjs-dist` or any other browser-specific npm package (enforced)
- `adapters/` or `infrastructure/` (enforced)

Core should be portable to another runtime without modification — only pure
functions and platform-agnostic types/contracts belong here.

Examples: `core/viewport/zoom.ts` (`zoomIn`/`zoomOut`/`zoomReset` — pure
scale arithmetic), `core/viewport/pagination.ts` (`computeVisiblePage` —
pure geometry math). Named `viewport/`, not `viewer/`, deliberately: zoom
and pagination are viewport concepts, not tied to any specific viewer
implementation.

Messaging is **not** business logic and does not live here — see
[Messaging](#messaging).

### `adapters/`
Translate platform-specific APIs into data usable by the rest of the app.
Adapters may depend on `chrome.*`, DOM APIs, and browser-specific libraries
(PDF.js). They answer *"how do I obtain this platform capability?"* — they
never decide *when*/*why* to call it (`entries`), how to display the result
(`ui`), or how to persist/transmit it (`infrastructure`).

- `adapters/html/` — DOM-specific behavior (`selection.ts`: `getSelectedText()`,
  the `MarginAPI`/`window.marginAPI` contract)
- `adapters/pdf/` — PDF.js integration (`loader.ts`: worker setup + document
  loading; `renderer.ts`: canvas + text-layer page rendering)
- `adapters/browser/` — `chrome.tabs`/`chrome.scripting` wrappers (`bridge.ts`)

Only `entries/` is allowed to call into `adapters/` — `ui/` must not (see
[Dependency rules](#dependency-rules)).

### `infrastructure/`
Implementation details that support the app but hold no business rules. Also
allowed to depend on `chrome.*`. Answers *"how is this mechanism
implemented?"*, never *"what should the app do?"*.

- `infrastructure/messaging/` — `chrome.runtime.sendMessage` transport
  (`sendMessage`, `wrapResponse`)
- `infrastructure/storage/` — `chrome.storage.local` wrapper
  (`get`/`set`/`update`/`remove`) and its record types
- `infrastructure/dnr/` — `chrome.declarativeNetRequest` rule configuration

### `ui/`
Presentation logic only: DOM updates, rendering, visual state, overlays.
Never calls `chrome.storage`, `chrome.runtime`, or any `infrastructure/`
module directly (enforced), and never calls `adapters/` directly (enforced)
— receives data from `entries/` and renders it.

Example: `ui/viewer/elements.ts` (typed DOM element lookup),
`ui/viewer/errorOverlay.ts` (show/hide). Page rendering that has to call the
PDF.js adapter (`adapters/pdf/renderer.ts`) per page lives in
`entries/viewer/index.ts` instead of `ui/`, specifically because that
orchestration needs an adapter — see [Tradeoffs](#tradeoffs).

### `shared/`
Small reusable utilities, primitive types, and message contracts shared
between runtimes. No dependencies on any other layer (enforced — `shared/`
may not import anything, not even `core/`).

- `shared/url.ts` — `getFilename` (pure URL parsing)
- `shared/messaging/protocol.ts` — message contracts (`ExtensionCommand`,
  `MessageMap`, `MessageType`/`MessageRequest`/`MessageResponse`,
  `ChromeMessage`). Contracts, not transport or handling logic.

Do not let this become a dumping ground — if a utility clearly belongs to
one layer (touches DOM, holds business rules), it goes there instead.

## Messaging

Messaging is not business logic, so it is split across three layers, none of
them `core/`:

- **Contracts** (`shared/messaging/protocol.ts`) — request/response types,
  discriminated by message type. No transport, no chrome dependency.
- **Transport** (`infrastructure/messaging/index.ts`) — `sendMessage`/
  `wrapResponse`, the actual `chrome.runtime.sendMessage` calls.
- **Routing / handling** (`entries/background/index.ts`) — the
  `chrome.runtime.onMessage` listener registration and the (currently
  trivial) per-message-type handler logic. Handling what a message
  *means* is orchestration/wiring, not a portable business rule, so it
  stays in the entry that registers the listener rather than being
  extracted into `core/`.

## Dependency rules

```
entries        → core, adapters, infrastructure, ui, shared
ui             → core, shared
adapters       → shared
infrastructure → shared
core           → shared
shared         → (nothing)
```

Never:
```
core → chrome.* / window / document      (lint: no-restricted-globals, core/** override)
core → DOM
core → PDF.js / any external npm package  (lint: boundaries/dependencies, core/** override)
core → adapters                           (lint: boundaries/dependencies)
core → infrastructure                     (lint: boundaries/dependencies)
ui   → chrome.storage / chrome.runtime directly (go through infrastructure via entries)
ui   → adapters                           (lint: boundaries/dependencies)
ui   → infrastructure                     (lint: boundaries/dependencies)
```

## Lint enforcement

Configured in `.eslintrc.cjs` via `eslint-plugin-boundaries`:

- `settings['boundaries/elements']` maps each `src/<layer>/**` folder to an
  element type (`entries`, `core`, `adapters`, `infrastructure`, `ui`,
  `shared`).
- `settings['import/resolver']` is extended with `.ts` so the plugin can
  actually resolve relative imports (its default Node resolver only knows
  `.js`/`.json` and silently treats unresolved imports as passing).
- `rules['boundaries/dependencies']` encodes the allow-list above with
  `default: 'disallow'` — an import to a type not explicitly allowed is a
  lint error.
- An `overrides` block scoped to `src/core/**/*.ts` adds:
  - `no-restricted-globals` for `chrome`, `window`, `document` — these are
    ambient globals, not imports, so the `boundaries` plugin can't see them;
    this is the only way to catch `chrome.runtime.getURL(...)` written
    directly inside a `core/` file with no import statement.
  - A second `boundaries/dependencies` entry with `checkAllOrigins: true`
    (the base rule only checks imports of other `src/` elements by default,
    ignoring npm packages) so any external package import from `core/` is
    also `disallow`ed unless it's `shared/`.

Run `bun run lint` to check. To verify the rules actually fire (rather than
silently no-op), temporarily add a disallowed import to any file under
`src/core/` and confirm `bunx eslint <file>` reports it, then revert.

## Adding new code — quick decision guide

1. Is this a `chrome.runtime`/`chrome.commands`/DOM-`load` listener registration or top-level wiring? → `entries/<entry-name>/`
2. Does it call `chrome.*`, DOM, or `pdfjs-dist` to do something and return a usable value? → `adapters/<platform>/`
3. Does it call `chrome.*` purely as an implementation detail (storage, transport, config) with no branching business rule? → `infrastructure/<concern>/`
4. Is it a pure function/type with no platform dependency, expressing an app rule? → `core/<domain>/` — name the folder after the *concept* (`viewport`, `zoom`, `pagination`), not the UI implementation (`viewer`) or a source file's origin.
5. Does it only manipulate DOM for display, with no storage/messaging/business rule, and without needing to call an adapter? → `ui/<entry-name>/`
6. Is it a message contract, or a tiny generic dependency-free helper? → `shared/`

Don't create empty folders for hypothetical future features (`annotation/`,
`search/`, `sync/`, `ai/`, `document/`, `models/`, etc.). Add the folder when
the first real file for it exists, not before.

## Tradeoffs

- **`entries/viewer/index.ts` owns page-render orchestration** (the render
  queue, `renderAllPages`/cancellation) instead of `ui/viewer/`, because that
  orchestration has to call `adapters/pdf/renderer.ts` per page, and `ui/`
  is not allowed to depend on `adapters/`. The alternative (inventing a
  callback/injection scheme so `ui/` never touches the adapter) would add
  indirection with no current benefit — revisit if `ui/viewer/` grows enough
  that this file gets unwieldy.
- **`entries/background/index.ts` still contains the message handler body**
  (currently just a `console.log` for `PDF_ACTIVATED`) rather than a
  separate module, since messaging handling isn't core logic and the logic
  is trivial. If handlers grow non-trivial, extract them to
  `infrastructure/messaging/handlers.ts` (still not `core/`, since they'll
  likely need `chrome.runtime.MessageSender` or similar).
- **`adapters/browser/bridge.ts`** (`getActiveTab`, `executeInTab`) is
  unused, unexported scaffolding carried over from before this refactor —
  left in place rather than deleted, since removing unused-but-intentional
  scaffolding is a product decision, not an architecture one.
- **`infrastructure/storage`** is fully unused today (no feature calls
  `get`/`set`/`update` yet) — kept as-is since it's pre-existing, ready for
  the highlight-persistence feature.

## Future extension points

- New message types' handling logic → `entries/background/index.ts` (or
  `infrastructure/messaging/` if it grows past trivial).
- More PDF.js-specific behavior (e.g. text selection over rendered pages) →
  `adapters/pdf/`.
- Highlight-persistence feature → `infrastructure/storage` already has
  `get`/`set`/`update`/`remove` ready to wire up.
- New pure viewport rules (e.g. page-fit calculations) → `core/viewport/`.
