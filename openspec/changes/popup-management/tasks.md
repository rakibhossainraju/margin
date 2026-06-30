## 1. Framework decision + scaffold

- [ ] 1.1 Decide popup UI framework (vanilla/Web Components default; React/Preact only if reuse justifies) and record it
- [ ] 1.2 Scaffold `src/popup/` page + Vite entry per the decision

## 2. Data

- [ ] 2.1 Resolve the active viewer tab's docKey (from `?file=`)
- [ ] 2.2 Load the document's highlights from P4 `highlight-store`
- [ ] 2.3 Subscribe to `chrome.storage.onChanged` to keep the list live

## 3. List UI

- [ ] 3.1 Render list items (text snippet + color swatch via P6 registry)
- [ ] 3.2 Empty/"open a PDF" state when no viewer active
- [ ] 3.3 Indicate lost/unanchored highlights

## 4. Actions

- [ ] 4.1 Add `highlight.scrollTo(id)` to the viewer `window.marginAPI`
- [ ] 4.2 Jump-to: popup → background → bridge → `scrollTo`
- [ ] 4.3 Single remove via P4; viewer syncs via `storage.onChanged`
- [ ] 4.4 Remove-all via P4; viewer syncs

## 5. Validation

- [ ] 5.1 Manual: open popup → lists current doc highlights
- [ ] 5.2 Manual: click item → viewer scrolls to it
- [ ] 5.3 Manual: remove + remove-all → gone in viewer and after reload
- [ ] 5.4 Manual: edits in viewer reflect in open popup (storage.onChanged)
- [ ] 5.5 `bun run build` passes with no type errors
- [ ] 5.6 Attribution where popup logic is adapted from jeromepl/highlighter (MIT)
