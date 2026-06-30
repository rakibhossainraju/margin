## Context

P1 gives a background action router + executeScript bridge; P3 exposes `window.marginAPI.highlight.create`; P6 exposes color switching. This phase adds the fast entry points `jeromepl/highlighter` is known for — `Alt+H` to highlight, context-menu "Highlight", color switch shortcuts/submenu — but in Margin they target the viewer page and go through the typed bridge instead of `tabs.sendMessage`.

## Goals / Non-Goals

**Goals:**
- Keyboard command to highlight the current selection in the viewer.
- Keyboard command(s) to change the current color.
- Context-menu entry to highlight on selection, plus color submenu.
- All dispatch through P1 router + bridge.

**Non-Goals:**
- New highlighting/color logic (owned by P3/P6).
- Triggers on arbitrary web pages (Margin operates in its viewer; web-page highlighting is out of scope for this roadmap).
- Customizable keybindings UI.

## Decisions

### D1: Triggers are thin dispatchers
Command/context-menu listeners in the background resolve the target tab and call the bridge to invoke `window.marginAPI`. No logic beyond dispatch.
- *Why:* keeps one implementation of highlighting/color; triggers are interchangeable entry points (matches highlighter, which routes context-menu + shortcut + cursor all into `highlightText`).

### D2: executeScript bridge, not tabs.sendMessage
Reuse P1's `executeInTab` for all triggers.
- *Why:* avoids the `Receiving end does not exist` failure mode; consistent with the architecture.

### D3: Context menu contexts scoped to selection
"Highlight" appears on `contexts: ['selection']`; color entries as a submenu (radio for current color), rebuilt on install.
- *Why:* mirrors highlighter; only meaningful when text is selected.

### D4: Commands declared in manifest, handled in router
Add `commands` to manifest; `chrome.commands.onCommand` handled in the P1 background router alongside messages.
- *Why:* single dispatch surface in the SW.

## Risks / Trade-offs

- [Keyboard shortcut conflicts with browser/site shortcuts] → pick defaults aligned with highlighter (`Alt+H`), allow user remap via Chrome's shortcuts page (built-in), don't hard-depend on a specific combo.
- [Context menu only relevant in viewer] → document scope; entries operate via the bridge which is a no-op if `window.marginAPI` absent (non-viewer tab), failing safe.
- [SW ephemerality drops menu registration] → (re)create context menus on `onInstalled`/`onStartup`, as highlighter does.
- [Color-switch shortcuts proliferate] → consider a single cycle-color command plus optional per-color ones; keep manifest commands count reasonable.

## Migration Plan

Additive. Steps: (1) manifest `commands` + `contextMenus` permission; (2) create context menus on install/startup; (3) command + menu handlers in the P1 router dispatching via bridge; (4) wire to `highlight.create` and P6 color switch. Rollback = revert; no data changes.

## Open Questions

- Per-color shortcuts vs a single cycle command — start minimal (highlight + cycle), expand if requested.
- Whether to expose a "toggle highlighter cursor" mode like highlighter — defer; not core to v2.
