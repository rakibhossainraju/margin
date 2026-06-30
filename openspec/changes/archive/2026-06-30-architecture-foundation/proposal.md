## Why

The current extension wires cross-context communication with stringly-typed `chrome.runtime.sendMessage` / `chrome.tabs.sendMessage` calls. The background→content direction already fails at runtime (`Could not establish connection. Receiving end does not exist.`) because no content listener is guaranteed, and there is no shared type contract, so message shape drift is caught only at runtime. Before building the PDF highlighter capabilities (viewer, selection, highlight rendering, persistence), we need a typed, reliable architectural skeleton that every later phase plugs into. This phase ships that skeleton — no user-facing features.

## What Changes

- Define explicit module boundaries: `background/`, `content/`, `viewer/` (placeholder for P2), and `shared/` for cross-context contracts.
- Introduce a **type-safe message protocol**: a discriminated union of message types with typed request/response pairs, replacing ad-hoc string matching.
- Add an **action router** in the background worker (one typed handler per message action, async-safe response wrapping).
- Replace the broken `chrome.tabs.sendMessage` command path with an **`executeScript` + exposed-API bridge**: the content script exposes a typed `window.marginAPI`, and the background injects functions that call it (`chrome.scripting.executeScript`, `allFrames: true`). No reliance on a content-side message listener for commands.
- Add a **typed storage abstraction** over `chrome.storage.local`: namespaced keys, typed get/set, and a store-format `version` field to enable future migrations (needed by P4 persistence).
- Update the manifest for the new architecture (`scripting` permission; keep existing PDF match for now — viewer override lands in P2).
- **BREAKING** (internal only): the existing `MessageType` enum and the `getSelectedText`/`get-selection` command path are restructured; no public API exists yet, so no external impact.

## Capabilities

### New Capabilities

- `messaging-protocol`: Type-safe cross-context messaging — a discriminated-union message contract, a background action router with async-safe responses, and the `executeScript` + exposed-`window.marginAPI` bridge for background→page command execution.
- `storage-layer`: A typed, namespaced abstraction over `chrome.storage.local` with versioned store entries, providing the persistence primitive later phases build on.

### Modified Capabilities

<!-- None — pdf-activation is not yet promoted to openspec/specs; this change supersedes its messaging scaffold internally. -->

## Impact

- Code: `src/shared/` (new message + storage contracts), `src/background/index.ts` (router + bridge invocation), `src/content/index.ts` (expose `window.marginAPI`, drop the unanswered command listener), new `src/shared/messaging/` and `src/shared/storage/` modules.
- Manifest: add `scripting` permission; restructure `commands` wiring.
- Dependencies: none new at runtime; `@types/chrome` already present.
- Downstream: P2–P4 depend on these contracts. The anchoring/persistence engine (P4) consumes `storage-layer`; all command/feature wiring (P3, P5–P7) consumes `messaging-protocol`.
