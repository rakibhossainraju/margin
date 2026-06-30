## 1. Module scaffold

- [ ] 1.1 Create directory layout: `src/shared/messaging/`, `src/shared/storage/`, `src/content/api/`, `src/viewer/` (placeholder)
- [ ] 1.2 Add a `src/viewer/index.ts` stub (empty entry) so the import path is locked for P2
- [ ] 1.3 Confirm Vite multi-entry config still builds background + content (and ignores the empty viewer stub or wires it as a no-op)

## 2. Messaging contract (shared)

- [ ] 2.1 Define `MessageMap` in `src/shared/messaging/protocol.ts`: each `type` literal → `{ request; response }`
- [ ] 2.2 Replace the old `MessageType` enum / `ChromeMessage` union in `src/shared/types.ts` with types derived from `MessageMap`
- [ ] 2.3 Implement typed `sendMessage<T>()` wrapper (content/popup → background) with inferred payload + response
- [ ] 2.4 Implement typed `onMessage`/router helper types and `wrapResponse(promise, sendResponse)` (async-safe, returns `true`)
- [ ] 2.5 Declare `window.marginAPI` global type once in `src/shared/messaging/` (`declare global`) as the shared bridge contract

## 3. Background action router

- [ ] 3.1 Register a single top-level `runtime.onMessage` listener that dispatches on `type`
- [ ] 3.2 Implement per-action handlers wired through `wrapResponse`; ignore unknown `type` without throwing
- [ ] 3.3 Resolve the target tab at command time via `chrome.tabs.query`/`sender.tab` (no cached `tabId` in SW state)

## 4. executeScript bridge

- [ ] 4.1 Add an `executeInTab({ tabId, func, args })` helper using `chrome.scripting.executeScript` with `allFrames: true`
- [ ] 4.2 Flatten multi-frame results and select the meaningful (non-empty) result
- [ ] 4.3 Port at least one command (replacing the broken `get-selection`/`getSelectedText` path) through the bridge to validate end-to-end
- [ ] 4.4 Remove the dead background→content `chrome.tabs.sendMessage` command path

## 5. Content API surface

- [ ] 5.1 Implement `src/content/api/index.ts` exporting the typed API methods
- [ ] 5.2 In `src/content/index.ts`, assign `window.marginAPI = api` at init (typed against the shared declaration)
- [ ] 5.3 Remove any content-side command listener that the bridge makes unnecessary

## 6. Storage layer

- [ ] 6.1 Define record/version types and the namespaced key scheme in `src/shared/storage/types.ts`
- [ ] 6.2 Implement the typed facade (`get`/`set`/`update`/`remove`) over `chrome.storage.local` in `src/shared/storage/index.ts`
- [ ] 6.3 Stamp `version` (manifest version) on every write
- [ ] 6.4 Add a `migrate(record)` seam invoked on read; no-op when versions match

## 7. Manifest + permissions

- [ ] 7.1 Add `scripting` permission to `public/manifest.json`
- [ ] 7.2 Restructure the `commands` wiring to route through the action router / bridge
- [ ] 7.3 Keep the existing PDF content-script match (viewer override deferred to P2)

## 8. Validation

- [ ] 8.1 `bun run build` passes (tsc --noEmit + both vite builds) with no type errors
- [ ] 8.2 Load unpacked; confirm a bridged command runs in the page with no "Receiving end does not exist" error
- [ ] 8.3 Confirm a storage round-trip (set → get) returns the typed, version-stamped record
- [ ] 8.4 Add MIT attribution headers to any files porting `jeromepl/highlighter` logic
