## Context

Margin is an MV3 Chrome extension (TypeScript, Vite, Bun) targeting PDF highlighting. The current scaffold proves content↔background messaging for PDF activation but uses untyped string messages and a background→content `chrome.tabs.sendMessage` call that fails (`Receiving end does not exist`) because the content script registers no matching listener. We are rebuilding the architecture before feature work (P2 pdf.js viewer, P3 selection/render, P4 persistence).

Reference architecture: the MIT-licensed `jeromepl/highlighter` extension, which avoids the messaging-listener problem entirely by exposing a `window.highlighterAPI` global and invoking it from the background via `chrome.scripting.executeScript`. We adopt that pattern, add static typing, and a typed storage layer.

Constraints: MV3 service worker (ephemeral, no DOM, module type), content scripts run per-frame, `executeScript` requires `scripting` permission + host access, structured-clone limits on message payloads (no functions/DOM nodes across `sendMessage`).

## Goals / Non-Goals

**Goals:**
- A single source of truth for message shapes shared across background/content/viewer.
- Compile-time guarantees: action name, request payload, and response type are linked so a wrong payload or response is a type error.
- A reliable background→page command path that does not depend on a content-side message listener being registered/alive.
- A typed `chrome.storage.local` wrapper with namespacing + a `version` field on stored records, ready for P4 migrations.
- Clear module boundaries so P2–P4 add files without reshaping the skeleton.

**Non-Goals:**
- No pdf.js, no viewer page logic (P2).
- No selection capture, highlight rendering, or anchoring (P3/P4).
- No UI (popup/hover tools), no colors, no context menus/shortcuts beyond what's needed to validate the bridge.
- No cross-device sync; storage is local only.

## Decisions

### D1: Discriminated-union message protocol over an enum-of-strings
Define messages as a discriminated union keyed by a literal `type`, with a `MessageMap` linking each `type` to its `request` and `response` types. A generic `sendMessage<T>` / `onMessage<T>` infers payload and response from the key.
- *Why:* the current enum gives a string but not a linked payload/response, so handlers cast manually. A map makes mismatches compile errors and gives autocomplete.
- *Alternatives:* (a) keep enum + manual interfaces — rejected, drift-prone; (b) a schema lib (zod) for runtime validation — deferred, adds a dep; revisit if untrusted message sources appear (they don't in P1).

### D2: executeScript + exposed `window.marginAPI` for background→page commands
Content script sets `window.marginAPI = { ... }` (typed) at init. Background runs `chrome.scripting.executeScript({ target: { tabId, allFrames: true }, func, args })` where `func` calls `window.marginAPI.*`. Results return via `executeScript`'s result array (flattened across frames).
- *Why:* eliminates the `Receiving end does not exist` class of bug — no listener handshake; injection targets whatever frame currently has the document/selection; `allFrames` handles the PDF-in-iframe case coming in P2.
- *Trade-off:* `func` is serialized and runs in an isolated world; it can only reference its `args` and page globals (hence the `window.marginAPI` global, not an import). We keep injected funcs tiny — thin shims that delegate to `marginAPI`.
- *Alternatives:* persistent long-lived port (`chrome.runtime.connect`) — heavier, still needs both ends alive; message + guaranteed-injected listener — still races against SW/content lifecycle.

### D3: Two messaging directions, two mechanisms
- content/popup → background: typed `sendMessage` + a background **action router** (`switch` on `type`, `wrapResponse(promise, sendResponse)` returning `true` for async). This direction is reliable because the SW message listener is always registered at top level.
- background → page: the D2 bridge, not `tabs.sendMessage`.
- *Why:* matches where each mechanism is reliable; avoids the broken direction entirely.

### D4: Storage layer as a typed facade with versioned records
`storage` module exposes typed `get/set/update/remove` over namespaced keys (e.g. `highlights:<docKey>`). Every stored record carries `{ version, ...payload }` where `version` = manifest version at write time. A `migrate(record)` seam exists but is a no-op in P1.
- *Why:* P4 re-anchoring is the highest-risk area and will need format migrations (highlighter shipped V3/V4/V5 formats). Baking `version` in now avoids a painful retrofit.
- *Alternatives:* raw `chrome.storage.local` calls at call sites — rejected, scatters key strings and serialization; IndexedDB — overkill for P1, revisit only if payload size demands it.

### D5: Module layout
```
src/
  shared/
    messaging/   protocol (MessageMap), sendMessage, onMessage, router types
    storage/     typed facade, record/version types, migrate seam
    types.ts     shared domain types
  background/    index.ts (router wiring + bridge callers)
  content/       index.ts (expose window.marginAPI), api/ (the API impl)
  viewer/        placeholder for P2 (empty or stub)
```
- *Why:* `shared/` is the contract surface both runtimes import; feature code in P2–P4 adds modules under these without moving the skeleton.

## Risks / Trade-offs

- [Injected `func` can't import modules] → keep injected functions as thin shims that only touch `window.marginAPI` + primitive args; all real logic lives in the content API module bundled into `content.js`.
- [`window.marginAPI` typing is a global `declare global`] → centralize the declaration in `shared` so background's injected-func signatures and content's implementation stay in sync.
- [SW is ephemeral; in-memory `tabId` tracking is lost on SW restart] → don't keep authoritative state in the SW; resolve the target tab at command time (`chrome.tabs.query`/`sender.tab`) rather than caching, mirroring highlighter's `getCurrentTab`.
- [No runtime validation of message payloads] → acceptable in P1 (all senders are first-party); add zod at the boundary later if needed.
- [`scripting` + host permissions broaden the extension's footprint] → scope host permissions narrowly; full `<all_urls>` only if P2 web-PDF support requires it (deferred — P2 is file:// first).

## Migration Plan

Internal refactor; no shipped users. Steps: (1) add `shared/messaging` + `shared/storage`; (2) port background to the action router + bridge; (3) port content to expose `window.marginAPI`, remove the dead command listener; (4) update manifest (`scripting`). Rollback = revert the change; no data migration since no persisted data exists yet.

## Open Questions

- Exact `docKey` scheme for storage namespacing (URL vs hash) — finalize in P4 when persistence lands; P1 only fixes the record-shape/version contract.
- Whether `viewer/` ships as an empty placeholder or is deferred entirely to P2 — leaning empty placeholder to lock the import path.
