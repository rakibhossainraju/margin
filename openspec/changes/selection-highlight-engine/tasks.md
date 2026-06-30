## 1. Selection capture

- [ ] 1.1 Implement `captureSelection()` in `src/viewer/highlight/capture.ts` reading `window.getSelection()`
- [ ] 1.2 Normalize into a typed capture object (string, anchorNode, anchorOffset, focusNode, focusOffset, container)
- [ ] 1.3 Reject collapsed/empty selections

## 2. Recursive wrapper (ported)

- [ ] 2.1 Port `_recursiveWrapper` from jeromepl/highlighter to TS in `src/viewer/highlight/wrap.ts` with explicit types
- [ ] 2.2 Implement whitespace-tolerant character matching; abort on non-whitespace mismatch
- [ ] 2.3 Handle single-node, partial-node, and multi-node ranges via `splitText`
- [ ] 2.4 Add MIT attribution header crediting jeromepl/highlighter

## 3. Highlight element

- [ ] 3.1 Define `<margin-highlight>` custom element in `src/viewer/highlight/custom-element.ts` (idempotent registration)
- [ ] 3.2 Apply scoped styles (constructable stylesheet) with id + color, no global leakage
- [ ] 3.3 Render path assigns unique id and color to each created element

## 4. Render + remove + registry

- [ ] 4.1 Implement `createHighlight(capture, color)` returning the highlight id
- [ ] 4.2 Maintain an in-memory `id → capture` registry in the viewer
- [ ] 4.3 Implement `removeHighlight(id)` that unwraps and normalizes text back to original

## 5. API wiring

- [ ] 5.1 Add `highlight.create` / `highlight.remove` to the `window.marginAPI` implementation
- [ ] 5.2 Extend the shared `window.marginAPI` type declaration accordingly
- [ ] 5.3 Verify invocation via the background executeScript bridge reaches the viewer

## 6. Tests + validation

- [ ] 6.1 Unit-test the whitespace-tolerant matcher (highest-risk function): single/multi/partial node, whitespace diffs, mismatch abort
- [ ] 6.2 Manual: select PDF text → highlight appears over exact range
- [ ] 6.3 Manual: create then remove → text restored and still selectable
- [ ] 6.4 `bun run build` passes with no type errors
