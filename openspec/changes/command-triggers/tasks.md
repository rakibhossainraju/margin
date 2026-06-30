## 1. Manifest

- [ ] 1.1 Add `commands` entries: highlight-selection and change/cycle color
- [ ] 1.2 Add `contextMenus` permission

## 2. Context menus

- [ ] 2.1 Create context menus on `onInstalled`/`onStartup` (Highlight on selection + color submenu)
- [ ] 2.2 Handle `contextMenus.onClicked` in the background router

## 3. Commands

- [ ] 3.1 Handle `chrome.commands.onCommand` in the background router
- [ ] 3.2 Resolve the target tab and dispatch via P1 `executeInTab`

## 4. Dispatch to engine

- [ ] 4.1 Highlight triggers call `window.marginAPI.highlight.create` via the bridge
- [ ] 4.2 Color triggers call the P6 color-system set-current-color
- [ ] 4.3 Fail safe (no error) when `window.marginAPI` is absent in the target tab

## 5. Validation

- [ ] 5.1 Manual: select text in viewer, press shortcut → highlighted
- [ ] 5.2 Manual: right-click selection → Highlight works; color submenu changes color
- [ ] 5.3 Manual: color shortcut changes current color
- [ ] 5.4 Manual: trigger in a non-viewer tab → no-op, no console error
- [ ] 5.5 `bun run build` passes with no type errors
- [ ] 5.6 Attribution where command/menu wiring is adapted from jeromepl/highlighter (MIT)
