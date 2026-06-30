## Why

Highlighting currently requires the hover toolbar / in-viewer interaction. Power users expect fast triggers: a keyboard shortcut to highlight the current selection, a right-click context-menu entry, and shortcuts to switch color. This phase wires those triggers, all routed through P1's typed messaging + executeScript bridge into the P3/P6 engine — no new highlighting logic, just new entry points.

## What Changes

- Register **keyboard commands** (manifest `commands`): highlight current selection, and switch current color (one per palette color or a cycle).
- Add a **context-menu** entry (on text selection) to highlight, and color submenu entries, mirroring `jeromepl/highlighter`.
- Route every trigger through the background **action router** + **executeScript bridge** (P1) to call `window.marginAPI.highlight.create` / the P6 color system in the viewer.
- Keep triggers working specifically in the Margin viewer context (where selection is available).

## Capabilities

### New Capabilities

- `command-triggers`: Keyboard shortcuts and context-menu entries that trigger highlight creation and color changes, dispatched via the background action router and executeScript bridge.

### Modified Capabilities

<!-- None promoted to openspec/specs yet. Consumes P1 messaging-protocol (router + bridge), P3 highlight-render (create), P6 color-system (color switch). -->

## Impact

- Code: background command/context-menu listeners (extend P1 router); manifest `commands` + `contextMenus` permission; trigger handlers call the bridge.
- Manifest: `commands` entries, `contextMenus` permission.
- Ported concept: command + context-menu wiring from `jeromepl/highlighter` (MIT) — reimplemented typed.
- Downstream: none in v2; these are leaf entry points.
